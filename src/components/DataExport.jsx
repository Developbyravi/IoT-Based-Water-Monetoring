import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Share2
} from 'lucide-react';

const DataExport = ({ historyData, latestData }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [dateRange, setDateRange] = useState('last24h');
  const [selectedMetrics, setSelectedMetrics] = useState(['tds', 'temperature', 'humidity']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileText, description: 'Machine readable format' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet compatible' }
  ];

  const dateRangeOptions = [
    { value: 'last1h', label: 'Last Hour', hours: 1 },
    { value: 'last6h', label: 'Last 6 Hours', hours: 6 },
    { value: 'last24h', label: 'Last 24 Hours', hours: 24 },
    { value: 'last7d', label: 'Last 7 Days', hours: 168 },
    { value: 'all', label: 'All Data', hours: null }
  ];

  const metricOptions = [
    { value: 'tds', label: 'TDS (ppm)', color: 'text-green-500' },
    { value: 'temperature', label: 'Temperature (°C)', color: 'text-orange-500' },
    { value: 'humidity', label: 'Humidity (%)', color: 'text-blue-500' }
  ];

  const getFilteredData = () => {
    if (!historyData || !historyData.timestamps) return { timestamps: [], data: {} };

    const now = new Date();
    const selectedRange = dateRangeOptions.find(option => option.value === dateRange);
    
    let filteredIndices = [];
    
    if (selectedRange.hours === null) {
      // All data
      filteredIndices = historyData.timestamps.map((_, index) => index);
    } else {
      // Filter by time range
      const cutoffTime = new Date(now.getTime() - (selectedRange.hours * 60 * 60 * 1000));
      filteredIndices = historyData.timestamps
        .map((timestamp, index) => ({ timestamp: new Date(timestamp), index }))
        .filter(({ timestamp }) => timestamp >= cutoffTime)
        .map(({ index }) => index);
    }

    const filteredData = {
      timestamps: filteredIndices.map(i => historyData.timestamps[i])
    };

    selectedMetrics.forEach(metric => {
      if (historyData[metric]) {
        filteredData[metric] = filteredIndices.map(i => historyData[metric][i]);
      }
    });

    return filteredData;
  };

  const generateCSV = (data) => {
    const headers = ['timestamp', ...selectedMetrics];
    const rows = [headers.join(',')];

    if (data.timestamps) {
      data.timestamps.forEach((timestamp, index) => {
        const row = [
          new Date(timestamp).toISOString(),
          ...selectedMetrics.map(metric => data[metric] ? data[metric][index] || '' : '')
        ];
        rows.push(row.join(','));
      });
    }

    return rows.join('\n');
  };

  const generateJSON = (data) => {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        dataRange: dateRange,
        metrics: selectedMetrics,
        totalReadings: data.timestamps ? data.timestamps.length : 0
      },
      data: data.timestamps ? data.timestamps.map((timestamp, index) => {
        const reading = { timestamp };
        selectedMetrics.forEach(metric => {
          if (data[metric]) {
            reading[metric] = data[metric][index];
          }
        });
        return reading;
      }) : []
    };

    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const filteredData = getFilteredData();
      
      if (!filteredData.timestamps || filteredData.timestamps.length === 0) {
        throw new Error('No data available for the selected criteria');
      }

      let content;
      let filename;

      if (exportFormat === 'csv') {
        content = generateCSV(filteredData);
        filename = `water-quality-data-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
      } else {
        content = generateJSON(filteredData);
        filename = `water-quality-data-${dateRange}-${new Date().toISOString().slice(0, 10)}.json`;
      }

      downloadFile(content, filename);
      setExportSuccess(`Successfully exported ${filteredData.timestamps.length} readings as ${exportFormat.toUpperCase()}`);
      
    } catch (error) {
      setExportSuccess(`Export failed: ${error.message}`);
    }

    setIsExporting(false);
  };

  const copyToClipboard = async () => {
    try {
      const filteredData = getFilteredData();
      const content = exportFormat === 'csv' ? generateCSV(filteredData) : generateJSON(filteredData);
      await navigator.clipboard.writeText(content);
      setExportSuccess('Data copied to clipboard!');
    } catch (error) {
      setExportSuccess(`Copy failed: ${error.message}`);
    }
  };

  const getDataStats = () => {
    if (!historyData || !historyData.timestamps) return null;

    const filteredData = getFilteredData();
    const stats = {};

    selectedMetrics.forEach(metric => {
      if (filteredData[metric] && filteredData[metric].length > 0) {
        const values = filteredData[metric].filter(val => val !== null && val !== undefined);
        if (values.length > 0) {
          stats[metric] = {
            count: values.length,
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: values[values.length - 1]
          };
        }
      }
    });

    return {
      totalReadings: filteredData.timestamps.length,
      dateRange: filteredData.timestamps.length > 0 ? {
        start: new Date(filteredData.timestamps[0]).toLocaleString(),
        end: new Date(filteredData.timestamps[filteredData.timestamps.length - 1]).toLocaleString()
      } : null,
      metrics: stats
    };
  };

  const stats = getDataStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Data Export & Analytics</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Export your water quality data or view detailed analytics
        </p>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Export Settings */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <motion.button
                  key={format.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExportFormat(format.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <format.icon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {format.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {format.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Time Range
            </h3>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metrics Selection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Metrics to Include
            </h3>
            <div className="space-y-2">
              {metricOptions.map((metric) => (
                <label
                  key={metric.value}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric.value]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.value));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className={`font-medium ${metric.color}`}>
                    {metric.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={isExporting || selectedMetrics.length === 0}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Download'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
              disabled={selectedMetrics.length === 0}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50"
            >
              <Copy className="w-5 h-5" />
              <span>Copy</span>
            </motion.button>
          </div>

          {/* Export Status */}
          {exportSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center space-x-2 p-3 rounded-lg ${
                exportSuccess.includes('failed') || exportSuccess.includes('Copy failed')
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}
            >
              {exportSuccess.includes('failed') ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{exportSuccess}</span>
            </motion.div>
          )}
        </div>

        {/* Right Column - Data Preview & Stats */}
        <div className="space-y-6">
          {/* Data Statistics */}
          {stats && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Data Statistics</span>
              </h3>

              <div className="space-y-4">
                {/* Overview */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Total Readings:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {stats.totalReadings.toLocaleString()}
                    </span>
                  </div>
                  
                  {stats.dateRange && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>From: {stats.dateRange.start}</div>
                      <div>To: {stats.dateRange.end}</div>
                    </div>
                  )}
                </div>

                {/* Metric Statistics */}
                {Object.entries(stats.metrics).map(([metric, data]) => {
                  const metricInfo = metricOptions.find(m => m.value === metric);
                  if (!metricInfo) return null;

                  return (
                    <div key={metric} className="border-t border-slate-200 dark:border-slate-600 pt-4">
                      <h4 className={`font-medium ${metricInfo.color} mb-2`}>
                        {metricInfo.label}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Average</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {data.avg.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Latest</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {data.latest.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Min</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {data.min.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Max</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {data.max.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Preview</span>
            </h3>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                {(() => {
                  try {
                    const filteredData = getFilteredData();
                    if (!filteredData.timestamps || filteredData.timestamps.length === 0) {
                      return 'No data available for the selected criteria';
                    }
                    
                    const preview = exportFormat === 'csv' 
                      ? generateCSV(filteredData).split('\n').slice(0, 6).join('\n') + '\n...'
                      : JSON.stringify(JSON.parse(generateJSON(filteredData)), null, 2)
                          .split('\n').slice(0, 15).join('\n') + '\n...';
                    
                    return preview;
                  } catch (error) {
                    return `Preview error: ${error.message}`;
                  }
                })()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataExport;
