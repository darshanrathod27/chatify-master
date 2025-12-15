<div align="center">

# ✨ Chatify - Real-Time Chat Application ✨

### A Modern Full-Stack MERN Chat Application with Real-Time Messaging

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Render-46E3B7?style=for-the-badge)](https://chatify-master-sfbx.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td align="center"><b>🏠 Main Chat</b></td>
<td align="center"><b>🔐 Login</b></td>
<td align="center"><b>📝 Sign Up</b></td>
</tr>
<tr>
<td><img src="./frontend/public/screenshot-for-readme.png" width="280" alt="Chat Interface"/></td>
<td><img src="./frontend/public/login1.png" width="280" alt="Login Page"/></td>
<td><img src="./frontend/public/signup1.png" width="280" alt="Sign Up Page"/></td>
</tr>
</table>
</div>

---

## 🌟 Features

### 🔐 Authentication & Security
- **Custom JWT Authentication** - Secure token-based auth without third-party services
- **Password Hashing** - bcrypt.js for secure password storage
- **Protected Routes** - Frontend & Backend route protection
- **API Rate Limiting** - Powered by Arcjet to prevent abuse

### 💬 Real-Time Communication
- **Instant Messaging** - Real-time chat via Socket.io
- **Online/Offline Status** - Live presence indicators
- **Typing Indicators** - See when someone is typing (animated dots)
- **Message Notifications** - Sound alerts for new messages
- **Viewing Chat Indicator** - Snapchat-style "viewing chat" status

### 📱 WhatsApp-Style Message Features
- **Message Actions** - Long-press/right-click context menu
- **Edit Messages** - Edit your sent messages
- **Delete Messages** - Delete messages for everyone
- **Reply to Messages** - Quote and reply to specific messages
- **Forward Messages** - Forward to multiple contacts
- **Emoji Reactions** - React with 👍❤️😂😮😢🙏🔥👏
- **Read Receipts** - WhatsApp-style tick indicators:
  - ✓ Single grey tick = Sent
  - ✓✓ Double grey tick = Delivered
  - ✓✓ Double blue tick = Seen
- **Unread Message Badges** - Count badges on chat list

### 👤 User Experience
- **Profile Avatars** - Image uploads via Cloudinary
- **Welcome Emails** - Automated emails on signup via Resend
- **Responsive Design** - Works on desktop, tablet & mobile
- **Dark Mode UI** - Beautiful dark theme with DaisyUI
- **Smooth Animations** - Framer Motion powered transitions

### 🛠️ Technical Excellence
- **RESTful API** - Clean, organized API architecture
- **MongoDB Database** - Scalable data persistence
- **Zustand State** - Lightweight global state management
- **Modern React 19** - Latest React features

---

## 🚀 Live Demo

**🔗 [Visit Chatify Live](https://chatify-master-sfbx.onrender.com)**

> **Note:** The app is hosted on Render's free tier. Initial load may take ~30 seconds if the server is sleeping.

### Demo Features to Try:
1. ✅ Create a new account (welcome email will be sent!)
2. ✅ Update your profile picture
3. ✅ Start a real-time conversation
4. ✅ See online/offline status indicators
5. ✅ Experience instant message delivery
6. ✅ Long-press a message for edit/delete/reply/forward options
7. ✅ Add emoji reactions to messages
8. ✅ Watch the blue ticks appear when messages are read

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first styling |
| **DaisyUI** | Component library |
| **Framer Motion** | Animations |
| **Zustand** | State Management |
| **Socket.io Client** | Real-time communication |
| **React Router** | Client-side routing |
| **Axios** | HTTP requests |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **Socket.io** | Real-time engine |
| **JWT** | Authentication |
| **bcrypt.js** | Password hashing |
| **Cloudinary** | Image uploads |
| **Resend** | Email service |
| **Arcjet** | Rate limiting & security |

---

## 📁 Project Structure

```
chatify-master/
├── 📂 backend/
│   └── 📂 src/
│       ├── 📂 controllers/     # Request handlers
│       │   ├── auth.controller.js
│       │   └── message.controller.js
│       ├── 📂 emails/          # Email templates
│       ├── 📂 lib/             # Utilities & configs
│       ├── 📂 middleware/      # Auth & validation
│       ├── 📂 models/          # MongoDB schemas
│       ├── 📂 routes/          # API routes
│       └── server.js           # Entry point
│
├── 📂 frontend/
│   ├── 📂 public/              # Static assets
│   │   └── 📂 sounds/          # Notification sounds
│   └── 📂 src/
│       ├── 📂 components/      # Reusable UI components
│       ├── 📂 hooks/           # Custom React hooks
│       ├── 📂 lib/             # Utilities
│       ├── 📂 pages/           # Page components
│       ├── 📂 store/           # Zustand stores
│       ├── App.jsx
│       └── main.jsx
│
├── package.json                # Root package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** v20.0.0 or higher
- **MongoDB** database (local or MongoDB Atlas)
- **Cloudinary** account (for image uploads)
- **Resend** account (for welcome emails)
- **Arcjet** account (for rate limiting)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/chatify-master.git
cd chatify-master
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, backend & frontend)
npm run build
```

Or install separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the `/backend` directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/chatify

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Configuration (for welcome emails)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=onboarding@yourdomain.com
EMAIL_FROM_NAME=Chatify

# Arcjet Configuration (for rate limiting)
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Step 4: Run the Application

#### Development Mode (Both servers)
```bash
# From root directory - runs both backend & frontend
npm run dev
```

#### Run Separately
```bash
# Terminal 1 - Backend (Port 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (Port 5173)
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/update-profile` | Update profile |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages/users` | Get chat users |
| `GET` | `/api/messages/:id` | Get messages with user |
| `POST` | `/api/messages/send/:id` | Send message to user |

---

## 🚀 Deployment (Render)

### Deploy to Render

1. **Create a Render Account** at [render.com](https://render.com)

2. **Create a New Web Service**
   - Connect your GitHub repository
   - Select the `chatify-master` repo

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**
   - Add all the variables from your `.env` file
   - Update `CLIENT_URL` to your Render frontend URL
   - Set `NODE_ENV=production`

5. **Deploy!**
   - Render will automatically build and deploy your app

### Live URL
🔗 **https://chatify-master-sfbx.onrender.com**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Darshan Rathod**

- 🔗 [GitHub](https://github.com/darshanrathod27)
- 🔗 [LinkedIn](https://linkedin.com/in/darshanrathod27)

---

<div align="center">

### ⭐ If you like this project, please give it a star! ⭐

Made with ❤️ using MERN Stack

</div>
