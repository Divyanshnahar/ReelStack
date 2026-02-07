# ReelsStack: AI-Powered Short Video Generation

ReelsStack is a full-stack AI application that automates the creation of engaging short videos. It integrates modern AI services with a scalable rendering pipeline powered by GitHub Actions and Remotion.

---

## Technical Stack

- **Frontend:** Next.js 15, Tailwind CSS, Shadcn UI  
- **Backend:** API Routes, Drizzle ORM, Neon DB (PostgreSQL)  
- **Auth:** Clerk  
- **AI Services:**  
  - Gemini AI (script generation)  
  - Pollinations.ai Flux model (image generation)  
  - Microsoft Edge TTS (audio)  
  - Deepgram (captions)  
- **Video Composition:** Remotion  
- **Rendering & CI/CD:** GitHub Actions  
- **Media Hosting:** Cloudinary  

---

## Video Generation Workflow

ReelsStack’s video generation pipeline consists of six distinct stages, ensuring a streamlined and automated video creation process:

### Script Generation (Gemini AI)

The workflow begins when a user submits a topic and desired style. The Gemini AI API then generates a detailed, scene-wise script, complete with image prompts and narration text for each segment.

### Image Generation (Pollinations.ai)

Following script generation, each scene's image prompt is sent to Pollinations.ai, which utilizes the Flux model to create relevant visual content. These generated images are then uploaded to Cloudinary, and their secure URLs are returned for subsequent steps.

### Audio Generation (Microsoft Edge TTS)

With all images in place, the combined narration text from the entire script is processed by Microsoft Edge TTS. This generates an MP3 audio stream, which is subsequently uploaded to Cloudinary for hosting.

### Captioning (Deepgram)

Once the audio is hosted on Cloudinary, its URL is sent to the Deepgram API. Deepgram then transcribes the audio, providing a precise, word-level transcript complete with timestamps, essential for accurate caption synchronization in the final video.

### Rendering (Remotion + GitHub Actions)

Upon the successful generation and storage of all necessary assets, the complete video data is saved. This action triggers a GitHub Actions workflow, which fetches the video data, utilizes Remotion to compose and render the video, and finally uploads the resulting `.mp4` file as a GitHub artifact.

### Download

Once the rendering process is complete and the GitHub Action confirms the video artifact is available, users can easily download their finished video.

---

## Features

- **Effortless Script Creation:** Generate video scripts instantly by simply providing a topic.  
- **Automated Visuals:** ReelsStack automatically generates relevant images for each scene.  
- **Professional Voiceovers:** Your scripts are converted into natural-sounding voiceovers.  
- **Dynamic Captions:** Videos come with synchronized, word-level captions for enhanced engagement.  
- **Cloud-Powered Video Production:** Your videos are composed and rendered efficiently in the cloud, ready for download.  
- **Personalized Customization:** Choose from various video styles, voices, durations, and caption effects to make each video unique.  
- **Easy Video Management:** A user-friendly dashboard allows you to track and manage all your created videos.  
- **Community Inspiration:** Explore a gallery of videos created by other users.  

---

## Project Structure

```
.
├── app/
│   ├── (dashboard)/        # User dashboard routes
│   ├── api/                # Backend APIs (scripts, images, audio, captions, rendering)
├── components/             # Reusable UI components
├── config/                 # DB, Gemini config, schema
├── drizzle/                # Drizzle ORM migrations
├── lib/                    # Cloudinary + utility functions
├── remotion/               # Remotion composition files
├── scripts/                # GitHub Actions helper scripts
├── .github/workflows/      # Rendering pipeline via GitHub Actions

```

### License

This project is licensed under the MIT License.

