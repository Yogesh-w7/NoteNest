# 📝 NoteNest

A **full-stack Notes Application** where users can create, edit, delete, and organize notes with a clean, responsive UI.  

Built with **React (TypeScript), TailwindCSS, Node.js, Express, and MongoDB**.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org) [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com) [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com) [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

[![Stars](https://img.shields.io/github/stars/Yogesh-w7/NoteNest?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Yogesh-w7/NoteNest/stargazers) [![Forks](https://img.shields.io/github/forks/Yogesh-w7/NoteNest?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Yogesh-w7/NoteNest/network/members) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&logo=mit)](https://opensource.org/licenses/MIT) [![Issues](https://img.shields.io/github/issues/Yogesh-w7/NoteNest?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Yogesh-w7/NoteNest/issues)

---

## 🚀 Features

- ✅ **User Authentication** – Secure login with JWT  
- ✅ **CRUD Notes** – Create, read, update, and delete notes easily  
- ✅ **Responsive Views** – Switch between horizontal scroll and vertical list modes  
- ✅ **Interactive Modals** – Edit and delete notes with confirmation popups  
- ✅ **Responsive UI** – Works seamlessly on desktop & mobile  
- ✅ **Search-Ready** – Quick note previews with timestamps  
- ✅ **Modern Design** – Gradient backgrounds and smooth animations  

---

## 🖼️ Screenshots

| Login Page | Notes Dashboard |  
|------------|-----------------|
| ![Login Page](https://res.cloudinary.com/dyelgucps/image/upload/v1759416863/Screenshot_2025-10-02_201115_rfyrck.png) | ![Notes Dashboard](https://res.cloudinary.com/dyelgucps/image/upload/v1759416862/Screenshot_2025-10-02_201207_by3ikz.png) | 



---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React** – Component-based UI library  
- 🔤 **TypeScript** – Type-safe JavaScript development  
- 🎨 **TailwindCSS** – Utility-first CSS framework  
- 📂 **React Router** – Client-side routing  

### Backend
- 🟢 **Node.js + Express.js** – Server and API routes  
- 🍃 **MongoDB with Mongoose** – NoSQL database and ODM  

### Other Integrations
- 🔑 **JWT** – Token-based authentication  
- 📡 **Axios** – HTTP client for API calls  

---

## ⚙️ Installation

### 📌 Setup Instructions

1️⃣ **Clone the repository**  
   ```bash
   git clone https://github.com/Yogesh-w7/NoteNest.git
   cd notenest
   ```

2️⃣ **Install dependencies**  

   **Backend**  
   ```bash
   cd server
   npm install
   ```

   **Frontend**  
   ```bash
   cd ../client
   npm install
   ```

3️⃣ **Setup environment variables**  

   Create a `.env` file inside `server/` and add:  
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4️⃣ **Run the project**  

   **Backend** (in `server/` directory)  
   ```bash
   npm run dev
   ```

   **Frontend** (in `client/` directory)  
   ```bash
   npm run dev
   ```

👉 App will be live at: http://localhost:5173

---

## 📂 Project Structure

```
📦 notenest
 ┣ 📂 client              # React frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components
 ┃ ┃ ┃ ┣ Dashboard.tsx
 ┃ ┃ ┃ ┣ Login.tsx       # (Assumed for auth flow)
 ┃ ┃ ┃ ┗ ...             # Other components
 ┃ ┃ ┣ main.tsx
 ┃ ┃ ┗ index.css
 ┃ ┗ package.json
 ┣ 📂 server              # Express backend
 ┃ ┣ 📂 models
 ┃ ┃ ┗ Note.js           # Mongoose model
 ┃ ┣ 📂 routes
 ┃ ┃ ┣ auth.js
 ┃ ┃ ┗ notes.js
 ┃ ┣ 📂 controllers
 ┃ ┃ ┣ authController.js
 ┃ ┃ ┗ notesController.js
 ┃ ┗ server.js
 ┣ README.md
 ┗ package.json
```

---

## 📊 API Endpoints

| Method | Endpoint          | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/auth/me`        | Get current user profile     |
| POST   | `/auth/logout`    | User logout                  |
| GET    | `/notes`          | Get all notes                |
| POST   | `/notes`          | Create a new note            |
| PUT    | `/notes/:id`      | Update a note                |
| DELETE | `/notes/:id`      | Delete a note                |

---

## 🚀 Future Enhancements

- 📱 **Mobile App** – React Native integration  
- ✍️ **Rich Text Editor** – Add formatting support  
- 🏷️ **Categories & Tags** – Better organization  
- 🔍 **Search & Filter** – Keyword-based search  
- 🔔 **Reminders** – Notification system  
- 🤖 **AI Summarizer** – Auto-generate note summaries  

---

## 👨‍💻 Author

**Yogesh Waghmare**  
🔗 [GitHub](https://github.com/Yogesh-w7)  

---

✨ A simple yet powerful notes app to stay organized and productive.  

⭐ If you found this helpful, star the repo!   add  icon in veticall
