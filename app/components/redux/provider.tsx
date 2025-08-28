"use client";

import { store } from "@/app/lib/local/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useEffect, useState } from "react";
import { Music, Heart } from "lucide-react";

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

const MLoader = ()=>{
   return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-500">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-black dark:bg-white flex items-center justify-center transition-all duration-700 animate-pulse">
              <Music className="h-12 w-12 text-white dark:text-black transition-colors duration-500" />
            </div>
            
            {/* Pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-black dark:border-white opacity-20 animate-ping absolute"></div>
              <div className="w-32 h-32 rounded-full border border-black dark:border-white opacity-10 animate-ping absolute delay-300"></div>
            </div>
          </div>

          {/* Brand Name with Animation */}
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-white transition-colors duration-500">
            Zathu<span className="text-gray-600 dark:text-gray-400">Play</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-500">
            Your rhythm, your vibe
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center items-center space-x-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-black dark:bg-white rounded-full transition-colors duration-500"
                style={{
                  animation: `bounce 1.2s infinite ${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Subtle Footer */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center text-gray-400 dark:text-gray-600 text-sm transition-colors duration-500">
            <span className="flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 fill-current text-red-500" /> from the Anchorage group
            </span>
          </div>

          <style jsx>{`
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
                opacity: 0.6;
              }
              50% {
                transform: translateY(-8px);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </div>
    );
}