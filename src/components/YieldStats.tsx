'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ApyData {
  asset: string
  chain: string
  apy: number
  tvl: number
  timestamp: string
}

export function YieldStats() {
  const [apyHistory, setApyHistory] = useState<ApyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Выносим getApyHistory в useCallback чтобы избежать повторного создания функции
  const getApyHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Получаем последний timestamp для Arbitrum
      const { data: latestTimestamp, error: timestampError } = await supabase
        .from('apy_history')
        .select('timestamp')
        .eq('chain', 'Arbitrum')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (timestampError) {
        console.error('Error fetching latest timestamp:', timestampError)
        throw timestampError
      }

      console.log('Latest timestamp:', latestTimestamp)

      if (!latestTimestamp) {
        throw new Error('No data available')
      }

      // Получаем топ 3 по APY для последнего timestamp
      const { data, error } = await supabase
        .from('apy_history')
        .select('asset, chain, apy, tvl, timestamp')
        .eq('chain', 'Arbitrum')
        .eq('timestamp', latestTimestamp.timestamp)
        .order('apy', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching APY data:', error)
        throw error
      }

      // Подробное логирование полученных данных
      console.log('Full Supabase Response:', {
        rawData: data,
        query: {
          chain: 'Arbitrum',
          timestamp: latestTimestamp.timestamp,
          orderBy: 'apy descending',
          limit: 3
        }
      })

      // Логируем каждую запись отдельно
      data?.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          asset: record.asset,
          chain: record.chain,
          apy: record.apy,
          tvl: record.tvl,
          timestamp: record.timestamp,
          formattedTimestamp: new Date(record.timestamp).toISOString()
        })
      })

      setApyHistory(data || [])
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
      console.log('Updating data...') // Логируем момент обновления
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short', // Jan
      day: '2-digit', // 21
    })
  }

  // Добавим функцию для отладки
  const logTimestampDetails = (timestamp: string) => {
    const date = new Date(timestamp)
    console.log('Timestamp details:', {
      original: timestamp,
      parsed: date,
      formatted: formatDate(timestamp),
      utc: date.toUTCString(),
      iso: date.toISOString(),
    })
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
    })}, ${hours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
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
            className='pixel-card p-6 bg-gray-800 border-2 border-green-400'
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
                <p className='text-3xl font-bold text-green-400'>
                  {data.apy.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className='text-gray-400 text-sm'>Total Value Locked</p>
                <p className='text-2xl font-semibold'>{formatTVL(data.tvl)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 