

/**
 * Home Page - Entry point for Tic Tac Toe game
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold text-gray-800 mb-6"
          >
            Tic Tac Toe
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 mb-8"
          >
            Play the classic game with modern features
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⭕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Classic Mode</h3>
              <p className="text-gray-600">Traditional 3x3 grid gameplay</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🔲</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Multiple Variants</h3>
              <p className="text-gray-600">4x4, 5x5, Connect Four, and 3D</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Online Multiplayer</h3>
              <p className="text-gray-600">Play with friends or random opponents</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-4"
          >
            <Link href="/game">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Start Playing 🚀
              </motion.button>
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>No account required for offline play</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 text-gray-400">
              <span className="w-8 h-px bg-gray-300"></span>
              <span className="text-sm">Built with Next.js 15+ • TypeScript • Tailwind CSS</span>
              <span className="w-8 h-px bg-gray-300"></span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
