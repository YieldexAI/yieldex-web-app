'use client'

import { useAccount, useReadContract, useBalance } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Coins } from 'lucide-react'
import Link from 'next/link'
import { TOKEN_CONTRACTS } from '@/config/contracts'
import { formatUnits } from 'viem'

interface ApyData {
  asset: string
  chain: string
  apy: number
  tvl: number
  timestamp: string
}

export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const [apyHistory, setApyHistory] = useState<ApyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get ETH balance
  const { data: ethBalance, isError: isEthError, isLoading: isEthLoading } = useBalance({
    address,
    query: {
      enabled: !!address
    }
  })

  // Get USDT contract data
  const { data: usdtBalance, isError: isUsdtError, isLoading: isUsdtLoading } = useReadContract({
    address: TOKEN_CONTRACTS.USDT.address,
    abi: TOKEN_CONTRACTS.USDT.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  })

  const { data: usdtTotalSupply, isError: isUsdtTotalSupplyError, isLoading: isUsdtTotalSupplyLoading } = useReadContract({
    address: TOKEN_CONTRACTS.USDT.address,
    abi: TOKEN_CONTRACTS.USDT.abi,
    functionName: 'totalSupply',
    query: {
      enabled: true
    }
  })

  const getApyHistory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('apy_history')
        .select('asset, chain, apy, tvl, timestamp')
        .order('timestamp', { ascending: false })
        .limit(3)

      if (error) throw error
      setApyHistory(data || [])
    } catch (error) {
      console.error('Error fetching APY history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // if (!isConnected) {
    //   router.push('/')
    // }
    getApyHistory()
  }, [isConnected, router])

  const formatTVL = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pixel-font'>
      {/* Header with Logo */}
      <header className='container mx-auto px-8 py-6'>
        <Link
          href='/'
          className='inline-flex items-center hover:opacity-80 transition-opacity'
        >
          <div className='w-12 h-12 flex items-center justify-center'>
            <Coins className='w-10 h-10 text-yellow-400' />
          </div>
          <span className='ml-3 text-xl font-bold pixel-text'>YIELDEX</span>
        </Link>
      </header>

      <div className='container mx-auto px-8'>
        <h1 className='text-3xl font-bold mb-6'>Yield Dashboard</h1>

        {/* Asset Stats */}
        <div className='mb-8 bg-gray-800 p-6 rounded-lg shadow-lg'>
          <h2 className='text-xl font-semibold text-blue-400 mb-4'>Asset Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <p className='text-gray-400 text-sm mb-2'>Your ETH Balance</p>
              <p className='text-2xl font-bold'>
                {isEthError ? (
                  'Error loading balance'
                ) : isEthLoading ? (
                  'Loading...'
                ) : !ethBalance ? (
                  '0 ETH'
                ) : (
                  `${ethBalance.formatted} ${ethBalance.symbol}`
                )}
              </p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-2'>Your USDT Balance</p>
              <p className='text-2xl font-bold'>
                {isUsdtError ? (
                  'Error loading balance'
                ) : isUsdtLoading ? (
                  'Loading...'
                ) : usdtBalance === undefined ? (
                  '0 USDT'
                ) : (
                  `${formatUnits(usdtBalance, TOKEN_CONTRACTS.USDT.decimals)} USDT`
                )}
              </p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-2'>Total USDT Supply</p>
              <p className='text-2xl font-bold'>
                {isUsdtTotalSupplyError ? (
                  'Error loading supply'
                ) : isUsdtTotalSupplyLoading || !usdtTotalSupply ? (
                  'Loading...'
                ) : (
                  `${Number(formatUnits(usdtTotalSupply, TOKEN_CONTRACTS.USDT.decimals)).toLocaleString()} USDT`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* APY History */}
        {isLoading ? (
          <div className='flex justify-center items-center min-h-[200px]'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {apyHistory.map((data, index) => (
              <div
                key={index}
                className='bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h2 className='text-xl font-semibold text-blue-400'>
                      {data.asset}
                    </h2>
                    <p className='text-sm text-gray-400'>{data.chain}</p>
                  </div>
                  <span className='px-3 py-1 bg-blue-500 rounded-full text-sm'>
                    {formatDate(data.timestamp)}
                  </span>
                </div>

                <div className='space-y-4'>
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Annual Percentage Yield
                    </p>
                    <p className='text-3xl font-bold text-yellow-400'>
                      {data.apy.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className='text-gray-400 text-sm'>Total Value Locked</p>
                    <p className='text-2xl font-semibold'>
                      {formatTVL(data.tvl)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && apyHistory.length === 0 && (
          <div className='text-center text-gray-400 py-10'>
            No yield data available at the moment
          </div>
        )}
      </div>
    </main>
  )
}
