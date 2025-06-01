// components/BottomNavigation.tsx
'use client'

import React from 'react'
import { Home, TrendingUp, Plus, Bell, User } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const BottomNavigation = ({
  activeTab,
  onTabChange,
}: BottomNavigationProps) => {
  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onTabChange('home')}
          className={`p-2 transition-colors ${
            activeTab === 'home' ? 'text-[#6EE7B7]' : 'text-gray-400'
          }`}
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => onTabChange('trending')}
          className={`p-2 transition-colors ${
            activeTab === 'trending' ? 'text-[#6EE7B7]' : 'text-gray-400'
          }`}
        >
          <TrendingUp size={24} />
        </button>
        <button
          onClick={() => onTabChange('create')}
          className="rounded-full bg-[#6EE7B7] p-4 shadow-lg transition-colors hover:bg-[#5DD4AC]"
        >
          <Plus size={24} className="text-white" />
        </button>
        <button
          onClick={() => onTabChange('notifications')}
          className={`p-2 transition-colors ${
            activeTab === 'notifications' ? 'text-[#6EE7B7]' : 'text-gray-400'
          }`}
        >
          <Bell size={24} />
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className={`p-2 transition-colors ${
            activeTab === 'profile' ? 'text-[#6EE7B7]' : 'text-gray-400'
          }`}
        >
          <User size={24} />
        </button>
      </div>
    </div>
  )
}
