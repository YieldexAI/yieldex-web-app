'use client'

import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
