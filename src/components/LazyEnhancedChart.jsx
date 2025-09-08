import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Lazy load the EnhancedChart component
const EnhancedChart = lazy(() => import('./EnhancedChart'));

// Loading skeleton component
const ChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="panel"
  >
    <div className="mb-6">
      <div className="skeleton h-6 w-48 mb-2"></div>
      <div className="skeleton h-4 w-64"></div>
    </div>
    
    {/* Controls skeleton */}
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        <div className="skeleton h-10 w-20"></div>
        <div className="skeleton h-10 w-20"></div>
        <div className="skeleton h-10 w-20"></div>
      </div>
      <div className="skeleton h-10 w-10"></div>
      <div className="skeleton h-10 w-10"></div>
      <div className="skeleton h-10 w-24"></div>
      <div className="skeleton h-10 w-10"></div>
    </div>
    
    {/* Chart skeleton */}
    <div className="h-80 w-full skeleton mb-6"></div>
    
    {/* Statistics skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="skeleton h-5 w-5 rounded"></div>
            <div className="skeleton h-5 w-16"></div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="skeleton h-4 w-8"></div>
              <div className="skeleton h-4 w-12"></div>
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-10"></div>
              <div className="skeleton h-4 w-16"></div>
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-8"></div>
              <div className="skeleton h-4 w-14"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Error fallback component
const ChartErrorFallback = ({ error, retry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="panel text-center"
  >
    <div className="py-12">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Chart Loading Error
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        {error?.message || 'Failed to load the chart component'}
      </p>
      {retry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </motion.button>
      )}
    </div>
  </motion.div>
);

// Main lazy chart component with error boundary
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ChartErrorFallback 
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Intersection Observer hook for visibility detection

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsIntersecting(true);
          setIsLoaded(true);
          // Disconnect after first intersection to avoid re-loading
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isLoaded, options]);

  return [ref, isIntersecting || isLoaded];
};

const LazyEnhancedChart = ({ data, ...props }) => {
  const [ref, shouldLoad] = useIntersectionObserver();

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <ChartErrorBoundary>
          <Suspense fallback={<ChartSkeleton />}>
            <EnhancedChart data={data} {...props} />
          </Suspense>
        </ChartErrorBoundary>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
};

export default LazyEnhancedChart;
