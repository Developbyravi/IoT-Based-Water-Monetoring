# 💧 PureDrop - Smart Water Quality Dashboard

> **Ensuring Every Drop is Pure** - Advanced water quality monitoring dashboard with real-time sensor data, intelligent analytics, and comprehensive insights.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)
![Responsive](https://img.shields.io/badge/Mobile-Responsive-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### 🎬 **Welcome Experience**
- **Animated Welcome Splash** - Beautiful first-visit animation with app branding
- **Floating Particles** - Subtle water-themed animations
- **Shimmer Effects** - Elegant text animations with auto-dismiss countdown

### 📱 **Responsive Design**
- **Mobile-First Navigation** - Collapsible sidebar with hamburger menu
- **Touch-Optimized** - 44px minimum touch targets for mobile devices
- **Breakpoint Adaptive** - Optimized layouts for all screen sizes
- **Dark/Light Theme** - System preference aware with manual toggle

### 📊 **Advanced Analytics**
- **Multi-Metric Charting** - Interactive TDS, Temperature, and Humidity charts
- **Historical Analysis** - Deep trend analysis with statistical insights
- **Predictive Analytics** - 5-reading forecast based on current trends
- **Quality Assessment** - International standards compliance checking
- **Trend Classification** - Automatic trend strength and direction analysis

### 🔔 **Smart Notifications**
- **Real-Time Alerts** - Toast notifications for threshold violations
- **Persistent Critical Alerts** - Important alerts that require attention
- **Auto-Dismissing Warnings** - Timed notifications with progress bars
- **Customizable Thresholds** - User-defined limits for all metrics
- **System Health Monitoring** - Sensor connectivity status alerts

### 📤 **Data Export & Management**
- **Multiple Export Formats** - JSON and CSV with flexible date ranges
- **Selective Metric Export** - Choose specific sensors and time periods
- **Data Statistics** - Comprehensive analytics with quality metrics
- **Copy to Clipboard** - Quick data sharing functionality
- **Export Preview** - Real-time data preview before download

### ⚡ **Progressive Web App (PWA)**
- **Installable** - Add to home screen on mobile and desktop
- **Offline Support** - Full functionality without internet connection
- **Service Worker** - Smart caching with background sync
- **Push Notifications** - Framework ready for alert notifications
- **Auto-Updates** - Seamless app updates with user prompts

### ♿ **Accessibility & Performance**
- **ARIA Labels** - Full screen reader compatibility
- **Keyboard Navigation** - Complete keyboard accessibility
- **Lazy Loading** - Performance optimized component loading
- **Error Boundaries** - Graceful error handling with fallbacks
- **Loading Skeletons** - Smooth loading states for better UX

## 🏗️ Tech Stack

### Frontend
- **React 18.2** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Chart.js** - Flexible charting library with React integration
- **Lucide React** - Beautiful & consistent icon pack

### Backend Integration
- **ThingSpeak API** - IoT data platform integration
- **RESTful APIs** - Standard HTTP API communication
- **Real-time Updates** - 15-second automatic data refresh

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefix handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/smart-water-dashboard.git
cd smart-water-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

1. **ThingSpeak Integration**: Update the API endpoints in `src/App.jsx`
2. **Customize Branding**: Modify app name and slogan in navigation components
3. **Threshold Configuration**: Adjust alert thresholds in the notification system

## 📱 Dashboard Sections

### 🏠 Dashboard (Main)
- Real-time sensor cards with live data
- Enhanced multi-metric charts
- Water quality checker tool
- Last updated timestamp

### 📈 Analytics
- Historical analysis with trend predictions
- Statistical insights and quality assessment
- Interactive time range selection
- Metric comparison tools

### 🔔 Alerts
- Notification threshold management
- Alert history and configuration
- Real-time alert status display

### 📤 Export
- Flexible data export options
- Multiple format support (JSON/CSV)
- Date range selection
- Data statistics and preview

### ⚙️ Settings
- Theme preferences (Dark/Light)
- Data refresh configuration
- Welcome screen reset
- Notification preferences

## 🎨 Responsive Breakpoints

- **Mobile**: 320px - 640px (Stacked layout, sidebar navigation)
- **Tablet**: 641px - 1024px (Two-column grid, hybrid navigation)
- **Desktop**: 1025px+ (Three-column grid, full navigation bar)

## 🔧 Configuration

### Water Quality Thresholds

```javascript
// Default thresholds in src/App.jsx
const notificationThresholds = {
  tds: { min: 150, max: 500, critical: 1000 },
  temperature: { min: 15, max: 25, critical: 35 },
  humidity: { min: 40, max: 70, critical: 90 }
};
```

### API Configuration

```javascript
// ThingSpeak API endpoints in src/App.jsx
const LATEST_DATA_URL = "https://api.thingspeak.com/channels/3052974/feeds.json?results=1";
const HISTORY_DATA_URL = "https://api.thingspeak.com/channels/3052974/feeds.json?results=10";
```

## 🎭 Customization

### Branding
- Update `appName` and `slogan` in `WelcomeSplash.jsx`
- Modify navigation titles in `Navigation.jsx`
- Customize colors in `tailwind.config.js`

### Themes
- Light/Dark theme support built-in
- Custom color schemes in `index.css`
- Automatic system preference detection

### Features
- Add new sensor types in component configurations
- Extend chart types in `EnhancedChart.jsx`
- Customize notification behaviors in `NotificationSystem.jsx`

## 📊 Performance Optimization

- **Lazy Loading**: Charts and heavy components load on demand
- **Code Splitting**: Automatic bundle splitting for optimal loading
- **Service Worker**: Smart caching with stale-while-revalidate strategy
- **Image Optimization**: Responsive images with proper sizing
- **Tree Shaking**: Unused code elimination in production builds

## 🛠️ Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Run both backend and frontend (if backend exists)
npm run dev:full
```

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Project Structure

```
src/
├── components/
│   ├── DataExport.jsx          # Data export functionality
│   ├── EnhancedChart.jsx        # Advanced charting component
│   ├── HistoricalAnalysis.jsx   # Trend analysis and predictions
│   ├── LazyEnhancedChart.jsx    # Lazy-loaded chart wrapper
│   ├── Navigation.jsx           # Responsive navigation system
│   ├── NotificationSystem.jsx   # Alert and notification management
│   ├── SensorCard.jsx          # Individual sensor display cards
│   ├── TDSChart.jsx            # Legacy TDS chart component
│   ├── WaterQualityChecker.jsx # Water quality assessment tool
│   └── WelcomeSplash.jsx       # Animated welcome screen
├── App.jsx                     # Main application component
├── App.css                     # Global styles
├── index.css                   # Tailwind imports and custom styles
└── main.jsx                    # Application entry point

public/
├── manifest.json               # PWA manifest
├── sw.js                      # Service worker
└── icons/                     # PWA icons (various sizes)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ThingSpeak** - IoT data platform
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js** - Charting library
- **Lucide React** - Icon library
- **React Team** - For the amazing framework

## 📞 Support

For support, questions, or feature requests:

- Create an issue on GitHub
- Check existing documentation
- Review the FAQ section

---

**Made with ❤️ for water quality monitoring**

*PureDrop - Ensuring Every Drop is Pure*
