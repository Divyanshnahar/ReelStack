<div align="center">

```
██████╗ ███████╗███████╗██╗     ███████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔════╝██║     ██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
██████╔╝█████╗  █████╗  ██║     ███████╗    ███████╗   ██║   ███████║██║     █████╔╝ 
██╔══██╗██╔══╝  ██╔══╝  ██║     ╚════██║    ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ 
██║  ██║███████╗███████╗███████╗███████║    ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

### 🎬 AI-Powered Short Video Generation Platform

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**[🚀 Live Demo →](https://reel-stack-9mcf.vercel.app/)**

</div>

---

## 🧠 What is ReelsStack?

**ReelsStack** is a full-stack AI SaaS application that automates the end-to-end creation of engaging short-form videos. From a simple topic idea, it generates scripts, creates AI images for each scene, produces professional voiceovers, auto-captions the audio, and renders a final `.mp4` video — entirely in the cloud.

### ✨ What Users Can Do

| Capability | Description |
|---|---|
| 📝 **Script Generation** | Generate structured scene scripts from a topic, style, and duration |
| 🖼️ **AI Image Creation** | Auto-generate cinematic 1080×1920 images per scene |
| 🎙️ **AI Voiceover** | Convert narration into professional MP3 via ElevenLabs |
| 📄 **Auto Captions** | Word-level synchronized captions via Deepgram |
| ☁️ **Cloud Rendering** | Render final video using Remotion + GitHub Actions |
| 🗂️ **Dashboard** | Manage, download, edit, and delete your videos |

---

## 🚀 Architecture Flow

```
User Input
    ↓
🤖 Gemini AI  ──────────────────►  Structured JSON Script
    ↓
🖼️ Hugging Face (SDXL)  ─────────►  Scene Images (1080×1920)
    ↓
🎙️ ElevenLabs  ──────────────────►  MP3 Voiceover
    ↓
📄 Deepgram  ────────────────────►  Word-Level Captions
    ↓
☁️ Cloudinary  ──────────────────►  Asset Storage
    ↓
🎬 Remotion + GitHub Actions  ───►  Rendered .mp4 Video
    ↓
✅ Final Video → User Dashboard
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** — App Router, server components, API routes
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/)** — Accessible, customizable components
- **[Axios](https://axios-http.com/)** — HTTP client

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — Serverless endpoints
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe database access
- **[PostgreSQL (Neon DB)](https://neon.tech/)** — Scalable serverless Postgres

### Authentication
- **[Clerk](https://clerk.com/)** — Session management, user auto-creation on first login

### AI Services

| Service | Purpose |
|---|---|
| **[Gemini AI](https://deepmind.google/technologies/gemini/)** | Script generation |
| **[Hugging Face SDXL](https://huggingface.co/)** | Scene image generation |
| **[ElevenLabs](https://elevenlabs.io/)** | Text-to-speech voiceover |
| **[Deepgram](https://deepgram.com/)** | Word-level audio captions |

### Media & Rendering
- **[Cloudinary](https://cloudinary.com/)** — Image & audio cloud storage
- **[Remotion](https://www.remotion.dev/)** — Programmatic video composition
- **[GitHub Actions](https://github.com/features/actions)** — Cloud rendering pipeline

---

## 📂 Project Structure

```
ReelsStack/
├── app/
│   ├── (dashboard)/          # Dashboard routes & pages
│   └── api/
│       ├── videos/           # Video CRUD operations
│       ├── generate-image/   # HuggingFace image generation
│       ├── generate-audio/   # ElevenLabs voiceover
│       ├── get-video-script/ # Gemini script generation
│       └── ...
├── components/               # Reusable UI components
├── config/                   # App-wide configuration
├── drizzle/                  # DB schema & migrations
├── lib/                      # Utility functions
├── remotion/                 # Video composition logic
├── scripts/                  # Helper scripts
└── .github/
    └── workflows/            # GitHub Actions CI/CD
```

---

## ⚡ Core Features Deep Dive

### 1️⃣ AI Script Generation

Users provide a **topic**, **style**, and **duration**. Gemini AI returns a structured JSON array:

```json
[
  {
    "imagePrompt": "Cinematic aerial view of a futuristic city at sunset",
    "contentText": "Welcome to the cities of tomorrow, where technology meets humanity."
  }
]
```

### 2️⃣ AI Image Generation (Hugging Face SDXL)

- Each scene's `imagePrompt` is sent to Stable Diffusion XL
- Images generated in **1080×1920** portrait format
- Uploaded to Cloudinary and stored securely

### 3️⃣ AI Voiceover (ElevenLabs)

- All scene `contentText` fields are combined
- Converted to MP3 using ElevenLabs' professional voice models
- Uploaded to Cloudinary for cloud storage

### 4️⃣ Auto Captions (Deepgram)

- Cloudinary audio URL sent to Deepgram
- **Word-level timestamps** extracted
- Captions synchronized frame-by-frame in Remotion

### 5️⃣ Cloud Video Rendering (Remotion + GitHub Actions)

- Video metadata saved to PostgreSQL
- GitHub Actions workflow triggered automatically
- Remotion composes final video with images, audio, and captions
- Final `.mp4` uploaded as a build artifact

### 6️⃣ User Dashboard

Users can **view**, **edit titles/descriptions**, **download**, and **delete** their videos — all from a clean, unified dashboard.

---

## 🗄️ Database Schema

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | String | User email |
| `name` | String | Display name |
| `username` | String | Unique username |
| `imageUrl` | String | Profile avatar |

### `videos`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | String | Video title |
| `description` | String | Video description |
| `script` | JSON | Scene script array |
| `audioUrl` | String | Cloudinary audio URL |
| `imageUrls` | JSON | Scene image URLs |
| `captions` | JSON | Word-level timestamps |
| `status` | Enum | `pending` / `ready` |
| `createdBy` | String | Clerk user ID |
| `createdAt` | Timestamp | Creation time |

---

## 🔧 Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (or a free [Neon DB](https://neon.tech/) instance)
- Accounts on: Clerk, Hugging Face, ElevenLabs, Deepgram, Cloudinary, Google AI Studio

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/ReelsStack.git
cd ReelsStack
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=
NEXT_PUBLIC_DATABASE_URL=

# AI Services
HUGGING_FACE_API_KEY=
ELEVENLABS_API_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
DEEPGRAM_API_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4️⃣ Run Database Migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5️⃣ Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Deploying to Vercel

1. Push your project to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local`
4. Use **production** Clerk keys (not development)
5. Click **Deploy** 🚀

---

## 🔐 Security

- All sensitive API keys are **server-side only** — never exposed to the client
- **Clerk** guards all authenticated routes
- **Ownership validation** is enforced on all update and delete operations
- No client-side secret exposure

---

## ⚡ Performance Highlights

- **Auto-create DB users** on first Clerk login — no manual onboarding
- **Sequential image generation** to avoid Hugging Face quota bursts
- **Cloud rendering** via GitHub Actions keeps the server lightweight
- Efficient audio stream handling for ElevenLabs responses

---

## 📈 Roadmap

- [ ] 💳 Stripe billing integration
- [ ] 📊 Usage limits per user tier
- [ ] 🎨 Video style presets & templates
- [ ] 🤖 AI style configurator
- [ ] 📱 Social media direct sharing
- [ ] 📈 Analytics dashboard

---

## 🧑‍💻 Author

**Divyansh Nahar**

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ using Next.js, Gemini, ElevenLabs, Remotion & more

⭐ **Star this repo** if you found it useful!

</div>