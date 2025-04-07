
import React, { useEffect, useState } from "react";
import { SYSTEM_CONFIG } from "@/config/env";
import { motion } from "framer-motion";

const SplashScreen = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 100 ? 100 : next;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nova-500 to-purple-600 flex items-center justify-center shadow-lg">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-blue-400"
              />
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-r-2 border-purple-400"
              />
              <div className="text-white text-xl font-bold">NS</div>
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full"
            >
              v{SYSTEM_CONFIG.SYSTEM_VERSION}
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-2xl font-bold mb-2 glow-text"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {SYSTEM_CONFIG.ASSISTANT_NAME}
          </motion.h1>
          
          <motion.p 
            className="text-sm text-muted-foreground mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Nova Sentient Core System
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="w-64 h-1.5 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 256 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-nova-500 to-purple-600"
            style={{ width: `${loadingProgress}%` }}
            initial={{ width: "0%" }}
          />
        </motion.div>
        
        <motion.div 
          className="mt-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {loadingProgress < 100 ? "Initializing system..." : "System ready"}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
