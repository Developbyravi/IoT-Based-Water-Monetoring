import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets } from 'lucide-react';

const WelcomeSplash = ({ show, onFinish, appName = 'PureDrop', slogan = 'Ensuring Every Drop is Pure' }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!show) return;
    
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => onFinish?.(), 3000);
    
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(dismissTimer);
      clearInterval(countdownTimer);
    };
  }, [show, onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome"
        >
          {/* Background gradient with subtle water texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-400 dark:from-slate-900 dark:via-sky-900 dark:to-cyan-900" />
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.35) 0 2px, transparent 3px), radial-gradient(circle at 40% 70%, rgba(255,255,255,0.35) 0 2px, transparent 3px)' }}
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="absolute w-1 h-1 bg-white rounded-full floating-particle"
                style={{
                  left: `${10 + i * 7}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
          
          {/* Ripple effect behind the logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-32 h-32 rounded-full border border-white/20 welcome-ripple"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute w-40 h-40 rounded-full border border-white/15 welcome-ripple"
              style={{ animationDelay: '1s' }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 text-center text-white">
            {/* Droplet animation */}
            <motion.div
              initial={{ scale: 0, rotate: -45, y: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl"
              aria-hidden="true"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl" />
              
              <motion.div
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  times: [0, 0.3, 0.7, 1]
                }}
              >
                <Droplets className="w-10 h-10 text-white drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              <motion.h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg relative z-10"
                initial={{ backgroundPosition: '-200px 0' }}
                animate={{ backgroundPosition: '200px 0' }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'linear',
                  delay: 1
                }}
                style={{
                  background: 'linear-gradient(90deg, #ffffff, #ffffff, #e0f7ff, #ffffff, #ffffff)',
                  backgroundSize: '200px 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'white'
                }}
              >
                {appName}
              </motion.h1>
            </motion.div>

            {/* Slogan */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-2 text-sm sm:text-base text-white/90 relative"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {slogan.split(' ').map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    className="inline-block mr-1"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </motion.p>

            {/* Water wave */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
              className="relative mx-auto mt-8 h-2 w-64 overflow-hidden rounded-full bg-white/20"
              aria-hidden="true"
            >
              <motion.div
                animate={{ x: ['-30%', '130%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  repeatDelay: 0.5
                }}
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              />
              <motion.div
                animate={{ x: ['-40%', '140%'] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  delay: 0.3,
                  repeatDelay: 0.5
                }}
                className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent"
              />
            </motion.div>

            {/* Skip button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 40px rgba(255,255,255,0.2)'
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onFinish?.()}
                className="group relative inline-flex items-center justify-center rounded-lg bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/30 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10">Enter Dashboard</span>
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="mt-2 text-xs text-white/60 text-center"
              >
                {countdown > 0 ? `Auto-entering in ${countdown} second${countdown !== 1 ? 's' : ''}...` : 'Entering dashboard...'}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeSplash;

