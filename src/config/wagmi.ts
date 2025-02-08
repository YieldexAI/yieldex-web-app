import { http, createConfig } from 'wagmi'
import { arbitrum } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// Определяем Arbitrum явно
const arbitrumChain = {
  ...arbitrum,
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: ['https://arb1.arbitrum.io/rpc']
    },
    public: {
      http: ['https://arb1.arbitrum.io/rpc']
    }
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://arbiscan.io'
    }
  }
}

// Конфигурация Wagmi
export const config = createConfig({
  chains: [arbitrumChain],
  connectors: [
    metaMask({
      chains: [arbitrumChain],
    }),
    injected({
      chains: [arbitrumChain],
    })
  ],
  transports: {
    [arbitrumChain.id]: http(arbitrumChain.rpcUrls.default.http[0])
  }
})

// Экспортируем типы для использования в других файлах
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
