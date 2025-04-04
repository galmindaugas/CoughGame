# Cough and Cough-like Audio Classification Game

A responsive web application for evaluating audio snippets during American Cough Conference, built with React and Node.js. The app allows participants to classify audio samples as "cough," "throat clear," or "other" through a QR code-based interface.

## Features

- **Admin Audio Upload**: Secure interface for uploading audio snippets (mp3/wav, up to 10s)
- **QR Code Generation**: Create unique QR codes for conference participants
- **Mobile-Friendly Evaluation**: Clean interface for audio classification
- **Interactive Feedback**: Real-time statistics showing how others classified each snippet
- **Data Collection**: Structured database for analyzing participant responses

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: SQLite
- UI: Tailwind CSS + Radix UI
- Audio: HTML5 Audio API
- QR Codes: qrcode library
- Vibe Coded with: Replit's Agent

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

- `/client`: React frontend application
- `/server`: Express backend server
- `/shared`: Shared TypeScript types and schemas
- `/uploads`: Audio file storage directory

## Features

### Admin Interface
- Upload and manage audio snippets
- Generate QR codes for participants
- View response statistics and data analysis

### Participant Interface
- Mobile-optimized audio player
- Simple classification interface
- Real-time feedback on collective responses
- Progress tracking through evaluation session

## Security

- Secured admin routes
- Unique session IDs for participants
- Safe file upload handling
- Data validation and sanitization

## Authors

Mindaugas Galvosas, M.D. - Digital Health Lead @ Hyfe Inc.
