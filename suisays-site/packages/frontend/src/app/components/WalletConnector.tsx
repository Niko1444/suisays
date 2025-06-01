// components/WalletConnector.tsx
'use client'

import {
  ConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from '@mysten/dapp-kit'
import { Wallet, LogOut } from 'lucide-react'

export const WalletConnector = () => {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (currentAccount) {
    return (
      <div className="flex items-center space-x-2">
        <div className="rounded-lg bg-[#6EE7B7] px-3 py-2 text-sm font-medium text-white">
          <div className="flex items-center space-x-2">
            <Wallet size={16} />
            <span>{formatAddress(currentAccount.address)}</span>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    )
  }

  return (
    <ConnectButton
      connectText={
        <div className="flex items-center gap-2">
          <Wallet size={16} />
          Connect Wallet
        </div>
      }
      style={{
        backgroundColor: '#6EE7B7',
        color: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        border: 'none',
        fontWeight: '500',
        cursor: 'pointer',
      }}
    />
  )
}
