import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const HistoricalAnalysis = ({ historyData, latestData }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('tds');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [showPredictions, setShowPredictions] = useState(true);

  const timeRanges = [
    { value: '1h', label: 'Last Hour', hours: 1 },
    { value: '6h', label: 'Last 6 Hours', hours: 6 },
    { value: '24h', label: 'Last 24 Hours', hours: 24 },
    { value: '7d', label: 'Last 7 Days', hours: 168 },
    { value: '30d', label: 'Last 30 Days', hours: 720 }
  ];

  const metrics = [
    { value: 'tds', label: 'TDS', unit: 'ppm', color: '#10b981', icon: Zap },
    { value: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b', icon: TrendingUp },
    { value: 'humidity', label: 'Humidity', unit: '%', color: '#3b82f6', icon: TrendingDown }
  ];

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!historyData || !historyData.timestamps) return { timestamps: [], data: {} };

    const now = new Date();
    const selectedRange = timeRanges.find(range => range.value === selectedTimeRange);
    const cutoffTime = new Date(now.getTime() - (selectedRange.hours * 60 * 60 * 1000));

    const filteredIndices = historyData.timestamps
      .map((timestamp, index) => ({ timestamp: new Date(timestamp), index }))
      .filter(({ timestamp }) => timestamp >= cutoffTime)
      .map(({ index }) => index);

    const filtered = {
      timestamps: filteredIndices.map(i => historyData.timestamps[i])
    };

    metrics.forEach(metric => {
      if (historyData[metric.value]) {
        filtered[metric.value] = filteredIndices.map(i => historyData[metric.value][i]);
      }
    });

    return filtered;
  }, [historyData, selectedTimeRange]);

  // Calculate statistics and trends
  const analysisData = useMemo(() => {
    const metric = selectedMetric;
    const data = filteredData[metric];
    
    if (!data || data.length === 0) return null;

    // Basic statistics
    const values = data.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (values.length === 0) return null;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0 
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Trend calculation (linear regression)
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Trend classification
    const trendThreshold = stdDev * 0.1;
    let trendType = 'stable';
    let trendStrength = 'weak';
    
    if (Math.abs(slope) > trendThreshold) {
      trendType = slope > 0 ? 'increasing' : 'decreasing';
      
      if (Math.abs(slope) > stdDev * 0.3) {
        trendStrength = 'strong';
      } else if (Math.abs(slope) > stdDev * 0.2) {
        trendStrength = 'moderate';
      }
    }

    // Quality assessment
    const metricConfig = metrics.find(m => m.value === metric);
    let qualityThresholds = {};
    
    switch (metric) {
      case 'tds':
        qualityThresholds = { excellent: 300, good: 500, acceptable: 1000, poor: 1500 };
        break;
      case 'temperature':
        qualityThresholds = { excellent: 25, good: 30, acceptable: 35, poor: 40 };
        break;
      case 'humidity':
        qualityThresholds = { excellent: 60, good: 70, acceptable: 80, poor: 90 };
        break;
    }

    const currentValue = values[values.length - 1];
    let qualityStatus = 'excellent';
    if (currentValue > qualityThresholds.poor) {
      qualityStatus = 'poor';
    } else if (currentValue > qualityThresholds.acceptable) {
      qualityStatus = 'acceptable';
    } else if (currentValue > qualityThresholds.good) {
      qualityStatus = 'good';
    }

    // Predictions (simple linear extrapolation)
    const predictions = [];
    if (showPredictions && values.length >= 3) {
      for (let i = 1; i <= 5; i++) {
        const predictedValue = intercept + slope * (values.length - 1 + i);
        predictions.push(Math.max(0, predictedValue));
      }
    }

    return {
      metric: metricConfig,
      statistics: {
        count: values.length,
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        stdDev: stdDev.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        current: currentValue.toFixed(2)
      },
      trend: {
        type: trendType,
        strength: trendStrength,
        slope: slope.toFixed(4),
        intercept: intercept.toFixed(2)
      },
      quality: {
        status: qualityStatus,
        thresholds: qualityThresholds
      },
      predictions
    };
  }, [filteredData, selectedMetric, showPredictions]);

  // Chart configuration
  const chartData = useMemo(() => {
    if (!filteredData.timestamps || !analysisData) return null;

    const labels = filteredData.timestamps.map(timestamp => 
      new Date(timestamp).toLocaleTimeString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      })
    );

    const data = filteredData[selectedMetric] || [];
    const trendLine = data.map((_, index) => 
      analysisData.trend.intercept + analysisData.trend.slope * index
    );

    const datasets = [
      {
        label: `${analysisData.metric.label} (${analysisData.metric.unit})`,
        data: data,
        borderColor: analysisData.metric.color,
        backgroundColor: `${analysisData.metric.color}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: analysisData.metric.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Trend Line',
        data: trendLine,
        borderColor: `${analysisData.metric.color}80`,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      }
    ];

    // Add predictions if enabled
    if (showPredictions && analysisData.predictions.length > 0) {
      const predictionLabels = analysisData.predictions.map((_, index) => 
        `Pred ${index + 1}`
      );
      
      datasets.push({
        label: 'Predictions',
        data: [...Array(data.length - 1).fill(null), data[data.length - 1], ...analysisData.predictions],
        borderColor: `${analysisData.metric.color}60`,
        backgroundColor: `${analysisData.metric.color}10`,
        borderWidth: 2,
        borderDash: [10, 5],
        fill: false,
        pointRadius: 3,
        pointStyle: 'triangle',
      });
    }

    return {
      labels: showPredictions ? [...labels, ...Array(5).fill('Prediction')] : labels,
      datasets
    };
  }, [filteredData, analysisData, selectedMetric, showPredictions]);

  const getQualityColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'good': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'acceptable': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'poor': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (type, strength) => {
    if (type === 'increasing') {
      return <ArrowUp className={`w-5 h-5 ${strength === 'strong' ? 'text-green-600' : 'text-green-400'}`} />;
    } else if (type === 'decreasing') {
      return <ArrowDown className={`w-5 h-5 ${strength === 'strong' ? 'text-red-600' : 'text-red-400'}`} />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  if (!analysisData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel"
      >
        <h2 className="text-2xl font-bold gradient-text mb-4">Historical Analysis</h2>
        <p className="text-slate-600 dark:text-slate-400">
          No data available for analysis. Please check your sensor connections.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Historical Analysis</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Deep insights into your water quality trends and predictions
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>

            {/* Predictions Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPredictions(!showPredictions)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showPredictions
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Predictions
            </motion.button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current</span>
              <analysisData.metric.icon className="w-4 h-4" style={{ color: analysisData.metric.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {analysisData.statistics.current}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {analysisData.metric.unit}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Average</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {analysisData.statistics.mean}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              ±{analysisData.statistics.stdDev}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Trend</span>
              {getTrendIcon(analysisData.trend.type, analysisData.trend.strength)}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
              {analysisData.trend.type}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {analysisData.trend.strength}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${getQualityColor(analysisData.quality.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">Quality</span>
              {analysisData.quality.status === 'excellent' || analysisData.quality.status === 'good' ? 
                <CheckCircle className="w-4 h-4" /> : 
                <AlertTriangle className="w-4 h-4" />
              }
            </div>
            <div className="text-lg font-bold capitalize">
              {analysisData.quality.status}
            </div>
            <div className="text-sm opacity-75">
              {analysisData.statistics.count} readings
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="h-80 w-full">
            <Line 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(0,0,0,0.1)',
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(0,0,0,0.1)',
                    },
                    title: {
                      display: true,
                      text: `${analysisData.metric.label} (${analysisData.metric.unit})`,
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <div className="panel">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trend Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">Trend Direction</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analysisData.trend.type, analysisData.trend.strength)}
                <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {analysisData.trend.type}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">Trend Strength</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {analysisData.trend.strength}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">Rate of Change</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {analysisData.trend.slope} {analysisData.metric.unit}/reading
              </span>
            </div>
          </div>
        </div>

        {/* Quality Assessment */}
        <div className="panel">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Quality Assessment
          </h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${getQualityColor(analysisData.quality.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Status</span>
                <span className="font-bold capitalize">{analysisData.quality.status}</span>
              </div>
              <div className="text-sm opacity-80">
                Based on current reading of {analysisData.statistics.current} {analysisData.metric.unit}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Quality Thresholds</h4>
              {Object.entries(analysisData.quality.thresholds).map(([level, threshold]) => (
                <div key={level} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600 dark:text-slate-400">{level}</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    ≤ {threshold} {analysisData.metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      {showPredictions && analysisData.predictions.length > 0 && (
        <div className="panel">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Predictions (Next 5 Readings)
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {analysisData.predictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    Reading {index + 1}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {prediction.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {analysisData.metric.unit}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Predictions are based on current trends and may not account for external factors.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HistoricalAnalysis;
