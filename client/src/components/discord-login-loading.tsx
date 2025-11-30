import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function DiscordLoginLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2 className="h-12 w-12 text-primary" style={{ color: "#7c3aed" }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium"
          style={{ color: "#7c3aed" }}
        >
          Connecting to Discord...
        </motion.p>
      </motion.div>
    </div>
  );
}
