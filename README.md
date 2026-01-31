# TripLab - Collaborative Trip Planning

A real-time collaborative trip planning app with Firebase Realtime Database and AI integration.

## Features

- **Real-time Collaboration**: See your travel companions' date selections instantly
- **Date Overlap Detection**: Automatically calculates when everyone is available
- **Activity Planning**: Plan activities for each day with time slots
- **Voting System**: Upvote/downvote activities to reach consensus
- **AI Assistant**: Get travel recommendations powered by Claude, GPT-4, and more
- **Google + Guest Auth**: Sign in with Google or continue as guest

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Auth**: Firebase (Google + Anonymous)
- **AI**: OpenRouter API (via Vercel Serverless Functions)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/anusheeel/triplab.git
cd triplab
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database**
3. Enable **Authentication** → Sign-in methods: **Anonymous** and **Google**

Create `.env` in project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Locally

```bash
npm run dev
```

For AI chat locally, also run:
```bash
cd server && npm install && npm start
```

## Deploy to Vercel

### 1. Import to Vercel

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo

### 2. Add Environment Variables

In Vercel dashboard, add:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
OPENROUTER_API_KEY          # For AI chat
```

### 3. Configure Firebase for Production

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to **Authorized domains** (e.g., `triplab.vercel.app`)

### 4. Deploy!

Vercel will automatically deploy on push to main.

## Firebase Database Rules

```json
{
  "rules": {
    "trips": {
      "$tripId": {
        ".read": true,
        ".write": true
      }
    },
    "codes": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$userId": {
        ".read": true,
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

## Project Structure

```
├── api/                  # Vercel serverless functions
│   └── chat.js          # OpenRouter AI proxy
├── src/
│   ├── components/      # React components
│   ├── contexts/        # Auth context
│   ├── hooks/           # Firebase hooks
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
├── server/              # Local dev server (optional)
└── vercel.json          # Vercel configuration
```

## License

MIT
