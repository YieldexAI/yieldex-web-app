declare global {
  interface Window {
    ethereum?: any;
  }
}

'use client'

import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { LogOut, Copy, ExternalLink, Network } from 'lucide-react'
import dynamic from 'next/dynamic'

// Конфигурация поддерживаемых сетей
const SUPPORTED_NETWORKS = {
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    icon: '⚡',
    color: 'text-blue-400',
    config: {
      chainId: '0xa4b1',
      chainName: 'Arbitrum One',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io/'],
    },
  },
}

// Создаем компонент без SSR
const AvatarButtonComponent = () => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Проверяем, что компонент смонтирован на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  // Инициализация и отслеживание сети
  useEffect(() => {
    const initializeChainId = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Получаем текущий chainId из MetaMask
          const ethereumChainId = await window.ethereum.request({
            method: 'eth_chainId',
          })
          setCurrentChainId(parseInt(ethereumChainId as string, 16))

          // Слушаем изменения сети
          const handleChainChanged = (chainId: string) => {
            console.log('Chain changed to:', parseInt(chainId, 16))
            setCurrentChainId(parseInt(chainId, 16))
          }

          window.ethereum.on('chainChanged', handleChainChanged)

          return () => {
            if (typeof window.ethereum !== 'undefined') {
              window.ethereum.removeListener('chainChanged', handleChainChanged)
            }
          }
        } catch (error) {
          console.error('Error initializing chainId:', error)
        }
      }
    }

    initializeChainId()
  }, [])

  // Обновляем currentChainId когда меняется chainId из wagmi
  useEffect(() => {
    if (chainId) {
      setCurrentChainId(chainId)
    }
  }, [chainId])

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    if (!mounted) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mounted])

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  const isArbitrumNetwork = currentChainId === SUPPORTED_NETWORKS.arbitrum.id
  const currentNetwork = isArbitrumNetwork ? SUPPORTED_NETWORKS.arbitrum : null

  console.log({
    wagmiChainId: chainId,
    currentChainId,
    metamaskChainId: window.ethereum?.chainId,
    isArbitrum: isArbitrumNetwork,
  })

  // Функция для добавления сети Arbitrum
  const addArbitrumNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SUPPORTED_NETWORKS.arbitrum.config],
        })
      } catch (error) {
        console.error('Error adding Arbitrum network:', error)
      }
    }
  }

  // Функция для переключения на Arbitrum
  const switchToArbitrum = async () => {
    try {
      setIsSwitching(true)
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa4b1' }], // Arbitrum chainId in hex
        })
      }
    } catch (error: any) {
      // Если сеть не добавлена, пробуем добавить
      if (error.code === 4902) {
        await addArbitrumNetwork()
      }
    } finally {
      setIsSwitching(false)
      setIsOpen(false)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      // Можно добавить toast уведомление о копировании
    }
  }

  const openEtherscan = () => {
    if (address) {
      window.open(`https://arbiscan.io/address/${address}`, '_blank')
    }
  }

  // Рендерим пустой div до монтирования
  if (!mounted) {
    return <div ref={menuRef} />
  }

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white hover:opacity-90 transition-opacity'
      >
        <div className='w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center'>
          {shortAddress.slice(0, 2)}
        </div>
        <span>{shortAddress}</span>
        {/* Индикатор сети */}
        <div
          className={`flex items-center ${
            currentNetwork?.color || 'text-gray-400'
          }`}
        >
          <span className='mr-1'>{currentNetwork?.icon || '❓'}</span>
        </div>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 pixel-text'>
          {/* Секция сети */}
          <div className='px-4 py-2 border-b border-gray-700'>
            <div className='text-sm text-gray-400'>Network</div>
            <div
              style={{ wordBreak: 'break-word' }}
              className={`flex items-center ${
                currentNetwork?.color || 'text-gray-400'
              }`}
            >
              <span>{currentNetwork?.icon}</span>
              <span>{currentNetwork?.name || 'Unsupported Network'}</span>
            </div>
          </div>

          <div className='py-1' role='menu'>
            {/* Кнопка переключения на Arbitrum */}
            {!isArbitrumNetwork && (
              <button
                onClick={switchToArbitrum}
                disabled={isSwitching}
                className='flex items-center px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 w-full disabled:opacity-50 text-start'
              >
                <Network className='w-4 h-4 mr-2' />
                {isSwitching ? 'Switching...' : 'Switch to Arbitrum'}
              </button>
            )}

            <button
              onClick={copyAddress}
              className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full'
            >
              <Copy className='w-4 h-4 mr-2' />
              Copy Address
            </button>

            <button
              onClick={openEtherscan}
              className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full'
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              View on Explorer
            </button>

            <button
              onClick={() => {
                disconnect()
                setIsOpen(false)
              }}
              className='flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Экспортируем компонент с отключенным SSR
export const AvatarButton = dynamic(
  () => Promise.resolve(AvatarButtonComponent),
  { ssr: false },
)
