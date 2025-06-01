// components/Header.tsx (updated)
'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'
import { WalletConnector } from './WalletConnector'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isConnected?: boolean
  userAddress?: string
}

export const Header = ({
  searchQuery,
  onSearchChange,
  isConnected = false,
  userAddress,
}: HeaderProps) => {
  const currentDate = new Date().toLocaleDateString()

  return (
    <div className="px-4 py-4">
      {/* Date */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-md pr-24 font-bold text-gray-900">
            {currentDate}
          </h1>
          <p className="text-base text-[#6EE7B7]">
            {isConnected && userAddress
              ? `@${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
              : '@guest'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <WalletConnector />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl bg-gray-100 py-3 pl-10 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Filter size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}
