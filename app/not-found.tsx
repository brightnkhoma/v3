'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const containerVariants : any = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants : any = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation : any = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center max-w-2xl w-full"
      >
        {/* Animated 404 Number */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          <motion.h1 
            className="text-9xl font-black text-gray-200 dark:text-gray-700 select-none"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.7, 0.8, 0.7]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </motion.h1>
          
          {/* Floating Elements */}
          <motion.div
            animate={floatingAnimation}
            className="absolute top-1/4 -left-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"
          />
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 0.5 }}
            className="absolute top-1/2 -right-4 w-6 h-6 bg-purple-500 rounded-full opacity-20"
          />
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 1 }}
            className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full opacity-20"
          />
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="space-y-6 mb-12">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 dark:text-white"
            variants={itemVariants}
          >
            Page Not Found
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered an incorrect URL.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-500"
          >
            <Search className="w-4 h-4" />
            <span>Error 404 • Page not found</span>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link href="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto"
        >
          <motion.h3 
            className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2"
            variants={itemVariants}
          >
            <Mail className="w-5 h-5" />
            Need Help?
          </motion.h3>
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 mb-4"
            variants={itemVariants}
          >
            Can't find what you're looking for? Contact our support team for assistance.
          </motion.p>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Contact Support
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2024 ZathuPlay. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}