"use client";

import React from 'react';
import { Activity, Brain, Eye, Info, Settings } from 'lucide-react';

const Sidebar = ({ activeTab = 'activity', onTabChange = () => {} }) => {
  const menuItems = [
    { id: 'activity', icon: Activity, isActive: activeTab === 'activity' },
    { id: 'brain', icon: Brain, isActive: activeTab === 'brain' },
    { id: 'eye', icon: Eye, isActive: activeTab === 'eye' },
    { id: 'info', icon: Info, isActive: activeTab === 'info' },
    { id: 'settings', icon: Settings, isActive: activeTab === 'settings' },
  ];

  return (
    <div className="w-90 h-1170 bg-gray-800 flex flex-col items-center py-6 gap-4 border-r border-gray-700">
      {menuItems.map(({ id, icon: IconComponent, isActive }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`p-2 rounded-lg transition-colors ${
            isActive 
              ? 'bg-pink-500' 
              : 'hover:bg-gray-700'
          }`}
        >
          <IconComponent className="w-36 h-36" />
        </button>
      ))}
    </div>
  );
};

export default Sidebar;