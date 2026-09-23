# AGRiNEX - System & Software Prerequisites

This document outlines all the software, runtimes, hardware, dependencies, and environment configurations required to run the **AGRiNEX** platform (Backend & Frontend) successfully.

---

## 1. System & Hardware Requirements

| Requirement | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS 12+, or Ubuntu 20.04+ LTS | Windows 11 / Ubuntu 22.04 LTS |
| **Processor (CPU)** | Dual-core 2.0 GHz | Quad-core 2.5 GHz or higher |
| **Memory (RAM)** | 4 GB RAM | 8 GB RAM or higher |
| **Disk Space** | 2 GB free disk space | 5 GB free disk space |
| **Network** | Stable Internet Connection (for Gemini AI, Weather, & Mandi APIs) | High-speed Broadband |
| **Audio Hardware** | Microphone & Speakers / Headphones (for interactive voice session) | Stereo headset / clear USB mic |
| **Web Browser** | Google Chrome (recommended), Microsoft Edge, or Safari with Web Speech API | Google Chrome (latest version) |

---

## 2. Core Runtimes & Command-Line Tools

Ensure the following runtimes are installed on your machine and available in your system `PATH`:

### A. Python
- **Required Version**: `Python 3.10` or higher (tested up to `Python 3.14`).
- **Package Manager**: `pip` (comes pre-bundled with Python).
- **Check Installation**:
  ```bash
  python --version
  pip --version
  ```

### B. Node.js & npm
- **Required Version**: `Node.js 18.x`, `20.x`, or `22.x` (LTS recommended).
- **Package Manager**: `npm` v9.x or higher (or `pnpm` / `yarn`).
- **Check Installation**:
  ```bash
  node -v
  npm -v
  ```

### C. Git
- **Recommended**: For repository management and updates.
- **Check Installation**:
  ```bash
  git --version
  ```

---

## 3. Backend Prerequisites & Dependencies

The backend is built with **FastAPI**, **SQLAlchemy**, and **Python**.

### Python Libraries (`requirements.txt`)
All dependencies can be installed using `pip install -r requirements.txt`:

- **Web Framework & Server**:
  - `fastapi>=0.115.0`
  - `uvicorn[standard]>=0.30.0`
  - `python-multipart>=0.0.9`
- **Database & ORM**:
  - `sqlalchemy>=2.0.0`
  - `alembic>=1.13.0`
  - **Database Engine**: **SQLite** (`agrinex.db`) is included out of the box. No external database server (PostgreSQL/MySQL) setup is strictly required for local development.
- **Data Validation & Schemas**:
  - `pydantic[email]>=2.0.0`
- **Security & Authentication**:
  - `python-jose>=3.3.0`
  - `passlib[bcrypt]>=1.7.4`
  - `bcrypt==4.0.1`
- **Document & Image Processing**:
  - `reportlab>=4.0.0` (for Indian Standard Time PDF dossier generation)
  - `pillow>=10.0.0` (for agronomic image inspection & diagnostics)
- **HTTP Client**:
  - `requests>=2.31.0` (for Gemini API calls & external weather endpoints)

---

## 4. Frontend Prerequisites & Dependencies

The frontend is built with **Next.js 16** (App Router & Turbopack), **React 19**, **TypeScript**, and **TailwindCSS 4**.

### Key Dependencies (`package.json`)
All frontend packages can be installed using `npm install`:

- **Core Framework**:
  - `next`: `^16.3.6`
  - `react`: `19.2.8`
  - `react-dom`: `19.2.8`
  - `typescript`: `^5.0.0`
- **Styling & UI**:
  - `tailwindcss`: `^4.0.0`
  - `@tailwindcss/postcss`: `^4.0.0`
  - `lucide-react`: `^1.47.0` (Icons)
  - `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`, `@radix-ui/react-label`
  - `clsx`, `tailwind-merge`, `class-variance-authority`
- **Charts & Data Visualization**:
  - `recharts`: `^3.10.1`
- **Notifications & Audio**:
  - `sonner`: `^2.0.8` (Toast notifications)
  - Browser Native Web Speech API (`SpeechRecognition` & `speechSynthesis`)
- **HTTP Client**:
  - `axios`: `^1.20.0`

---

## 5. API Keys & Environment Variables

Create a `.env` file in the `backend/` directory using the provided `backend/.env.example` as a template:

### Backend `.env` (`backend/.env`):
```env
# Google Gemini API Key for agronomic reasoning & multi-turn conversational AI
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: ElevenLabs Voice Synthesis API Key (defaults to Browser Neural Voice if omitted)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

> **Note**: An active **Gemini API Key** is required for real-time AI recommendations, disease detection, and conversational farm dialogue. Get a free key at [Google AI Studio](https://aistudio.google.com/).

### Frontend `.env.local` (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 6. Port & Network Requirements

| Port | Service | Default Address |
| :--- | :--- | :--- |
| **8000** | FastAPI Backend & API Docs | `http://127.0.0.1:8000` (Docs at `/docs`) |
| **3000** | Next.js Frontend Dashboard | `http://localhost:3000` |

Ensure ports `8000` and `3000` are free and not blocked by local firewalls.

---

## 7. Quick Setup & Launch Guide

### Step 1: Clone & Navigate
```bash
git clone <repository-url>
cd AGRiNEX
```

### Step 2: Set Up Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python update_admin_and_db.py  # Initializes database tables & demo data
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Set Up Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Open in Browser
Visit **`http://localhost:3000`** to access the AGRiNEX application.
