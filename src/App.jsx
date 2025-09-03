import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  Sun, 
  Moon, 
  RefreshCw,
  Zap
} from 'lucide-react';
import SensorCard from './components/SensorCard';
import TDSChart from './components/TDSChart';
import WaterQualityChecker from './components/WaterQualityChecker';
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(true);
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'dark bg-black' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
    }`}>
     <motion.header 
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 dark:border-slate-700/50"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      
      {/* Left Section: Title + Subtitle */}
      <div className="flex flex-col">
        <motion.h1 
          className="text-2xl font-bold gradient-text leading-tight"
          whileHover={{ scale: 1.05 }}
        >
          PureDrop
        </motion.h1>
        <motion.h3 
          className="text-sm font-medium text-slate-600 dark:text-slate-300"
          whileHover={{ scale: 1.05 }}
        >
          Ensuring Every Drop is Pure
        </motion.h3>
      </div>

      {/* Right Section: Buttons */}
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-full glassmorphic hover:bg-white/20 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''} text-slate-700 dark:text-slate-100`} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full glassmorphic hover:bg-white/20 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-slate-100" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </motion.button>
      </div>
    </div>
  </div>
</motion.header>
                  

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* ✅ 3 sensor cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
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

        {/* ✅ Keep TDS chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="panel"
        >
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            TDS History (Last 10 Readings)
          </h3>
          <TDSChart data={historyData} />
        </motion.div>

        {/* ✅ Keep Water Quality Checker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <WaterQualityChecker />
        </motion.div>

        {/* ✅ Last updated footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          Last updated: {new Date(latestData.timestamp).toLocaleString()}
        </motion.div>
      </main>
    </div>
  );
}

export default App;


