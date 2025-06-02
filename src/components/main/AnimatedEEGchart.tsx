import React, { useEffect, useState } from 'react';
import EEGChart from './EEGChart'; // Assuming EEGChart is a component that takes data prop

const AnimatedEEGChart = ({ data }) => {
  const [currentData, setCurrentData] = useState([]);
  const [windowStart, setWindowStart] = useState(0);
  const windowSize = 50; // Show 50 data points at once

  useEffect(() => {
    if (!data || data.length === 0) return;

    const interval = setInterval(() => {
      setWindowStart(prev => {
        const newStart = (prev + 1) % data.length;
        
        // Create sliding window of data
        const windowData = [];
        for (let i = 0; i < windowSize; i++) {
          const dataIndex = (newStart + i) % data.length;
          windowData.push({
            ...data[dataIndex],
            time: i, // Reset time for smooth animation
          });
        }
        
        setCurrentData(windowData);
        return newStart;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [data]);

  if (!currentData.length) return <EEGChart data={data} />;

  return (
    <div className="relative overflow-hidden">
      <EEGChart data={currentData} />
      {/* Animated pulse indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 font-medium">Live</span>
      </div>
    </div>
  );
};

export default AnimatedEEGChart;

