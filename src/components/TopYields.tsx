'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Percent, Server, TrendingUp } from 'lucide-react'

interface TopYieldData {
  asset: string
  chain: string
  apy: number
  protocol: string
  pool_id?: string
  displayAsset?: string
  displayProtocol?: string
}

// Хардкодированные протоколы для известных активов
const KNOWN_PROTOCOLS: Record<string, string> = {
  'USDT': 'aave-v3',
  'USDC': 'compound-v3',
  'DAI': 'curve-fi',
  'ETH': 'lido',
  'WBTC': 'maker-dao'
}

export function TopYields() {
  const [topYields, setTopYields] = useState<TopYieldData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [animateValues, setAnimateValues] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Функция для извлечения токена из строки asset
  const parseAssetString = (assetString: string): string => {
    // Предполагаем, что формат: "USDT" или "USDC"
    const parts = assetString.split('_')
    // Токен - это первая часть или вся строка, если нет подчеркиваний
    return parts[0] || assetString
  }

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

  const getTopYields = async () => {
    try {
      // Сначала получаем последний timestamp
      const { data: latest } = await supabase
        .from('apy_history')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (!latest) {
        throw new Error('No timestamp data')
      }

      // Устанавливаем время последнего обновления
      setLastUpdate(new Date().toISOString())

      // Теперь получаем уникальные записи для последнего timestamp
      const { data, error } = await supabase
        .from('apy_history')
        .select('*')
        .eq('timestamp', latest.timestamp) // берем только последние записи
        .order('apy', { ascending: false })
        .limit(3) // Показываем только первые 3

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Дополнительная проверка на уникальность по комбинации asset + protocol + chain
      const uniqueYields = data?.reduce((acc: TopYieldData[], current) => {
        const isDuplicate = acc.some(item => 
          item.asset === current.asset && 
          item.protocol === current.protocol && 
          item.chain === current.chain
        )
        if (!isDuplicate) {
          // Парсим asset для отображения
          const displayAsset = parseAssetString(current.asset);
          
          // Извлекаем протокол из pool_id
          const displayProtocol = current.pool_id 
            ? extractProtocolFromPoolId(current.pool_id)
            : 'Unknown';
          
          acc.push({
            ...current,
            displayAsset,
            displayProtocol
          })
        }
        return acc
      }, []).slice(0, 3) // Показываем только первые 3
      
      setTopYields(uniqueYields || [])
      
      // Запускаем анимацию значений
      setAnimateValues(true)
      setTimeout(() => setAnimateValues(false), 1000)
    } catch (error) {
      console.error('Error fetching top yields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTopYields()
    
    // Обновляем данные каждую минуту
    const interval = setInterval(() => {
      getTopYields()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className='pixel-card p-6 bg-gray-800 border-2 border-yellow-400'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold pixel-text'>TOP YIELDS</h3>
          <Percent className='w-6 h-6 text-yellow-400' />
        </div>
        <div className='animate-pulse space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-4 bg-gray-700/80 rounded-lg h-24'></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='pixel-card p-6 bg-gray-800 border-2 border-yellow-400'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold pixel-text'>TOP YIELDS</h3>
        <Percent className='w-6 h-6 text-yellow-400' />
      </div>
      
      <div className='space-y-4'>
        {topYields.map((yield_data, index) => (
          <div 
            key={index} 
            className='p-4 bg-gray-700/80 rounded-lg hover:bg-gray-700 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-400/10'
          >
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-bold pixel-text text-xl'>{yield_data.displayAsset}</div>
                <div className='text-sm text-gray-400 flex items-center gap-1 mt-1'>
                  <span>Via on</span>
                  <span className='text-yellow-400'>{yield_data.chain}</span>
                </div>
              </div>
              <div className={`text-yellow-400 font-bold pixel-text text-xl ${animateValues ? 'scale-110 transition-transform duration-500' : 'transition-transform duration-500'}`}>
                <div className='flex items-center'>
                  <TrendingUp className='w-4 h-4 mr-1' />
                  {yield_data.apy.toFixed(2)}%
                </div>
                <div className='text-sm text-right'>APY</div>
              </div>
            </div>
            <div className='mt-3 flex items-center justify-between border-t border-gray-600 pt-2'>
              <div className='flex items-center gap-1 text-xs'>
                <Server className='w-3 h-3 text-yellow-400' />
                <span className='text-gray-400'>Protocol:</span>
              </div>
              <span className='text-yellow-400 text-xs font-medium bg-gray-800/50 px-2 py-1 rounded'>
                {formatProtocolName(yield_data.displayProtocol || '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
