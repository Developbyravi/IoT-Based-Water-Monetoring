import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

const WaterQualityChecker = () => {
  const [tdsValue, setTdsValue] = useState('');
  const [results, setResults] = useState(null);

  const standards = [
    {
      organization: 'WHO',
      country: 'World Health Organization',
      flag: '🌍',
      excellent: '0-300',
      good: '300-600',
      acceptable: '600-900',
      poor: '900-1200',
      unacceptable: '>1200',
      unit: 'mg/L'
    },
    {
      organization: 'BIS',
      country: 'India',
      flag: '🇮🇳',
      excellent: '0-500',
      good: '500-1000',
      acceptable: '1000-2000',
      poor: '2000-3000',
      unacceptable: '>3000',
      unit: 'mg/L'
    },
    {
      organization: 'EPA',
      country: 'USA',
      flag: '🇺🇸',
      excellent: '0-300',
      good: '300-500',
      acceptable: '500-1000',
      poor: '1000-1500',
      unacceptable: '>1500',
      unit: 'mg/L'
    },
    {
      organization: 'EU',
      country: 'European Union',
      flag: '🇪🇺',
      excellent: '0-250',
      good: '250-500',
      acceptable: '500-1000',
      poor: '1000-1500',
      unacceptable: '>1500',
      unit: 'mg/L'
    },
    {
      organization: 'Health Canada',
      country: 'Canada',
      flag: '🇨🇦',
      excellent: '0-300',
      good: '300-600',
      acceptable: '600-1000',
      poor: '1000-1500',
      unacceptable: '>1500',
      unit: 'mg/L'
    },
    {
      organization: 'NHMRC',
      country: 'Australia',
      flag: '🇦🇺',
      excellent: '0-300',
      good: '300-600',
      acceptable: '600-1000',
      poor: '1000-1500',
      unacceptable: '>1500',
      unit: 'mg/L'
    },
    {
      organization: 'PUB',
      country: 'Singapore',
      flag: '🇸🇬',
      excellent: '0-250',
      good: '250-500',
      acceptable: '500-1000',
      poor: '1000-1500',
      unacceptable: '>1500',
      unit: 'mg/L'
    }
  ];

  const getQualityStatus = (tds, standard) => {
    const num = parseFloat(tds);
    if (num <= parseFloat(standard.excellent.split('-')[1] || standard.excellent.replace('>', ''))) {
      return { status: 'excellent', icon: '✅', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    } else if (num <= parseFloat(standard.good.split('-')[1])) {
      return { status: 'good', icon: '✅', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    } else if (num <= parseFloat(standard.acceptable.split('-')[1])) {
      return { status: 'acceptable', icon: '⚠️', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    } else if (num <= parseFloat(standard.poor.split('-')[1])) {
      return { status: 'poor', icon: '⚠️', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    } else {
      return { status: 'unacceptable', icon: '❌', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    }
  };

  const handleCheck = () => {
    if (!tdsValue || isNaN(tdsValue) || parseFloat(tdsValue) < 0) {
      return;
    }
    setResults(parseFloat(tdsValue));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel max-w-6xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
        Check Your Water Quality
      </h2>
      
      {/* Standards Table */}
      <div className="mb-8 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
          TDS Standards by Organization
        </h3>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Organization</th>
                <th className="px-4 py-3 text-center font-semibold">Excellent</th>
                <th className="px-4 py-3 text-center font-semibold">Good</th>
                <th className="px-4 py-3 text-center font-semibold">Acceptable</th>
                <th className="px-4 py-3 text-center font-semibold">Poor</th>
                <th className="px-4 py-3 text-center font-semibold">Unacceptable</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 dark:bg-slate-800/80">
              {standards.map((standard, index) => (
                <tr key={standard.organization} className={index % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-700/50' : ''}>
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{standard.flag}</span>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{standard.organization}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{standard.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{standard.excellent}</td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{standard.good}</td>
                  <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-medium">{standard.acceptable}</td>
                  <td className="px-4 py-3 text-center text-orange-600 dark:text-orange-400 font-medium">{standard.poor}</td>
                  <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">{standard.unacceptable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          All values are in mg/L (milligrams per liter)
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-8 text-center">
        <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
          Check Your TDS Value
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="number"
              value={tdsValue}
              onChange={(e) => setTdsValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter TDS value (mg/L)"
              className="w-64 px-4 py-3 pl-12 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              min="0"
              step="0.1"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={!tdsValue || isNaN(tdsValue) || parseFloat(tdsValue) < 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Quality
          </motion.button>
        </div>
      </div>

      {/* Results Section */}
      {results !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
        >
          <h3 className="text-lg font-semibold mb-4 text-center text-slate-800 dark:text-slate-200">
            Results for {results} mg/L TDS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standards.map((standard) => {
              const quality = getQualityStatus(results, standard);
              return (
                <motion.div
                  key={standard.organization}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${quality.bg} border-slate-200 dark:border-slate-600`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{standard.flag}</span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{standard.organization}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{standard.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{quality.icon}</span>
                    <span className={`font-medium capitalize ${quality.color}`}>
                      {quality.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Range: {standard.excellent} - {standard.unacceptable.replace('>', '')} mg/L
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WaterQualityChecker;

