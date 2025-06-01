// components/TabNavigation.tsx
'use client'

import React from 'react'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  return (
    <div className="flex space-x-8 bg-white px-4 py-3">
      <button
        onClick={() => onTabChange('trending')}
        className={`border-b-2 pb-2 text-base font-bold transition-colors ${
          activeTab === 'trending'
            ? 'border-[#6EE7B7] text-gray-900'
            : 'border-transparent text-gray-500'
        }`}
      >
        All Recent
      </button>
      <button
        onClick={() => onTabChange('foryou')}
        className={`border-b-2 pb-2 text-base font-bold transition-colors ${
          activeTab === 'foryou'
            ? 'border-[#6EE7B7] text-gray-900'
            : 'border-transparent text-gray-500'
        }`}
      >
        Your Feed
      </button>
    </div>
  )
}
