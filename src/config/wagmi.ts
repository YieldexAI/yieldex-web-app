import { http, createConfig } from 'wagmi'
import { metaMask, injected } from 'wagmi/connectors'
import { arbitrum } from 'wagmi/chains'

// Кастомная конфигурация Arbitrum (если нужна)
const arbitrumChain = {
  ...arbitrum,
  // ваши кастомные настройки
}

// Создаем конфигурацию
export const config = createConfig({
  chains: [arbitrumChain],
  transports: {
    [arbitrumChain.id]: http(),
  },
  connectors: [
    metaMask(),
    injected(),
  ],
})

// Экспортируем типы для использования в других файлах
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
