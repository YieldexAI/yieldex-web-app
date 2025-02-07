'use client'

import { Coins } from 'lucide-react'
import { useWalletConnection } from '@/hooks/useWalletConnection'

export function ConnectButton() {
  const { isPending } = useWalletConnection()
  
  return (
    <button
      className='pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 flex items-center gap-2 mx-auto'
    >
      <Coins className='w-5 h-5' />
      {isPending ? 'Connecting...' : 'CONNECT WALLET'}
    </button>
  )
}
