import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  X,
  Bell,
  Droplets,
  Thermometer,
  Activity
} from 'lucide-react';

const NotificationSystem = ({ latestData, thresholds }) => {
  const [notifications, setNotifications] = useState([]);
  const [lastCheckedData, setLastCheckedData] = useState(null);

  // Default thresholds
  const defaultThresholds = {
    tds: { min: 150, max: 500, critical: 1000 },
    temperature: { min: 15, max: 25, critical: 35 },
    humidity: { min: 40, max: 70, critical: 90 }
  };

  const activeThresholds = thresholds || defaultThresholds;

  useEffect(() => {
    if (!latestData || !lastCheckedData) {
      setLastCheckedData(latestData);
      return;
    }

    const newNotifications = [];

    // Check TDS levels
    if (latestData.tds !== lastCheckedData.tds) {
      if (latestData.tds > activeThresholds.tds.critical) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: 'critical',
          icon: Activity,
          title: 'Critical TDS Level',
          message: `TDS level is dangerously high at ${latestData.tds} ppm. Immediate attention required!`,
          duration: 0, // Persistent
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        });
      } else if (latestData.tds > activeThresholds.tds.max) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: 'warning',
          icon: Activity,
          title: 'High TDS Level',
          message: `TDS level is above optimal range at ${latestData.tds} ppm. Consider filtration.`,
          duration: 8000,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        });
      } else if (latestData.tds < activeThresholds.tds.min) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: 'warning',
          icon: Activity,
          title: 'Low TDS Level',
          message: `TDS level is very low at ${latestData.tds} ppm. Water may lack essential minerals.`,
          duration: 6000,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        });
      }
    }

    // Check Temperature levels
    if (latestData.temperature !== lastCheckedData.temperature) {
      if (latestData.temperature > activeThresholds.temperature.critical) {
        newNotifications.push({
          id: Date.now() + Math.random() + 1,
          type: 'critical',
          icon: Thermometer,
          title: 'Critical Temperature',
          message: `Water temperature is critically high at ${latestData.temperature.toFixed(1)}°C!`,
          duration: 0,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        });
      } else if (latestData.temperature > activeThresholds.temperature.max || 
                 latestData.temperature < activeThresholds.temperature.min) {
        newNotifications.push({
          id: Date.now() + Math.random() + 1,
          type: 'warning',
          icon: Thermometer,
          title: 'Temperature Alert',
          message: `Water temperature is ${latestData.temperature > activeThresholds.temperature.max ? 'above' : 'below'} optimal range at ${latestData.temperature.toFixed(1)}°C.`,
          duration: 6000,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        });
      }
    }

    // Check Humidity levels
    if (latestData.humidity !== lastCheckedData.humidity) {
      if (latestData.humidity > activeThresholds.humidity.critical) {
        newNotifications.push({
          id: Date.now() + Math.random() + 2,
          type: 'warning',
          icon: Droplets,
          title: 'Very High Humidity',
          message: `Environmental humidity is very high at ${latestData.humidity.toFixed(1)}%. Monitor for condensation.`,
          duration: 8000,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        });
      } else if (latestData.humidity < activeThresholds.humidity.min) {
        newNotifications.push({
          id: Date.now() + Math.random() + 2,
          type: 'info',
          icon: Droplets,
          title: 'Low Humidity',
          message: `Environmental humidity is low at ${latestData.humidity.toFixed(1)}%.`,
          duration: 5000,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        });
      }
    }

    // Check for data quality (ensure we're getting valid readings)
    const hasValidData = latestData.tds > 0 && latestData.temperature > 0 && latestData.humidity > 0;
    if (!hasValidData && Date.now() - new Date(latestData.timestamp).getTime() > 300000) { // 5 minutes
      newNotifications.push({
        id: Date.now() + Math.random() + 3,
        type: 'warning',
        icon: Bell,
        title: 'Sensor Data Issue',
        message: 'No valid sensor readings received recently. Check sensor connections.',
        duration: 10000,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Auto remove notifications with duration
      newNotifications.forEach(notification => {
        if (notification.duration > 0) {
          setTimeout(() => {
            removeNotification(notification.id);
          }, notification.duration);
        }
      });
    }

    setLastCheckedData(latestData);
  }, [latestData, activeThresholds]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  return (
    <>
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[60] w-full max-w-md space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => {
            const IconComponent = notification.icon || getIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 400, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 400, scale: 0.9 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`panel pointer-events-auto ${notification.bgColor} border-l-4 ${notification.borderColor} shadow-xl max-w-sm`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${notification.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${notification.color}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.duration === 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        This alert requires attention
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </motion.button>
                </div>

                {/* Progress bar for timed notifications */}
                {notification.duration > 0 && (
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: notification.duration / 1000, ease: "linear" }}
                    className={`h-1 ${notification.color} bg-opacity-30 mt-3 rounded-full`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Clear All Button (only show when there are notifications) */}
      {notifications.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={clearAllNotifications}
          className="fixed bottom-4 right-4 z-[60] px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear All ({notifications.length})
        </motion.button>
      )}
    </>
  );
};

export default NotificationSystem;
