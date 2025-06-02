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
    <div className="w-50 h-1170 bg-gray-800 flex flex-col items-center py-6 gap-4 border-r border-gray-700">
      {menuItems.map(({ id, icon: IconComponent, isActive }) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={`relative flex items-center p-2 rounded-lg transition-colors group ${
        isActive ? 'bg-gray-800' : 'hover:bg-gray-700'
        }`}
        style={{ width: '100%' }} // 버튼이 사이드바 전체 너비를 차지하게
      >
        {/* 핑크색 바 */}
        <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-35 w-4 rounded-r bg-pink-500 transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: 0, marginLeft: 0 }}
        />
        <span className="ml-3">
        <IconComponent className="w-36 h-36 mx-2" />
        </span>
      </button>
      ))}
    </div>
  );
};

export default Sidebar;