# MedCore

Enterprise Healthcare Operating System built on the MERN stack.

MedCore is a production-grade SaaS platform that unifies patient 
management, clinical workflows, and real-time analytics into one 
platform for hospitals and clinics.

---

## Personas

- Doctor — Patient queue, consultation engine, EMR, AI assistant
- Admin — Analytics, user management, approvals, audit logs
- Patient — Appointments, prescriptions, health metrics
- Staff — Reception, billing, queue management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Anthropic API |

---

## Project Structure

medcore/
  client/     React frontend
  server/     Express backend
  docs/       Documentation and assets

---

## Getting Started

### Prerequisites
- Node.js 18 or above
- MongoDB Atlas account
- Git

### Backend Setup
cd server
npm install
cp .env.example .env
fill in your environment variables
npm run dev

### Frontend Setup
cd client
npm install
cp .env.example .env
fill in your environment variables
npm run dev

Frontend runs on http://localhost:5173
Backend runs on http://localhost:5000

---

## Environment Variables

### Server
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173

### Client
VITE_API_URL=http://localhost:5000/api/v1
VITE_ANTHROPIC_API_KEY=

---

## API Documentation

60 REST endpoints across 10 resources.
Full API documentation in docs/api.md

---

## License

MIT