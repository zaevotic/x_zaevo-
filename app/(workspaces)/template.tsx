'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 35,
        mass: 0.8
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
