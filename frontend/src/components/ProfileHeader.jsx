import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CameraIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
    };
  };

  return (
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
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className={`size-full object-cover ${isUploading ? 'opacity-50' : ''}`}
              />
              <motion.div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                initial={false}
              >
                <CameraIcon className="text-white w-5 h-5" />
              </motion.div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </motion.div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-sm md:text-base max-w-[120px] md:max-w-[180px] truncate">
              {authUser.fullName}
            </h3>
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
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
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
            onClick={logout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOutIcon className="size-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
export default ProfileHeader;
