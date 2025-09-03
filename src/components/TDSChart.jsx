import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

const TDSChart = ({ data }) => {
  const chartRef = useRef(null);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)';
  const tooltipBg = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';

  const chartData = {
    labels: data.timestamps?.map(timestamp => 
      new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    ) || [],
    datasets: [
      {
        label: 'TDS (ppm)',
        data: data.tds || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => `Time: ${context[0].label}`,
          label: (context) => `TDS: ${context.parsed.y} ppm`,
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: axisColor,
          font: {
            size: 12,
          }
        }
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: axisColor,
          font: {
            size: 12,
          },
          callback: (value) => `${value} ppm`
        },
        beginAtZero: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverBackgroundColor: '#10b981',
        hoverBorderColor: '#ffffff',
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    }
  };

  return (
    <div className="h-64 w-full">
      <Line 
        ref={chartRef}
        data={chartData} 
        options={options}
      />
    </div>
  );
};

export default TDSChart;
