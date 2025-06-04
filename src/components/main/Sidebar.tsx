"use client";

import React from 'react';

import OpenWithIcon from '../../../public/icons/Open_with.svg';
import rotation from '../../../public/icons/3d_rotation.svg';
import EyeIcon from '../../../public/icons/Animation.svg';
import InfoIcon from '../../../public/icons/Contrast.svg';
import SettingsIcon from '../../../public/icons/strong.svg';

const Sidebar = ({ activeTab = 'activity', onTabChange = () => {} }) => {
  const menuItems = [
    { id: 'activity', icon: OpenWithIcon, isActive: activeTab === 'activity' },
    { id: 'brain', icon: rotation, isActive: activeTab === 'brain' },
    { id: 'eye', icon: EyeIcon, isActive: activeTab === 'eye' },
    { id: 'info', icon: InfoIcon, isActive: activeTab === 'info' },
    { id: 'settings', icon: SettingsIcon, isActive: activeTab === 'settings' },
  ];

  return (
    <div className="w-50 h-1170 bg-gray-800 flex flex-col items-center py-6 gap-4 border-r border-gray-700">
      {menuItems.map(({ id, icon, isActive }) => (
        <button
          key={id}
          // @ts-ignore
          onClick={() => onTabChange(id)}
          className={`relative flex items-center p-2 rounded-lg transition-colors group ${
            isActive ? 'bg-gray-800' : 'hover:bg-gray-700'
          }`}
          style={{ width: '100%' }}
        >
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-35 w-4 rounded-r bg-pink-500 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span className="ml-3 mb-8">
            <img src={icon.src} alt={id} className="w-36 h-36 mx-2" />
          </span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
