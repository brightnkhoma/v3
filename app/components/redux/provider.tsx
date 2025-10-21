"use client";

import { store } from "@/app/lib/local/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useEffect, useState } from "react";
import { Music, Heart, Video, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persistor, setPersistor] = useState<any>(null);

  useEffect(() => {
    const p = persistStore(store);
    setPersistor(p);
  }, []);

  if (!persistor) {
   return <MLoader/>
  }

  return (
    <Provider store={store}>
      <PersistGate loading={ <MLoader/>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

const MLoader = () => {
  const containerVariants: any = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8
      }
    }
  };

  const itemVariants: any = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const orbitVariants: any = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseGlow: any = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(79, 70, 229, 0.3)",
        "0 0 40px rgba(79, 70, 229, 0.6)",
        "0 0 20px rgba(79, 70, 229, 0.3)"
      ],
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const waveVariants: any = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingDots: any = {
    animate: (i: number) => ({
      y: [0, -12, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2 + i,
        repeat: Infinity,
        delay: i * 0.3,
        ease: "easeInOut"
      }
    })
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center   transition-all duration-500"
    >
      <motion.div
        variants={containerVariants}
        className="text-center space-y-12 px-6 max-w-md w-full"
      >
        <motion.div variants={itemVariants} className="relative mb-16">
          <motion.div
            variants={pulseGlow}
            animate="animate"
            className="relative w-24 h-24 mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-500 dark:to-purple-600 shadow-2xl flex items-center justify-center rounded-2xl"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white"
            >
              <Play className="h-8 w-8 fill-current" />
            </motion.div>
          </motion.div>

          {/* Orbiting Elements */}
          <motion.div
            variants={orbitVariants}
            animate="animate"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 border border-indigo-300/30 dark:border-indigo-400/20 rounded-full" />
          </motion.div>

          <motion.div
            variants={orbitVariants}
            animate="animate"
            transition={{ duration: 12 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-40 h-40 border border-purple-300/20 dark:border-purple-400/10 rounded-full" />
          </motion.div>

          {/* Floating Dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={floatingDots}
              animate="animate"
              className={`absolute w-2 h-2 bg-indigo-500 rounded-full ${
                i === 0 ? "top-2 left-4" : 
                i === 1 ? "bottom-4 right-2" : 
                "top-10 -right-2"
              }`}
            />
          ))}
        </motion.div>

        {/* Brand & Description */}
        <motion.div variants={itemVariants} className="space-y-6">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-200 dark:to-purple-300 bg-clip-text text-transparent tracking-tight"
            variants={waveVariants}
            animate="animate"
          >
            Zathu<span className="font-semibold">Play</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-400 font-light tracking-wide"
          >
            Preparing your media experience
          </motion.p>
        </motion.div>

        {/* Custom Progress Indicator */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Dotted Progress Line */}
          <div className="flex justify-center items-center space-x-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <motion.div
                key={dot}
                animate={{
                  scale: [1, 1.3, 1],
                  backgroundColor: [
                    "rgb(148, 163, 184)",
                    "rgb(79, 70, 229)",
                    "rgb(148, 163, 184)"
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-slate-400 rounded-full"
              />
            ))}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{
                width: ["0%", "100%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full relative"
            >
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                right: ["0%", "100%"]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-sm"
              />
            </motion.div>
          </div>

          {/* Status Text */}
          <motion.div
            variants={pulseGlow}
            animate="animate"
            className="text-sm text-slate-500 dark:text-slate-400 font-medium"
          >
            <motion.span
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Loading media library...
            </motion.span>
          </motion.div>
        </motion.div>

        {/* System Status */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center items-center space-x-8 text-xs text-slate-500 dark:text-slate-500 pt-4"
        >
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.2
            }}
            className="flex items-center space-x-1"
          >
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span>Audio Ready</span>
          </motion.div>
          
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.4
            }}
            className="flex items-center space-x-1"
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span>Video Ready</span>
          </motion.div>
        </motion.div>

        {/* Subtle Footer */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <motion.span
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-xs text-slate-400 dark:text-slate-600 font-light"
          >
            The Anchorage Group
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};