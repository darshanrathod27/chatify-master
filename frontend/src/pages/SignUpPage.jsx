import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon, SparklesIcon, RefreshCwIcon } from "lucide-react";
import { Link } from "react-router";

// DiceBear avatar styles - fun cartoon avatars
const AVATAR_STYLES = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "notionists"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
};

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [avatarSeed, setAvatarSeed] = useState(Date.now().toString());
  const [avatarStyle, setAvatarStyle] = useState("fun-emoji");
  const { signup, isSigningUp } = useAuthStore();

  // Generate avatar URL
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=transparent`;

  // Regenerate random avatar
  const regenerateAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  // Cycle through avatar styles
  const nextStyle = () => {
    const currentIndex = AVATAR_STYLES.indexOf(avatarStyle);
    const nextIndex = (currentIndex + 1) % AVATAR_STYLES.length;
    setAvatarStyle(AVATAR_STYLES[nextIndex]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup({ ...formData, profilePic: avatarUrl });
  };

  return (
    <motion.div
      className="w-full flex items-center justify-center p-2 md:p-4 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full max-w-6xl min-h-[550px] md:min-h-[750px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row min-h-[550px] md:min-h-[750px]">
            {/* FORM COLUMN - LEFT SIDE */}
            <motion.div
              className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center md:border-r border-slate-600/30"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="w-full max-w-md">
                {/* HEADING */}
                <motion.div className="text-center mb-4 md:mb-6" variants={itemVariants}>
                  <motion.div
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <MessageCircleIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-2">Create Account</h2>
                  <p className="text-slate-400 text-sm md:text-base">Sign up for a new account</p>
                </motion.div>

                {/* AVATAR PICKER */}
                <motion.div className="flex flex-col items-center mb-4" variants={itemVariants}>
                  <div className="relative group">
                    <motion.img
                      src={avatarUrl}
                      alt="Your Avatar"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-700/50 border-2 border-cyan-500/50 p-1"
                      whileHover={{ scale: 1.05 }}
                      key={avatarUrl}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                    <motion.button
                      type="button"
                      onClick={regenerateAvatar}
                      className="absolute -right-1 -bottom-1 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <RefreshCwIcon className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {AVATAR_STYLES.slice(0, 4).map((style) => (
                      <motion.button
                        key={style}
                        type="button"
                        onClick={() => setAvatarStyle(style)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${avatarStyle === style ? "border-cyan-400 scale-110" : "border-slate-600 opacity-60"
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}`}
                          alt={style}
                          className="w-full h-full"
                        />
                      </motion.button>
                    ))}
                    <motion.button
                      type="button"
                      onClick={nextStyle}
                      className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs"
                      whileHover={{ scale: 1.1 }}
                    >
                      +{AVATAR_STYLES.length - 4}
                    </motion.button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Click 🔄 for random or select style</p>
                </motion.div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  {/* FULL NAME */}
                  <motion.div variants={itemVariants}>
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>

                  {/* EMAIL */}
                  <motion.div variants={itemVariants}>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </motion.div>

                  {/* PASSWORD */}
                  <motion.div variants={itemVariants}>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </motion.div>

                  {/* SUBMIT */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      className="auth-btn"
                      type="submit"
                      disabled={isSigningUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSigningUp ? (
                        <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                <motion.div className="mt-4 text-center" variants={itemVariants}>
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* ILLUSTRATION - RIGHT SIDE */}
            <motion.div
              className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-gradient-to-bl from-slate-800/30 to-transparent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center">
                <motion.img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full max-w-md h-auto object-contain"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Choose Your Avatar!
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">Pick a fun cartoon avatar for your profile</p>

                  <div className="mt-5 flex justify-center gap-3 flex-wrap">
                    <motion.span className="auth-badge" whileHover={{ scale: 1.05 }}>
                      <SparklesIcon className="w-3 h-3 mr-1" /> Free
                    </motion.span>
                    <motion.span className="auth-badge" whileHover={{ scale: 1.05 }}>
                      8 Styles
                    </motion.span>
                    <motion.span className="auth-badge" whileHover={{ scale: 1.05 }}>
                      Unlimited
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </motion.div>
  );
}
export default SignUpPage;
