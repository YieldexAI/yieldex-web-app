'use client'

import { useCallback, useState, useEffect, ReactNode } from 'react'
import { useConnect } from 'wagmi'
import { Coins } from 'lucide-react'
import { useWalletConnection } from '@/hooks/useWalletConnection'

interface ConnectWalletProps {
  children: ReactNode
}

export function ConnectWallet({ children }: ConnectWalletProps) {
  const {
    handleConnect,
    toggleDropdown,
    isOpen,
    connectors,
    error,
    isPending,
  } = useWalletConnection()

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
    }
  }, [error])

  return (
    <div className='relative'>
      <div onClick={toggleDropdown}>{children}</div>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
          <div className='py-1' role='menu' aria-orientation='vertical'>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                role='menuitem'
              >
                {connector.name}
                {isPending &&
                  connector.uid ===
                    connectors.find((c) => c.id === connector.id)?.uid &&
                  ' (connecting)'}
              </button>
            ))}
          </div>
          {error && (
            <div className='px-4 py-2 text-sm text-red-600 border-t border-gray-100'>
              {error.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
