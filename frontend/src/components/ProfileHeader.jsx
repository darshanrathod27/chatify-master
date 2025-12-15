import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CameraIcon, Pencil, X, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

// DiceBear avatar styles
const AVATAR_STYLES = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "notionists"];

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editName, setEditName] = useState(authUser?.fullName || "");
  const [avatarSeed, setAvatarSeed] = useState(Date.now().toString());
  const [avatarStyle, setAvatarStyle] = useState("fun-emoji");

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
      setIsUploading(false);
      setShowEditModal(false);
    };
  };

  // Generate DiceBear avatar URL
  const generateAvatarUrl = () => {
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=transparent`;
  };

  const handleSaveProfile = async () => {
    const updates = {};
    if (editName.trim() && editName !== authUser.fullName) {
      updates.fullName = editName.trim();
    }
    if (selectedImg) {
      updates.profilePic = selectedImg;
    }
    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
    }
    setShowEditModal(false);
  };

  const handleSelectCartoonAvatar = async (url) => {
    setSelectedImg(url);
  };

  const regenerateAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <>
      <motion.div
        className="p-4 md:p-6 border-b border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <motion.div
              className="avatar online"
              whileHover={{ scale: 1.05 }}
            >
              <motion.button
                className="size-12 md:size-14 rounded-full overflow-hidden relative group ring-2 ring-cyan-500/30"
                onClick={() => setShowEditModal(true)}
                disabled={isUploading}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={authUser.profilePic || "/avatar.png"}
                  alt="User image"
                  className={`size-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                />
                <motion.div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  initial={false}
                >
                  <Pencil className="text-white w-4 h-4" />
                </motion.div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.button>
            </motion.div>

            {/* USERNAME & ONLINE TEXT */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-200 font-medium text-sm md:text-base max-w-[120px] md:max-w-[180px] truncate">
                  {authUser.fullName}
                </h3>
                <motion.button
                  onClick={() => setShowEditModal(true)}
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pencil className="w-3 h-3" />
                </motion.button>
              </div>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2 md:gap-4 items-center">
            {/* SOUND TOGGLE BTN */}
            <motion.button
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-full transition-colors"
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
                toggleSound();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isSoundEnabled ? (
                <Volume2Icon className="size-5" />
              ) : (
                <VolumeOffIcon className="size-5" />
              )}
            </motion.button>

            {/* LOGOUT BTN */}
            <motion.button
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              onClick={() => setShowLogoutModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOutIcon className="size-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-cyan-400" />
                  Edit Profile
                </h3>
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-slate-700/50 rounded-full"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group mb-4">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-cyan-500/30"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CameraIcon className="w-4 h-4 text-white" />
                  </motion.button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Cartoon Avatar Options */}
                <p className="text-xs text-slate-500 mb-2">Or choose a cartoon avatar:</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {AVATAR_STYLES.slice(0, 4).map((style) => (
                      <motion.button
                        key={style}
                        onClick={() => {
                          setAvatarStyle(style);
                          handleSelectCartoonAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}`);
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatarStyle === style && selectedImg?.includes(style)
                          ? "border-cyan-400 scale-105"
                          : "border-slate-600 opacity-70 hover:opacity-100"
                          }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}`}
                          alt={style}
                          className="w-full h-full"
                        />
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    onClick={regenerateAvatar}
                    className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Enter your name"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  {isUpdatingProfile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Sign Out?</h3>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to sign out of your account?</p>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOutIcon className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default ProfileHeader;
