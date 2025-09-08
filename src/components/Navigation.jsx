import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Settings, 
  Download, 
  Bell,
  Droplets,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';

const Navigation = ({ isDark, setIsDark, refreshData, isLoading, activeSection, onSectionChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 dark:border-slate-700/50 lg:hidden"
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-full glassmorphic hover:bg-white/20 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-100" />
          </motion.button>

          {/* Mobile Title */}
          <div className="flex flex-col items-center">
            <motion.h1 
              className="text-xl font-bold gradient-text leading-tight"
              whileHover={{ scale: 1.05 }}
            >
              PureDrop
            </motion.h1>
            <motion.h3 
              className="text-xs font-medium text-slate-600 dark:text-slate-300"
              whileHover={{ scale: 1.05 }}
            >
              Ensuring Every Drop is Pure
            </motion.h3>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
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
      </motion.header>

      {/* Desktop Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 dark:border-slate-700/50 hidden lg:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Title */}
            <div className="flex items-center space-x-4">
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
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSectionChange(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeSection === item.id
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Desktop Actions */}
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

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-700/50 z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold gradient-text">PureDrop</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Water Quality Monitor</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg glassmorphic hover:bg-white/20 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} text-slate-700 dark:text-slate-100`} />
                    <span className="text-sm text-slate-700 dark:text-slate-100">Refresh</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDark(!isDark)}
                    className="p-3 rounded-lg glassmorphic hover:bg-white/20 transition-colors"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-slate-100" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return active section for parent component */}
      <div className="hidden">{activeSection}</div>
    </>
  );
};

export default Navigation;
