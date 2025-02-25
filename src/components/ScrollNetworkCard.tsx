'use client'

import Image from 'next/image'
import { ArrowLeftRight } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ApyData {
  asset: string
  chain: string
  apy: number
  tvl: number
  timestamp: string
}

export function ScrollNetworkCard() {
  const [averageApy, setAverageApy] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Функция для получения данных APY и расчета среднего значения
  const getAverageApy = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Получаем последний timestamp для Scroll
      const { data: latestTimestamp, error: timestampError } = await supabase
        .from('apy_history')
        .select('timestamp')
        .eq('chain', 'Scroll')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (timestampError) {
        console.error('Error fetching latest timestamp:', timestampError)
        throw timestampError
      }

      if (!latestTimestamp) {
        throw new Error('No data available')
      }

      // Получаем все записи APY для последнего timestamp
      const { data, error } = await supabase
        .from('apy_history')
        .select('asset, chain, apy, tvl, timestamp')
        .eq('chain', 'Scroll')
        .eq('timestamp', latestTimestamp.timestamp)

      if (error) {
        console.error('Error fetching APY data:', error)
        throw error
      }

      // Рассчитываем средний APY
      if (data && data.length > 0) {
        const totalApy = data.reduce((sum, item) => sum + item.apy, 0)
        const avgApy = totalApy / data.length
        setAverageApy(avgApy)
        setLastUpdate(latestTimestamp.timestamp)
      } else {
        // Если данных нет, используем значение по умолчанию
        setAverageApy(15.1)
      }
    } catch (error) {
      console.error('Error in getAverageApy:', error)
      // В случае ошибки используем значение по умолчанию
      setAverageApy(15.1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    getAverageApy()
    
    // Устанавливаем интервал обновления каждую минуту
    const intervalId = setInterval(() => {
      console.log('Updating APY data...')
      getAverageApy()
    }, 60000) // 60000 мс = 1 минута
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId)
  }, [getAverageApy])

  // Форматирование даты последнего обновления
  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    
    // Конвертируем Unix timestamp в миллисекунды, если это необходимо
    const timestamp = typeof lastUpdate === 'number' || !isNaN(Number(lastUpdate))
      ? Number(lastUpdate) * 1000
      : new Date(lastUpdate).getTime()
    
    const date = new Date(timestamp)
    
    // Добавляем ведущие нули для часов и минут
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${date.toLocaleDateString('en-US', {
      month: 'short', // Feb
      day: '2-digit', // 08
    })}, ${hours}:${minutes} ${Number(hours) >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className='border-2 border-yellow-400 rounded-lg bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 transform hover:-translate-y-1'>
      <div className='flex flex-col items-center mb-6'>
        <div className='w-24 h-24 relative mb-4 group'>
          <div className='absolute inset-0 bg-yellow-400/10 rounded-full animate-pulse'></div>
          <Image 
            src="/scroll_logo.svg" 
            alt="Scroll Logo" 
            width={96} 
            height={96} 
            className='object-contain relative z-10 transition-transform duration-300 group-hover:scale-110'
          />
        </div>
        
        <h2 className='pixel-text text-2xl font-bold text-white mb-2'>SCROLL NETWORK</h2>
        <p className='pixel-text text-3xl font-bold text-yellow-400'>
          {isLoading ? (
            <span className="animate-pulse">APY: ...</span>
          ) : (
            `APY: ${averageApy?.toFixed(1)}%`
          )}
        </p>
        {lastUpdate && (
          <p className='text-xs text-gray-400 mt-1'>Last updated: {formatLastUpdate()}</p>
        )}
      </div>
      
      <div className='space-y-4'>
        <div className='bg-gray-700/50 rounded-lg p-4 flex justify-between items-center hover:bg-gray-700/70 transition-colors duration-300'>
          <span className='pixel-text text-xl text-white'>Gas Savings</span>
          <span className='pixel-text text-xl text-yellow-400 group-hover:scale-105 transition-transform duration-300 flex items-center'>
            <span className='mr-1'>Up to</span>
            <span className='text-2xl font-bold'>97%</span>
          </span>
        </div>
        
        <div className='bg-gray-700/50 rounded-lg p-4 flex justify-between items-center hover:bg-gray-700/70 transition-colors duration-300'>
          <span className='pixel-text text-xl text-white'>Transaction Speed</span>
          <span className='pixel-text text-xl text-yellow-400 group-hover:scale-105 transition-transform duration-300 flex items-center'>
            <span className='text-2xl font-bold'>&lt; 1</span>
            <span className='ml-1'>second</span>
          </span>
        </div>
        
        <div className='bg-gray-700/50 rounded-lg p-4 flex justify-between items-center hover:bg-gray-700/70 transition-colors duration-300'>
          <span className='pixel-text text-xl text-white'>Security</span>
          <span className='pixel-text text-xl text-yellow-400 group-hover:scale-105 transition-transform duration-300'>Ethereum L2</span>
        </div>
      </div>
      
      <div className='mt-8 border-t border-gray-700 pt-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='relative'>
            <div className='absolute inset-0 bg-yellow-400/20 rounded-full animate-ping opacity-75'></div>
            <ArrowLeftRight className='w-6 h-6 text-yellow-400 relative z-10' />
          </div>
          <h3 className='pixel-text text-xl font-bold text-white'>SEAMLESS BRIDGING</h3>
        </div>
        <p className='pixel-text text-gray-300 leading-relaxed hover:text-white transition-colors duration-300'>
          Easily bridge your assets to Scroll and start earning optimal yields instantly
        </p>
      </div>
    </div>
  )
} 