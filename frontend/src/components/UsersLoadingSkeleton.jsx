import { motion } from "framer-motion";

function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((item, index) => (
        <motion.div
          key={item}
          className="bg-slate-800/30 p-3 md:p-4 rounded-xl"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-700/60 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3.5 md:h-4 bg-slate-700/60 rounded w-3/4 mb-2"></div>
              <div className="h-2.5 md:h-3 bg-slate-700/40 rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
