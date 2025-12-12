import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LoaderIcon, LockIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <motion.div
      className="w-full flex items-center justify-center p-2 md:p-4 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full max-w-6xl min-h-[500px] md:min-h-[700px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row min-h-[500px] md:min-h-[700px]">
            {/* FORM COLUMN - LEFT SIDE */}
            <motion.div
              className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center md:border-r border-slate-600/30"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <motion.div className="text-center mb-8" variants={itemVariants}>
                  <motion.div
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <MessageCircleIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-2">Welcome Back</h2>
                  <p className="text-slate-400 text-sm md:text-base">Login to access your account</p>
                </motion.div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* EMAIL INPUT */}
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

                  {/* PASSWORD INPUT */}
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

                  {/* SUBMIT BUTTON */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      className="auth-btn"
                      type="submit"
                      disabled={isLoggingIn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoggingIn ? (
                        <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                <motion.div className="mt-6 text-center" variants={itemVariants}>
                  <Link to="/signup" className="auth-link">
                    Don't have an account? Sign Up
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <motion.div
              className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-gradient-to-bl from-slate-800/30 to-transparent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center">
                <motion.img
                  src="/login.png"
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
                    Connect anytime, anywhere
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">Stay connected with friends and family</p>

                  <div className="mt-5 flex justify-center gap-3 flex-wrap">
                    <motion.span
                      className="auth-badge"
                      whileHover={{ scale: 1.05 }}
                    >
                      <SparklesIcon className="w-3 h-3 mr-1" /> Free
                    </motion.span>
                    <motion.span
                      className="auth-badge"
                      whileHover={{ scale: 1.05 }}
                    >
                      Easy Setup
                    </motion.span>
                    <motion.span
                      className="auth-badge"
                      whileHover={{ scale: 1.05 }}
                    >
                      Private
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
export default LoginPage;
