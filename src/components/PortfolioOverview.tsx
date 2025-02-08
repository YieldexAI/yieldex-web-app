'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi'
import { TrendingUp, BarChart3 } from 'lucide-react'

// Поддерживаемые сети и токены
const SUPPORTED_NETWORKS = {
  42161: {
    name: 'Arbitrum One',
    tokens: [
      {
        symbol: 'USDT',
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        decimals: 6,
        coingeckoId: 'tether'
      },
      {
        symbol: 'USDC',
        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        decimals: 6,
        coingeckoId: 'usd-coin'
      },
      {
        symbol: 'DAI',
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        decimals: 18,
        coingeckoId: 'dai'
      }
    ]
  }
}

export function PortfolioOverview() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [totalValue, setTotalValue] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [pricesCache, setPricesCache] = useState<{[key: string]: number}>({})

  // Проверяем поддерживаемую сеть
  const currentNetwork = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
  const tokens = currentNetwork?.tokens || []

  // Получаем балансы только для токенов текущей сети
  const balances = tokens.map(token => 
    useBalance({
      address: address,
      token: token.address as `0x${string}`,
      chainId,
      watch: true,
    })
  )

  // Получаем цены только один раз при монтировании компонента
  const fetchPrices = useCallback(async () => {
    try {
      const prices: {[key: string]: number} = {}
      
      // Для стейблкоинов устанавливаем фиксированную цену
      prices['tether'] = 1
      prices['usd-coin'] = 1
      prices['dai'] = 1

      setPricesCache(prices)
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Используем кэшированные цены
  const getTokenPrice = (coingeckoId: string) => {
    return pricesCache[coingeckoId] || 0
  }

  // Подсчет общей стоимости портфеля
  useEffect(() => {
    const calculateTotalValue = async () => {
      if (!isConnected || !address) {
        setTotalValue(0)
        setIsLoading(false)
        setNetworkError(null)
        return
      }

      if (!currentNetwork) {
        setNetworkError('Please switch to Arbitrum network')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setNetworkError(null)
        let total = 0

        for (let i = 0; i < tokens.length; i++) {
          const balance = balances[i].data
          if (balance) {
            const price = getTokenPrice(tokens[i].coingeckoId)
            const value = Number(balance.formatted) * price
            total += value
          }
        }

        setTotalValue(total)
      } catch (error) {
        console.error('Error calculating total value:', error)
        setNetworkError('Error calculating portfolio value')
      } finally {
        setIsLoading(false)
      }
    }

    calculateTotalValue()
  }, [address, isConnected, chainId, balances, currentNetwork, tokens, pricesCache])

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className='lg:col-span-2'>
      <div className='pixel-card p-6 bg-gray-800 border-2 border-green-400 h-full'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold pixel-text'>
            PORTFOLIO OVERVIEW
          </h3>
          <TrendingUp className='w-6 h-6 text-green-400' />
        </div>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-4 bg-gray-700 rounded-lg'>
              <div className='text-sm text-gray-400'>Total Value</div>
              <div className='text-2xl font-bold text-green-400'>
                {networkError ? (
                  <div className='text-red-400 text-sm'>{networkError}</div>
                ) : isLoading ? (
                  <div className='animate-pulse'>Loading...</div>
                ) : (
                  formatUSD(totalValue)
                )}
              </div>
            </div>
            <div className='p-4 bg-gray-700 rounded-lg'>
              <div className='text-sm text-gray-400'>Total Yield</div>
              <div className='text-2xl font-bold text-green-400'>
                {formatUSD(0)}
              </div>
            </div>
          </div>
          <div className='relative h-48 bg-gray-700 rounded-lg p-4'>
            <BarChart3 className='w-full h-full text-green-400 opacity-25' />
            <div className='absolute bottom-4 left-4 text-sm'>
              <div className='text-gray-400'>30-Day Performance</div>
              <div className='text-green-400'>+0.0%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 