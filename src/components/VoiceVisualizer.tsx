
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceVisualizerProps {
  isActive: boolean;
  variant?: "input" | "output";
  className?: string;
  barCount?: number;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  variant = "input",
  className,
  barCount = 12,
}) => {
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(barCount).fill(0.1)
  );

  // Colors based on variant
  const barColor = variant === "input" 
    ? "bg-gradient-to-t from-nova-400 to-nova-600" 
    : "bg-gradient-to-t from-purple-400 to-purple-600";

  // Update bar heights for animation
  useEffect(() => {
    if (!isActive) {
      setBarHeights(Array(barCount).fill(0.1));
      return;
    }

    const generateRandomHeights = () => {
      // Create a smoother wave pattern
      const wavePoints = [];
      for (let i = 0; i < barCount; i++) {
        let height;
        if (isActive) {
          // Create a more natural-looking wave pattern
          const base = 0.2; // minimum height
          const randomFactor = Math.random() * 0.4; // Random factor up to 0.4
          const position = i / barCount; // Position in the sequence (0 to 1)
          
          // Apply a sine wave pattern with some randomness
          const wave = Math.sin(position * Math.PI * 2 + Date.now() / 200) * 0.3;
          height = base + wave + randomFactor;
          
          // Ensure height is between 0.1 and 1
          height = Math.max(0.1, Math.min(1, height));
        } else {
          height = 0.1;
        }
        wavePoints.push(height);
      }
      return wavePoints;
    };

    const interval = setInterval(() => {
      setBarHeights(generateRandomHeights());
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div
      className={cn(
        "flex items-end justify-center space-x-0.5 px-1",
        className
      )}
    >
      <AnimatePresence>
        {barHeights.map((height, index) => (
          <motion.div
            key={index}
            className={cn("w-1 rounded-t-full", barColor)}
            initial={{ height: "10%" }}
            animate={{ 
              height: `${height * 100}%`,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
              }
            }}
            exit={{ height: "10%" }}
            style={{
              transformOrigin: "bottom",
              boxShadow: isActive ? `0 0 5px ${variant === "input" ? "rgba(79, 70, 229, 0.5)" : "rgba(139, 92, 246, 0.5)"}` : "none"
            }}
          ></motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default VoiceVisualizer;
