# ReelsStack

An end-to-end AI pipeline that turns a simple topic into a fully rendered, captioned MP4 short — from script generation to cloud rendering.

This document details the complete architectural flow of ReelsStack, describing exactly how data moves from user input to the final rendered video.

## Table of Contents

1. [Authentication & User Storage](#1-authentication--user-storage)
2. [Video Creation Inputs](#2-video-creation-inputs)
3. [Processing Pipeline & Service Delegation](#3-processing-pipeline--service-delegation)
4. [Database Storage](#4-database-storage)
5. [Synchronization and Cloud Rendering](#5-synchronization-and-cloud-rendering)
6. [Summary of External APIs and Services Used](#summary-of-external-apis-and-services-used)

---

## 1. Authentication & User Storage

**Flow:**
When a user arrives at the platform, they must sign up or sign in. This is entirely handled by **Clerk**. Clerk provides secure, hosted authentication pages and manages the user session on the client and server via middleware.

**Where user details are stored:**
Upon a user's first login, their core details (UUID, email, name, profile image) provided by Clerk are synced and saved into our **PostgreSQL Database** (hosted on **Neon DB** and queried using **Drizzle ORM**). This `users` table allows us to easily relate generated videos back to the user who created them.

---

## 2. Video Creation Inputs

**Flow:**
Once authenticated, the user navigates to the `/dashboard/create-new` route.

**What inputs the user gives:**
The user fills out a form specifying exactly what they want:

1. **Topic** — e.g., "History of the Roman Empire"
2. **Image Style** — e.g., Cinematic, Anime, Realistic
3. **Voiceover** — selecting a specific AI voice model
4. **Caption Style** — e.g., Classic, Supreme, Glitch
5. **Duration** — e.g., 30 seconds

---

## 3. Processing Pipeline & Service Delegation

When the user clicks "Create," the Next.js frontend sequentially orchestrates calls to our Next.js API Routes, which in turn communicate with various AI models.

### Step A: The Script (Gemini)
- **Where inputs go:** The `Topic`, `Duration`, and `Image Style` are passed to the `/api/get-video-script` route.
- **Who generates it:** **Gemini AI**.
- **Output:** A strict JSON array containing scenes. Each scene has a specific `imagePrompt` (incorporating the user's selected Image Style) and a `contentText` (for the voiceover).

### Step B: The Visuals (Hugging Face / Flux)
- **Where inputs go:** The script's `imagePrompt`s are passed to `/api/generate-image`.
- **Who generates it:** The **Hugging Face API** (Stable Diffusion XL). If Hugging Face times out or hits a rate limit, the API gracefully falls back to a free **Pollinations Flux** model.
- **Storage:** The generated Base64 images are immediately uploaded to **Cloudinary** for secure cloud storage.

### Step C: The Audio (ElevenLabs)
- **Where inputs go:** All of the script's `contentText` is combined and sent alongside the user's selected `Voice` to `/api/generate-audio`.
- **Who generates it:** **ElevenLabs API** generates a highly realistic MP3 voiceover.
- **Storage:** The resulting MP3 is uploaded to **Cloudinary**.

### Step D: The Timestamps (Deepgram)
- **Where inputs go:** The Cloudinary URL of the generated audio is sent to `/api/generate-captions`.
- **Who generates it:** **Deepgram**.
- **Output:** Deepgram analyzes the audio and returns a JSON array of words, each with exact millisecond-accurate `start` and `end` timestamps.

---

## 4. Database Storage

Once all APIs have returned their results successfully, the frontend compiles everything and posts it to the `/api/videos` route.

**Where data is stored:**
The data is saved as a new row in the `videos` table in our **Neon DB (PostgreSQL)**.
- The physical media (images and MP3) live in **Cloudinary**.
- The database stores the **Cloudinary URLs** (`audioUrl`, `imageUrls`), the **Deepgram timestamps** (`captions` JSON), and the **Gemini script** (`script` JSON).

---

## 5. Synchronization and Cloud Rendering

When the user is ready to view the final output, the platform initiates the rendering process.

### Triggering the Render (GitHub Actions & PAT_TOKEN)
The Next.js backend hits `/api/videos/[videoId]/render`. Because video rendering is too CPU-intensive and long-running for Vercel's serverless functions, a GitHub Personal Access Token (**PAT_TOKEN**) is used to securely call the GitHub REST API (`workflow_dispatch`). This triggers a GitHub Actions CI/CD runner. Only the `videoId` and basic configs (like 1080x1920, 30fps) are passed to the action.

### Synchronization (Remotion)
Inside the GitHub Action, a **Remotion** instance spins up. It queries the Neon database using the `videoId` to fetch the Cloudinary URLs and caption timestamps.

- **Time Calculation:** Remotion looks at the final word's `end` timestamp from Deepgram and multiplies it by the FPS to set the exact video duration.
- **Caption Sync:** As Remotion renders frame-by-frame, it calculates the current time (`frame / fps`). It checks the Deepgram JSON and dynamically renders whichever word's `start` and `end` times encompass the current frame.
- **Image Sync:** Remotion divides the total video duration by the number of Cloudinary images. Using `<Sequence>` components, it perfectly spaces the images so they transition exactly as the audio progresses.

### Final Output
Remotion compiles these perfectly synced assets into a final `.mp4` file directly on the GitHub Actions runner, which is then made available for the user to view and download on their dashboard.

---

Think of this path as **one application asking another computer to do a heavy job**.

```text
/api/videos/[videoId]/render
          ↓
    GitHub REST API
          ↓
    GitHub Actions Runner
          ↓
       Remotion
          ↓
         MP4
```

The important distinction is:

> **GitHub REST API starts the job. GitHub Actions provides the computer. Remotion does the actual video rendering.**

Let's go through your exact architecture.

---

## 1. `/api/videos/[videoId]/render` — Your Next.js API route

This is the **entry point** of the rendering process.

Suppose the user has created a video with ID `123`.

When they click **Render Video**, your frontend calls:

```text
POST /api/videos/123/render
```

Your Next.js backend receives this request.

### What does this route actually do?

It does **not** render the video.

Instead, it prepares the rendering job and tells GitHub Actions to start.

Conceptually:

```text
User clicks Render
        ↓
Next.js API route
        ↓
Check videoId = 123
        ↓
Tell GitHub to start rendering
        ↓
Return response to frontend
```

For example, your backend might send:

```json
{
  "ref": "main",
  "inputs": {
    "videoId": "123"
  }
}
```

The exact payload depends on how you configured your workflow.

### Why is this useful?

Because the Next.js request finishes quickly.

It doesn't have to wait for:

```text
Generate 3,000 frames
        ↓
Encode MP4
        ↓
Upload MP4
```

Instead, it says:

> **"The rendering job has been started. GitHub will handle the heavy work."**

---

# 2. GitHub REST API — The communication mechanism

Now, how does your Next.js backend tell GitHub to start something?

Through the **GitHub REST API**.

Think of the REST API as a **remote control for GitHub**.

Your backend sends an HTTP request to GitHub saying:

> "Please start this workflow in my repository."

For example:

```text
Next.js Backend
      ↓
HTTP POST request
      ↓
GitHub REST API
```

The API receives the request and understands:

> "This application wants to trigger a workflow."

### What does the PAT token do?

Your backend needs permission to perform that action.

So it sends a **PAT_TOKEN** with the request.

Think of it as:

```text
GitHub REST API
      ↑
      |
PAT_TOKEN = authorization
      |
Next.js Backend
```

The token proves that your backend is authorized to trigger the workflow.

**Important:** The PAT token is not doing the rendering. It only authorizes the request.

---

# 3. `workflow_dispatch` — The actual trigger

This is the part that many people confuse with the REST API.

They are **not the same thing**.

### GitHub REST API

The REST API is the **communication method**.

### `workflow_dispatch`

`workflow_dispatch` is the **event that starts your workflow**.

Think of it like this:

```text
REST API = telephone
workflow_dispatch = "Start the job" command
```

Your backend uses the REST API to send a `workflow_dispatch` event.

```text
Next.js
   ↓
GitHub REST API
   ↓
workflow_dispatch
   ↓
GitHub starts workflow
```

### What is a workflow?

A workflow is a YAML file in your GitHub repository.

For example:

```yaml
name: Render Video

on:
  workflow_dispatch:
    inputs:
      videoId:
        required: true
```

This means:

> "GitHub, whenever someone manually triggers this workflow, start the rendering process and accept a videoId."

Your Next.js backend triggers it programmatically.

So instead of a developer clicking **Run workflow** in GitHub's UI, your application does it.

---

# 4. GitHub Actions — The job execution system

Now the workflow has been triggered.

What happens?

**GitHub Actions starts a runner.**

A runner is basically a **temporary computer provided by GitHub**.

Think of it as:

> "Here is a machine. Run the commands in your workflow on it."

For example:

```text
GitHub Actions
       ↓
Start runner
       ↓
Checkout your repository
       ↓
Install dependencies
       ↓
Run rendering command
```

### What exactly does GitHub Actions do?

It manages the **execution of your rendering job**.

For example, your workflow might contain steps like:

```yaml
steps:
  - Checkout repository
  - Setup Node.js
  - Install dependencies
  - Run Remotion render command
```

So GitHub Actions is responsible for:

* Starting the runner
* Preparing the environment
* Downloading your code
* Installing dependencies
* Running the rendering command
* Managing the workflow execution

**It is not the video rendering engine.**

It is the system that **runs the commands that perform the rendering**.

---

# 5. GitHub Actions Runner — The actual computer

This is the physical/virtual machine where the work happens.

Your architecture says:

```text
GitHub Actions Runner
        ↓
Remotion
```

That means:

> **Remotion is running ON the GitHub Actions runner.**

The runner provides the CPU, memory, operating system, Node.js environment, etc.

Think of it like:

```text
Runner = Computer
Remotion = Software running on that computer
```

For example:

```text
GitHub Runner
 ├── Node.js
 ├── Your ReelsStack code
 ├── Remotion
 ├── Chromium
 └── Other dependencies
```

The runner is what actually performs the computation.

---

# 6. Remotion — The actual video rendering engine

This is the most important part.

**Remotion is the software that creates the video.**

Your project uses React components to describe what each frame should look like.

For example, conceptually:

```jsx
<VideoComposition>
  <Image />
  <Audio />
  <Caption />
</VideoComposition>
```

Remotion takes these components and renders them into actual video frames.

### What does Remotion do?

It:

1. Fetches the images from Cloudinary.
2. Fetches the audio from Cloudinary.
3. Reads the caption timestamps.
4. Calculates what should appear at each frame.
5. Renders the frames.
6. Encodes them into an MP4.

For example:

```text
Frame 0
  ↓
Show Image 1
Show Caption 1

Frame 30
  ↓
Show Image 1
Show Caption 2

Frame 60
  ↓
Show Image 2
Show Caption 3
```

At 30 FPS:

```text
frame / 30 = current time in seconds
```

So Remotion knows:

> "At this frame, which image should be visible? Which caption should be visible?"

---

# 7. How Remotion uses your Neon DB and Cloudinary

This is where your architecture becomes interesting.

The GitHub runner receives only:

```text
videoId = 123
```

It does **not** need the entire video data in the trigger request.

Instead, Remotion's rendering code uses that ID to fetch the data.

```text
GitHub Runner
      ↓
Remotion
      ↓
Query Neon DB
      ↓
Get video metadata
      ↓
Cloudinary URLs
      ↓
Download images + audio
      ↓
Render
```

For example, Neon might contain:

```json
{
  "id": "123",
  "audioUrl": "https://cloudinary.com/audio.mp3",
  "imageUrls": [
    "https://cloudinary.com/image1.png",
    "https://cloudinary.com/image2.png"
  ],
  "captions": [
    {
      "word": "Roman",
      "start": 0.0,
      "end": 0.4
    },
    {
      "word": "Empire",
      "start": 0.4,
      "end": 0.8
    }
  ]
}
```

Remotion uses this information to build the video.

### Why fetch from DB instead of passing everything through GitHub?

Because the rendering job only needs a **reference**:

```text
videoId = 123
```

The actual data is already stored in your database and cloud storage.

This keeps the trigger request small and makes the architecture cleaner.

---

# 8. What happens inside Remotion?

Let's say your video is:

```text
Duration = 30 seconds
FPS = 30
```

Then:

```text
Total frames = 30 × 30 = 900 frames
```

Remotion renders those frames.

### Image synchronization

Suppose you have 3 images.

Remotion divides the video duration among them:

```text
0s ───────── 10s ───────── 20s ───────── 30s
   Image 1       Image 2       Image 3
```

### Caption synchronization

Suppose Deepgram says:

```json
[
  { "word": "Hello", "start": 0.0, "end": 0.5 },
  { "word": "world", "start": 0.5, "end": 1.0 }
]
```

At frame 15:

```text
15 / 30 = 0.5 seconds
```

Remotion checks:

```text
Which word is active at 0.5 seconds?
```

Answer:

```text
world
```

So it displays **world**.

That is how captions stay synchronized with the audio.

---

# 9. Final MP4 — The output

After Remotion finishes rendering:

```text
Images + Audio + Captions
          ↓
       Remotion
          ↓
    Video frames
          ↓
    MP4 encoding
          ↓
       final.mp4
```

The result is a real video file.

Not a React component.

Not a JSON response.

An actual:

```text
.mp4
```

that the user can watch.

---

# Complete flow with every role

```text
USER
  │
  │ Clicks "Render Video"
  ▼
NEXT.JS API ROUTE
/api/videos/[videoId]/render
  │
  │ "Start rendering video 123"
  ▼
GITHUB REST API
  │
  │ Authenticated using PAT_TOKEN
  │ Sends workflow_dispatch
  ▼
GITHUB ACTIONS
  │
  │ Starts workflow
  ▼
GITHUB ACTIONS RUNNER
  │
  │ Temporary computer
  │ Downloads your code
  │ Installs dependencies
  ▼
REMOTION
  │
  │ Fetches video data from Neon
  │ Fetches media from Cloudinary
  │ Calculates frames
  │ Synchronizes captions
  │ Renders video
  ▼
FINAL MP4
```

---

## The most important interview distinction

If the interviewer asks:

> **"What exactly is GitHub Actions doing?"**

Say:

> **"GitHub Actions is responsible for executing the rendering workflow on a hosted runner. It prepares the environment, installs dependencies, and runs the Remotion rendering command."**

If they ask:

> **"What exactly is Remotion doing?"**

Say:

> **"Remotion is the actual video rendering engine. It takes the images, audio, and caption timestamps, calculates what should appear at each frame, and encodes those frames into the final MP4."**

If they ask:

> **"What is workflow_dispatch?"**

Say:

> **"`workflow_dispatch` is the event that allows my Next.js backend to manually trigger a GitHub Actions workflow programmatically."**

If they ask:

> **"What is the GitHub REST API?"**

Say:

> **"The GitHub REST API is the HTTP interface my Next.js backend uses to communicate with GitHub and trigger the workflow."**

### Final mental model

**REST API → sends the command**
**workflow_dispatch → starts the workflow**
**GitHub Actions → manages the job**
**Runner → provides the computer**
**Remotion → creates the video**


## Summary of External APIs and Services Used

| # | Service | Role |
|---|---------|------|
| 1 | **Next.js 15 (App Router)** | The core full-stack framework bridging the frontend and backend. |
| 2 | **Clerk** | Robust authentication, session management, and UI logic for signing up/in. |
| 3 | **Neon DB & Drizzle ORM** | Serverless PostgreSQL database for storing user relationships and heavy JSON metadata, interfaced with type-safe queries. |
| 4 | **Gemini API** | LLM handling the structural logic, script writing, and image prompt engineering. |
| 5 | **Hugging Face API** | Image generation (Stable Diffusion) for scene visuals. |
| 6 | **ElevenLabs** | Premium Text-to-Speech API for the voiceover. |
| 7 | **Deepgram** | Ultra-fast Speech-to-Text API used exclusively to extract timing data for captions. |
| 8 | **Cloudinary** | Cloud blob storage to hold the generated `.png` and `.mp3` files securely. |
| 9 | **GitHub Actions & PAT_TOKEN** | An ingenious, free serverless compute cluster for video rendering. The PAT Token securely authorizes the Next.js app to trigger the render. |
| 10 | **Remotion** | A React-based video rendering engine that programmatically stitches the React components, images, audio, and text into a real MP4. |