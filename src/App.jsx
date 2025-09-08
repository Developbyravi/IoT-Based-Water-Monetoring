import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  Zap
} from 'lucide-react';
import Navigation from './components/Navigation';
import SensorCard from './components/SensorCard';
import TDSChart from './components/TDSChart';
import LazyEnhancedChart from './components/LazyEnhancedChart';
import WaterQualityChecker from './components/WaterQualityChecker';
import NotificationSystem from './components/NotificationSystem';
import DataExport from './components/DataExport';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import WelcomeSplash from './components/WelcomeSplash';
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('puredrop-visited');
    return !hasVisited;
  });
  const [latestData, setLatestData] = useState({
    tds: 0,
    temperature: 0,
    humidity: 0,
    timestamp: new Date().toISOString()
  });
  const [historyData, setHistoryData] = useState({
    tds: [],
    temperature: [],
    humidity: [],
    timestamps: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationThresholds, setNotificationThresholds] = useState({
    tds: { min: 150, max: 500, critical: 1000 },
    temperature: { min: 15, max: 25, critical: 35 },
    humidity: { min: 40, max: 70, critical: 90 }
  });

  const fetchLatestData = async () => {
    try {
      const response = await fetch(
        "https://api.thingspeak.com/channels/3052974/feeds.json?results=1"
      );
      if (!response.ok) throw new Error("Failed to fetch latest data");

      const json = await response.json();
      const latest = json.feeds[0];

      setLatestData({
        tds: parseFloat(latest.field1) || 0,
        temperature: parseFloat(latest.field2) || 0,
        humidity: parseFloat(latest.field3) || 0,
        timestamp: latest.created_at,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching ThingSpeak latest data:", err);
      setError("ThingSpeak API unavailable");
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await fetch(
        "https://api.thingspeak.com/channels/3052974/feeds.json?results=10"
      );
      if (!response.ok) throw new Error("Failed to fetch history data");

      const json = await response.json();
      const feeds = json.feeds;

      setHistoryData({
        tds: feeds.map(f => parseFloat(f.field1) || 0),
        temperature: feeds.map(f => parseFloat(f.field2) || 0),
        humidity: feeds.map(f => parseFloat(f.field3) || 0),
        timestamps: feeds.map(f => f.created_at),
      });
    } catch (err) {
      console.error("Error fetching ThingSpeak history data:", err);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchLatestData(), fetchHistoryData()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // ✅ Only TDS, Temp, Humidity cards
  const sensorCards = [
    { title: 'TDS', value: latestData.tds, unit: 'ppm', icon: Activity, gradient: 'tds-gradient', color: 'text-green-500' },
    { title: 'Temperature', value: latestData.temperature.toFixed(1), unit: '°C', icon: Thermometer, gradient: 'water-gradient', color: 'text-blue-500' },
    { title: 'Humidity', value: latestData.humidity.toFixed(1), unit: '%', icon: Droplets, gradient: 'ph-gradient', color: 'text-orange-500' }
  ];

  // Handle welcome splash finish
  const handleWelcomeFinish = () => {
    setShowWelcome(false);
    localStorage.setItem('puredrop-visited', 'true');
  };

  // Handle navigation changes
  const handleNavigationChange = (section) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'analytics':
        return (
          <div className="space-y-8">
            <HistoricalAnalysis historyData={historyData} latestData={latestData} />
            <LazyEnhancedChart data={historyData} />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="panel"
            >
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                TDS History (Legacy View)
              </h3>
              <TDSChart data={historyData} />
            </motion.div>
          </div>
        );
      case 'alerts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">Alert Management</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Configure notification thresholds and view alert history. Notifications appear automatically when values exceed thresholds.
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Current Alert Thresholds
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">TDS (ppm)</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div>Min: {notificationThresholds.tds.min}</div>
                    <div>Max: {notificationThresholds.tds.max}</div>
                    <div>Critical: {notificationThresholds.tds.critical}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600 dark:text-orange-400">Temperature (°C)</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div>Min: {notificationThresholds.temperature.min}</div>
                    <div>Max: {notificationThresholds.temperature.max}</div>
                    <div>Critical: {notificationThresholds.temperature.critical}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400">Humidity (%)</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div>Min: {notificationThresholds.humidity.min}</div>
                    <div>Max: {notificationThresholds.humidity.max}</div>
                    <div>Critical: {notificationThresholds.humidity.critical}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'export':
        return <DataExport historyData={historyData} latestData={latestData} />;
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">Settings</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Customize your dashboard experience and notification preferences.
            </p>
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Theme Preferences
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Dark Mode</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Switch between light and dark themes</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDark(!isDark)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDark ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Data Refresh
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Data automatically refreshes every 15 seconds from ThingSpeak API.
                  You can manually refresh anytime using the refresh button.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Welcome Screen
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Reset Welcome Splash</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Show the welcome animation on next visit</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.removeItem('puredrop-visited');
                      setShowWelcome(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Reset Welcome
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <>
            {/* Sensor Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8"
            >
              {sensorCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SensorCard {...card} />
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Chart */}
            <motion.div className="mb-8">
              <LazyEnhancedChart data={historyData} />
            </motion.div>

            {/* Water Quality Checker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <WaterQualityChecker />
            </motion.div>
          </>
        );
    }
  };

  return (
    <>
      {/* Welcome Splash */}
      <WelcomeSplash 
        show={showWelcome}
        onFinish={handleWelcomeFinish}
        appName="PureDrop"
        slogan="Ensuring Every Drop is Pure"
      />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'dark bg-black' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
      }`}>
        <Navigation
        isDark={isDark} 
        setIsDark={setIsDark} 
        refreshData={refreshData} 
        isLoading={isLoading}
        activeSection={activeSection}
        onSectionChange={handleNavigationChange}
      />
                  

      {/* Notification System */}
      <NotificationSystem 
        latestData={latestData} 
        thresholds={notificationThresholds} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
            >
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Content Based on Active Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveSection()}
          </motion.div>
        </AnimatePresence>

        {/* Last updated footer - only show on dashboard */}
        {activeSection === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            Last updated: {new Date(latestData.timestamp).toLocaleString()}
          </motion.div>
        )}
      </main>
      </div>
    </>
  );
}

export default App;


