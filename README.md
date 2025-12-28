# Music Notation Platform

A full-stack web application that allows users to create, view, manage, share, and comment on music notation using [ABC notation](https://abcnotation.com/).

## Features

- **User Authentication**: Secure registration and login system.
- **Score Editor**: Create and edit music scores using ABC notation with live preview.
- **Visualization**: Renders ABC notation into beautiful sheet music using `abcjs`.
- **Dashboard**: personalized dashboard to manage your scores.
- **Sharing**: option to make scores public or private.
- **Community**: View public scores and add comments.

## Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS** (Styling)
- **abcjs** (Music notation rendering)
- **Axios** (API requests)
- **React Router** (Navigation)

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (Database)
- **JWT** (Authentication)
- **Bcryptjs** (Password hashing)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wushang1987/music-notation.git
   cd music-notation
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/music-notation
   JWT_SECRET=your_jwt_secret_key
   ```

## Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   The API will run on `http://localhost:5000`.

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Scores
- `GET /api/scores` - Get all public scores
- `GET /api/scores/my` - Get logged-in user's scores
- `GET /api/scores/:id` - Get a specific score
- `POST /api/scores` - Create a new score
- `PUT /api/scores/:id` - Update a score
- `DELETE /api/scores/:id` - Delete a score

### Comments
- `GET /api/comments/:scoreId` - Get comments for a score
- `POST /api/comments` - Add a comment to a score

## License

ISC
