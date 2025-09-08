import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  ZoomIn,
  Download,
  Activity,
  Thermometer,
  Droplets,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const EnhancedChart = ({ data }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState(['tds', 'temperature', 'humidity']);
  const [showTrends, setShowTrends] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const chartRef = useRef(null);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)';

  const metricConfig = {
    tds: {
      label: 'TDS (ppm)',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      icon: Activity,
      yAxisID: 'y'
    },
    temperature: {
      label: 'Temperature (°C)',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: Thermometer,
      yAxisID: 'y1'
    },
    humidity: {
      label: 'Humidity (%)',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: Droplets,
      yAxisID: 'y2'
    }
  };

  const calculateTrend = (dataPoints) => {
    if (dataPoints.length < 2) return 0;
    const n = dataPoints.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = dataPoints.reduce((sum, val) => sum + val, 0);
    const sumXY = dataPoints.reduce((sum, val, idx) => sum + val * idx, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  const getLabels = () => {
    if (!data.timestamps) return [];
    return data.timestamps.map(timestamp => 
      new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    );
  };

  const generateDatasets = () => {
    const datasets = [];
    
    selectedMetrics.forEach(metric => {
      if (!data[metric] || !metricConfig[metric]) return;
      
      const config = metricConfig[metric];
      const dataPoints = data[metric].slice(-Math.floor(20 / zoomLevel));
      
      datasets.push({
        label: config.label,
        data: dataPoints,
        borderColor: config.color,
        backgroundColor: chartType === 'bar' ? config.color : config.bgColor,
        borderWidth: 3,
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: config.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: config.yAxisID,
      });

      // Add trend line if enabled
      if (showTrends && chartType === 'line' && dataPoints.length > 2) {
        const trend = calculateTrend(dataPoints);
        const trendLine = dataPoints.map((_, index) => 
          dataPoints[0] + trend * index
        );
        
        datasets.push({
          label: `${config.label} Trend`,
          data: trendLine,
          borderColor: config.color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          yAxisID: config.yAxisID,
        });
      }
    });

    return datasets;
  };

  const chartData = {
    labels: getLabels().slice(-Math.floor(20 / zoomLevel)),
    datasets: generateDatasets()
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          color: axisColor,
          font: { size: 12 },
          filter: (item) => !item.text.includes('Trend') || showTrends
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#ffffff' : '#0f172a',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => `Time: ${context[0].label}`,
          afterBody: (context) => {
            const trends = [];
            context.forEach(item => {
              const metric = selectedMetrics.find(m => 
                metricConfig[m].label === item.dataset.label
              );
              if (metric && data[metric]) {
                const trend = calculateTrend(data[metric].slice(-10));
                trends.push(`${metric.toUpperCase()} trend: ${trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} ${Math.abs(trend).toFixed(2)}/reading`);
              }
            });
            return trends;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { 
          color: axisColor, 
          font: { size: 11 },
          maxTicksLimit: Math.floor(10 / zoomLevel)
        }
      },
      y: {
        type: 'linear',
        display: selectedMetrics.includes('tds'),
        position: 'left',
        grid: { color: gridColor, drawBorder: false },
        ticks: { 
          color: metricConfig.tds.color,
          font: { size: 11 },
          callback: (value) => `${value} ppm`
        },
        title: {
          display: true,
          text: 'TDS (ppm)',
          color: metricConfig.tds.color,
          font: { size: 12, weight: 'bold' }
        }
      },
      y1: {
        type: 'linear',
        display: selectedMetrics.includes('temperature'),
        position: 'right',
        grid: { drawOnChartArea: false, color: gridColor },
        ticks: { 
          color: metricConfig.temperature.color,
          font: { size: 11 },
          callback: (value) => `${value}°C`
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: metricConfig.temperature.color,
          font: { size: 12, weight: 'bold' }
        }
      },
      y2: {
        type: 'linear',
        display: selectedMetrics.includes('humidity') && selectedMetrics.length <= 2,
        position: selectedMetrics.includes('temperature') ? 'right' : 'right',
        grid: { drawOnChartArea: false, color: gridColor },
        ticks: { 
          color: metricConfig.humidity.color,
          font: { size: 11 },
          callback: (value) => `${value}%`
        },
        title: {
          display: true,
          text: 'Humidity (%)',
          color: metricConfig.humidity.color,
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    }
  };

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const exportChart = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `water-quality-chart-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = url;
      link.click();
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Water Quality Metrics
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time sensor data with trend analysis
          </p>
        </div>

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggles */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {Object.entries(metricConfig).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = selectedMetrics.includes(key);
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMetric(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-600 shadow-sm'
                      : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }`}
                  style={{ 
                    color: isSelected ? config.color : undefined 
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline capitalize">{key}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Chart Type Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={`Switch to ${chartType === 'line' ? 'bar' : 'line'} chart`}
          >
            {chartType === 'line' ? 
              <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" /> :
              <LineChart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            }
          </motion.button>

          {/* Trend Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTrends(!showTrends)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={`${showTrends ? 'Hide' : 'Show'} trends`}
          >
            <TrendingUp className={`w-5 h-5 ${showTrends ? 'text-blue-500' : 'text-slate-400'}`} />
          </motion.button>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
              className="px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              -
            </motion.button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-2">
              {zoomLevel}x
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
              className="px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              +
            </motion.button>
          </div>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportChart}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Export chart as PNG"
          >
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ChartComponent 
          ref={chartRef}
          data={chartData} 
          options={options}
        />
      </div>

      {/* Chart Statistics */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {selectedMetrics.map(metric => {
          if (!data[metric] || !metricConfig[metric]) return null;
          
          const config = metricConfig[metric];
          const values = data[metric].slice(-10);
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          const trend = calculateTrend(values);
          
          return (
            <motion.div
              key={metric}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <config.icon className="w-5 h-5" style={{ color: config.color }} />
                <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {metric}
                </h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Avg:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {avg.toFixed(1)} {metric === 'tds' ? 'ppm' : metric === 'temperature' ? '°C' : '%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Range:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {min.toFixed(1)} - {max.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Trend:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">
                      {trend > 0.1 ? '↗️' : trend < -0.1 ? '↘️' : '➡️'}
                    </span>
                    <span className={`text-sm font-medium ${
                      trend > 0.1 ? 'text-green-500' : trend < -0.1 ? 'text-red-500' : 'text-slate-500'
                    }`}>
                      {trend > 0.1 ? 'Rising' : trend < -0.1 ? 'Falling' : 'Stable'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EnhancedChart;
