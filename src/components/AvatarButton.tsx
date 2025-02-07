'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

export const AvatarButton = () => {
  const { address } = useAccount()
  const router = useRouter()

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <button
      onClick={() => router.push('/dashboard')}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white hover:opacity-90 transition-opacity"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
        {shortAddress.slice(0, 2)}
      </div>
      <span>{shortAddress}</span>
    </button>
  )
}
