import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';

const FlowGauge = ({ value }) => {
  const maxFlow = 15;
  const percentage = Math.min((value / maxFlow) * 100, 100);

  const getColor = (val) => {
    if (val < 3) return '#ef4444';
    if (val < 7) return '#f59e0b';
    return '#10b981';
  };

  const currentColor = getColor(value);
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const bgArc = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(100, 116, 139, 0.2)';

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={bgArc}
            strokeWidth="8"
            strokeDasharray="125.6"
            strokeDashoffset="0"
          />
          
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={currentColor}
            strokeWidth="8"
            strokeDasharray="125.6"
            strokeDashoffset="125.6"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 125.6 }}
            animate={{ strokeDashoffset: 125.6 - (125.6 * percentage / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-slate-900 dark:text-slate-100"
            >
              {value.toFixed(1)}
            </motion.div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              L/min
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
        >
          <Gauge className="w-8 h-8 text-purple-400" />
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center space-x-2"
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {value < 3 ? 'Low Flow' : value < 7 ? 'Medium Flow' : 'Optimal Flow'}
          </span>
        </motion.div>
        
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Max: {maxFlow} L/min
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-slate-600 dark:text-slate-400">Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-slate-600 dark:text-slate-400">Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-slate-600 dark:text-slate-400">Optimal</span>
        </div>
      </div>
    </div>
  );
};

export default FlowGauge;
