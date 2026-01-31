# TripLab - Collaborative Trip Planning

A real-time collaborative trip planning app with Firebase Realtime Database and AI integration via OpenRouter.

## Features

- **Real-time Collaboration**: See your travel companions' date selections in real-time
- **Date Overlap Detection**: Automatically calculates when everyone is available
- **Activity Planning**: Plan activities for each day with time slots (morning, afternoon, evening, night)
- **Voting System**: Upvote/downvote activities to reach consensus
- **AI Assistant**: Get travel recommendations powered by Claude, GPT-4, Llama, and more

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Anonymous Auth
- **AI**: OpenRouter API (Claude, GPT-4, Llama, Mistral, Gemini)
- **Design**: Retro Travel Poster aesthetic

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Realtime Database enabled
- OpenRouter API key (for AI features)

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Realtime Database
3. Enable Anonymous Authentication
4. Copy your Firebase config

Create `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Configure OpenRouter (for AI features)

1. Get an API key at [openrouter.ai/keys](https://openrouter.ai/keys)

Create `server/.env`:

```env
OPENROUTER_API_KEY=your-openrouter-key
PORT=3001
```

### 4. Set Firebase Rules

In your Firebase Console, set these Realtime Database rules:

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

### 5. Run the App

```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the API server (for AI features)
cd server && npm start
```

Visit [http://localhost:5173](http://localhost:5173)

## Usage

1. **Create a Trip**: Enter your name and destination
2. **Share the Code**: Send the 6-character code to friends
3. **Select Dates**: Everyone picks their available dates
4. **Lock Dates**: Click "Lock My Dates" when done selecting
5. **Plan Activities**: Once everyone locks, plan activities together
6. **Use AI**: Toggle the AI Assistant for recommendations

## Project Structure

```
src/
├── components/       # React components
├── config/          # Firebase configuration
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
└── utils/           # Utility functions

server/              # Express API server
├── index.js         # Server entry point
└── .env.example     # Environment template
```

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server

- `npm start` - Start the API server
- `npm run dev` - Start with auto-reload

## License

MIT
