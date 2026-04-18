"use client";
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-6 drop-shadow-sm">
          FashionHub
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate real-time clothing price aggregator for Indian e-commerce.
          Track, compare, and get the best deals across multiple platforms.
        </p>
      </motion.div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-10 px-8 py-3 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer"
      >
        Start Hunting Deals
      </motion.button>
    </main>
  );
}
