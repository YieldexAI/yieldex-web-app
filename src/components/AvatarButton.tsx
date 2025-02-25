declare global {
    interface Window {
      ethereum?: {
        isMetaMask?: boolean;
        chainId?: string;
        on: (event: string, callback: (...args: any[]) => void) => void;
        removeListener: (event: string, callback: (...args: any[]) => void) => void;
        request: (args: { method: string; params?: any[] }) => Promise<any>;
      };
    }
  }

'use client'

import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { LogOut, Copy, ExternalLink, Network, ChevronDown, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Конфигурация поддерживаемых сетей
const SUPPORTED_NETWORKS = {
  scroll: {
    id: 534352,
    name: 'Scroll',
    icon: '📜',
    color: 'text-yellow-400',
    config: {
      chainId: '0x82750',
      chainName: 'Scroll',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.scroll.io'],
      blockExplorerUrls: ['https://scrollscan.com/'],
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

  // Проверяем, является ли текущая сеть Scroll по chainId
  const isScrollNetwork = chainId === SUPPORTED_NETWORKS.scroll.id || currentChainId === SUPPORTED_NETWORKS.scroll.id
  const currentNetwork = isScrollNetwork ? SUPPORTED_NETWORKS.scroll : null

  console.log({
    wagmiChainId: chainId,
    currentChainId,
    metamaskChainId: window.ethereum?.chainId,
    isScroll: isScrollNetwork,
    scrollId: SUPPORTED_NETWORKS.scroll.id,
    metamaskChainIdHex: window.ethereum?.chainId ? parseInt(window.ethereum.chainId, 16) : null,
  })

  // Функция для добавления сети Scroll
  const addScrollNetwork = async () => {
    if (window.ethereum) {
      try {
        console.log('Attempting to add Scroll network with params:', SUPPORTED_NETWORKS.scroll.config);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SUPPORTED_NETWORKS.scroll.config],
        });
        console.log('Successfully added Scroll network');
        return true;
      } catch (error) {
        console.error('Error adding Scroll network:', error);
        return false;
      }
    }
    return false;
  }

  // Функция для обновления текущей сети
  const updateCurrentNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDecimal = parseInt(chainIdHex, 16);
        console.log('Updated chainId:', chainIdDecimal);
        setCurrentChainId(chainIdDecimal);
        return chainIdDecimal;
      } catch (error) {
        console.error('Error updating network:', error);
        return null;
      }
    }
    return null;
  }

  // Функция для переключения на Scroll
  const switchToScroll = async () => {
    try {
      setIsSwitching(true);
      console.log('Attempting to switch to Scroll network...');
      
      if (!window.ethereum) {
        console.error('MetaMask not detected');
        alert('MetaMask not detected. Please install MetaMask to switch networks.');
        return;
      }
      
      console.log('Sending wallet_switchEthereumChain request with chainId:', SUPPORTED_NETWORKS.scroll.config.chainId);
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SUPPORTED_NETWORKS.scroll.config.chainId }], // Используем chainId из конфигурации
        });
        console.log('Successfully switched to Scroll network');
        
        // Принудительно обновляем состояние после переключения
        const newChainId = await updateCurrentNetwork();
        console.log('Network updated, new chainId:', newChainId);
        
        // Принудительно обновляем компонент
        setIsOpen(false);
        
        // Перезагружаем страницу, если chainId не обновился
        if (newChainId !== SUPPORTED_NETWORKS.scroll.id) {
          console.log('Chain ID mismatch, reloading page...');
          window.location.reload();
        }
      } catch (switchError: any) {
        console.log('Switch error:', switchError);
        
        // Если сеть не добавлена (код ошибки 4902)
        if (switchError.code === 4902) {
          console.log('Network not added, attempting to add Scroll network...');
          const added = await addScrollNetwork();
          if (added) {
            // Пробуем переключиться снова после добавления
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SUPPORTED_NETWORKS.scroll.config.chainId }],
              });
              console.log('Successfully switched to Scroll network after adding');
              
              // Принудительно обновляем состояние после переключения
              const newChainId = await updateCurrentNetwork();
              console.log('Network updated after adding, new chainId:', newChainId);
              
              // Перезагружаем страницу, если chainId не обновился
              if (newChainId !== SUPPORTED_NETWORKS.scroll.id) {
                console.log('Chain ID mismatch after adding, reloading page...');
                window.location.reload();
              }
            } catch (secondSwitchError) {
              console.error('Failed to switch after adding network:', secondSwitchError);
              alert('Failed to switch to Scroll network. Please try switching manually in MetaMask.');
            }
          }
        } else {
          console.error('Unexpected error when switching networks:', switchError);
          alert('Failed to switch to Scroll network. Please try again or switch manually in MetaMask.');
        }
      }
    } catch (error) {
      console.error('Unexpected error in switchToScroll:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
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
      window.open(`https://scrollscan.com/address/${address}`, '_blank')
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
        className='flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-500/90 to-purple-500/90 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white shadow-lg hover:shadow-blue-500/20 transition-all duration-200 border border-white/10 group'
      >
        <div className='w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-200'>
          {shortAddress.slice(0, 2)}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium leading-tight">{shortAddress}</span>
          <span className="text-xs text-white/70 flex items-center leading-tight">
            {currentNetwork ? (
              <>
                <span className='mr-1'>{currentNetwork.icon}</span>
                <span>{currentNetwork.name}</span>
              </>
            ) : (
              <span className="text-red-300 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsupported
              </span>
            )}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 rounded-lg shadow-xl bg-gray-800/95 backdrop-blur-sm ring-1 ring-yellow-400/20 z-50 pixel-text w-72 transform transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-top-5'>
          {/* Секция сети */}
          <div className='px-4 py-3 border-b border-gray-700/70'>
            <div className='text-sm text-gray-400 mb-1'>Network</div>
            <div className={`flex items-center gap-2 ${currentNetwork?.color || 'text-gray-400'} font-medium`}>
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 border border-gray-600">
                <span className="text-lg">{currentNetwork?.icon || '❓'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-lg block truncate">{currentNetwork?.name || 'Unsupported'}</span>
              </div>
              {isScrollNetwork && (
                <div className="flex-shrink-0">
                  <span className="px-2 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full whitespace-nowrap">Active</span>
                </div>
              )}
            </div>
          </div>

          <div className='py-2' role='menu'>
            {/* Кнопка переключения на Scroll */}
            {!isScrollNetwork && (
              <button
                onClick={switchToScroll}
                disabled={isSwitching}
                className='flex items-center px-4 py-3 text-sm text-yellow-400 hover:bg-gray-700/70 w-full disabled:opacity-50 text-start transition-colors duration-150 group'
              >
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors duration-150">
                  <Network className='w-4 h-4' />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{isSwitching ? 'Switching...' : 'Use Scroll'}</span>
                </div>
                {isSwitching && (
                  <div className="flex-shrink-0">
                    <svg className="animate-spin h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </button>
            )}

            <button
              onClick={copyAddress}
              className='flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/70 w-full text-start transition-colors duration-150 group'
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors duration-150">
                <Copy className='w-4 h-4' />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">Copy Address</span>
              </div>
            </button>

            <button
              onClick={openEtherscan}
              className='flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/70 w-full text-start transition-colors duration-150 group'
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors duration-150">
                <ExternalLink className='w-4 h-4' />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">Explorer</span>
              </div>
            </button>

            <div className="px-4 py-2">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
            </div>

            <button
              onClick={() => {
                disconnect()
                setIsOpen(false)
              }}
              className='flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-700/70 w-full text-start transition-colors duration-150 group'
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-red-400/10 group-hover:bg-red-400/20 transition-colors duration-150">
                <LogOut className='w-4 h-4' />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">Disconnect</span>
              </div>
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
