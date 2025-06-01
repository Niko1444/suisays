// components/StatusBar.tsx
'use client'

import React from 'react'

export const StatusBar = () => {
  return (
    <div className="flex items-center justify-center bg-[#6EE7B7] px-4 py-3 text-sm font-bold text-white">
      <span>
        <img src="/logo-long.png" className="h-12 w-auto" />
      </span>
    </div>
  )
}
