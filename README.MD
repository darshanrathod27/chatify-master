<div align="center">

# ✨ Chatify ✨

### Modern Real-Time Chat App with WhatsApp-Like Features

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Render-46E3B7?style=for-the-badge)](https://chatify-master-sfbx.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 🎯 Key Features

| 💬 Messaging | 📱 WhatsApp-Style | 🎨 Experience |
|-------------|------------------|--------------|
| Real-time chat | Edit & Delete messages | Dark theme UI |
| Typing indicators | Reply & Forward | Framer Motion animations |
| Read receipts (✓ ✓✓ 🔵) | Emoji reactions 👍❤️😂 | DiceBear cartoon avatars |
| Online/Offline status | Context menu (long-press) | Responsive design |
| Unread badges | Smart scroll | Profile editing |
| Viewing chat indicator | Signout confirmation | Sound notifications |

---

## 🖼️ Screenshots

<div align="center">
<table>
<tr>
<td><img src="./frontend/public/screenshot-for-readme.png" width="280" alt="Chat"/></td>
<td><img src="./frontend/public/login1.png" width="280" alt="Login"/></td>
<td><img src="./frontend/public/signup1.png" width="280" alt="Sign Up"/></td>
</tr>
</table>
</div>

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, DaisyUI, Framer Motion, Zustand, Socket.io  
**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, bcrypt.js  
**Services:** Cloudinary (images), Resend (emails), Arcjet (rate limiting), DiceBear (avatars)

---

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/darshanrathod27/chatify-master.git
cd chatify-master && npm run build

# Configure backend/.env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
RESEND_API_KEY=xxx
ARCJET_KEY=xxx

# Run
npm run dev
```

**Access:** Frontend `localhost:5173` | Backend `localhost:3000`

---

## 📡 API Routes

| Auth | Messages |
|------|----------|
| `POST /api/auth/signup` | `GET /api/messages/:id` |
| `POST /api/auth/login` | `POST /api/messages/send/:id` |
| `PUT /api/auth/update-profile` | `PUT /api/messages/:id` (edit) |
| `POST /api/auth/logout` | `DELETE /api/messages/:id` |

---

## 🌐 Live Demo

**🔗 [chatify-master-sfbx.onrender.com](https://chatify-master-sfbx.onrender.com)**

> First load may take ~30s (free tier cold start)

---

## 👨‍💻 Author

**Darshan Rathod** — [GitHub](https://github.com/darshanrathod27) • [LinkedIn](https://linkedin.com/in/darshanrathod27)

<div align="center">

⭐ **Star this repo if you like it!** ⭐

</div>
