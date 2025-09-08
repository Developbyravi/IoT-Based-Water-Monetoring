import { motion } from 'framer-motion';

const SensorCard = ({ title, value, unit, icon: Icon, gradient, color }) => {
  const cardId = `sensor-card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const valueId = `${cardId}-value`;
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="panel relative overflow-hidden focus-visible"
      role="article"
      aria-labelledby={cardId}
      aria-describedby={valueId}
      tabIndex="0"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-15 dark:opacity-10 pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 id={cardId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`p-3 rounded-full ${gradient} bg-opacity-20`}
            aria-hidden="true"
          >
            <Icon className={`w-6 h-6 ${color}`} aria-label={`${title} sensor icon`} />
          </motion.div>
        </div>

        {/* Value Display */}
        <div className="text-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            id={valueId}
            className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1"
            role="status"
            aria-live="polite"
            aria-label={`${title} current value: ${value} ${unit}`}
          >
            {value}
          </motion.div>
          <div className={`text-sm font-medium ${color} opacity-80`} aria-hidden="true">
            {unit}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center" role="status" aria-live="off">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-2 h-2 rounded-full ${color} bg-opacity-60`}
            aria-hidden="true"
          />
          <span className="ml-2 text-xs text-slate-600 dark:text-slate-400 sr-only">
            Live sensor data
          </span>
          <span className="ml-2 text-xs text-slate-600 dark:text-slate-400" aria-hidden="true">
            Live
          </span>
        </div>
      </div>

      {/* Subtle overlay for depth */}
      <div className={`absolute inset-0 ${gradient} opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
    </motion.div>
  );
};

export default SensorCard;
