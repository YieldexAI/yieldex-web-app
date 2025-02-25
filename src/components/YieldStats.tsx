'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Server } from 'lucide-react'

interface ApyData {
  asset: string
  chain: string
  apy: number
  tvl: number
  timestamp: string
  pool_id?: string
  displayProtocol?: string
}

export function YieldStats() {
  const [apyHistory, setApyHistory] = useState<ApyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Функция для извлечения протокола из pool_id
  const extractProtocolFromPoolId = (poolId: string): string => {
    if (!poolId) return 'Unknown'
    
    // Предполагаем, что формат: "USDT_Polygon_compound-v3"
    const parts = poolId.split('_')
    
    // Если есть хотя бы 3 части, то последняя часть - это протокол
    if (parts.length >= 3) {
      return parts[parts.length - 1]
    }
    
    return 'Unknown'
  }

  // Функция для форматирования названия протокола
  const formatProtocolName = (protocol: string): string => {
    if (!protocol || protocol === 'Unknown') return 'Unknown'
    
    // Заменяем дефисы на пробелы и делаем первую букву каждого слова заглавной
    return protocol
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Выносим getApyHistory в useCallback чтобы избежать повторного создания функции
  const getApyHistory = useCallback(async () => {
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

      // Получаем топ 3 по APY для последнего timestamp
      const { data, error } = await supabase
        .from('apy_history')
        .select('*') // Запрашиваем все поля, включая pool_id
        .eq('chain', 'Scroll')
        .eq('timestamp', latestTimestamp.timestamp)
        .order('apy', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching APY data:', error)
        throw error
      }

      // Обрабатываем данные и добавляем displayProtocol
      const processedData = data?.map(record => {
        const displayProtocol = record.pool_id 
          ? extractProtocolFromPoolId(record.pool_id)
          : 'Unknown';
        
        return {
          ...record,
          displayProtocol
        };
      }) || [];

      setApyHistory(processedData)
      if (data && data.length > 0) {
        // Берем timestamp из первой записи
        setLastUpdate(data[0].timestamp)
      }
    } catch (error) {
      console.error('Error in getApyHistory:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Эффект для первоначальной загрузки данных
  useEffect(() => {
    getApyHistory()
  }, [getApyHistory])

  // Эффект для периодического обновления данных
  useEffect(() => {
    // Устанавливаем интервал обновления каждую минуту
    const intervalId = setInterval(() => {
      getApyHistory()
    }, 60000) // 60000 мс = 1 минута

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId)
  }, [getApyHistory])

  const formatTVL = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const formattedHours = hours.toString().padStart(2, '0')
    
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })}, ${formattedHours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
  }

  // Обновляем функцию форматирования для Last updated
  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    
    // Конвертируем Unix timestamp в миллисекунды
    const date = new Date(Number(lastUpdate) * 1000)
    
    // Добавляем ведущие нули для часов и минут
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${date.toLocaleDateString('en-US', {
      month: 'short', // Feb
      day: '2-digit', // 08
      year: 'numeric', // 2025
    })}, ${hours}:${minutes} ${Number(hours) >= 12 ? 'PM' : 'AM'}`
  }

  if (isLoading && apyHistory.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Индикатор последнего обновления */}
      <div className='text-center text-sm text-gray-400 pixel-text'>
        Last updated: {formatLastUpdate()}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {apyHistory.map((data, index) => (
          <div
            key={index}
            className='pixel-card p-6 bg-gray-800 border-2 border-yellow-400'
          >
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-xl font-bold text-blue-400 pixel-text'>
                  {data.asset}
                </h3>
                <p className='text-sm text-gray-400'>{data.chain}</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-gray-400 text-sm'>Annual Percentage Yield</p>
                <p className='text-3xl font-bold text-yellow-400'>
                  {data.apy.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className='text-gray-400 text-sm'>Total Value Locked</p>
                <p className='text-2xl font-semibold'>{formatTVL(data.tvl)}</p>
              </div>
              
              {/* Добавляем отображение протокола */}
              <div className='mt-3 pt-2 border-t border-gray-600'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1 text-xs'>
                    <Server className='w-3 h-3 text-yellow-400' />
                    <span className='text-gray-400'>Protocol:</span>
                  </div>
                  <span className='text-yellow-400 text-xs font-medium bg-gray-700/80 px-2 py-1 rounded'>
                    {formatProtocolName(data.displayProtocol || '')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 