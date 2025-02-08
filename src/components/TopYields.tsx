'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Percent } from 'lucide-react'

interface TopYieldData {
  asset: string
  chain: string
  apy: number
  protocol: string
}

export function TopYields() {
  const [topYields, setTopYields] = useState<TopYieldData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getTopYields = async () => {
    try {
      setIsLoading(true)
      
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

      // Теперь получаем уникальные записи для последнего timestamp
      const { data, error } = await supabase
        .from('apy_history')
        .select('*')
        .eq('timestamp', latest.timestamp) // берем только последние записи
        .order('apy', { ascending: false })
        .limit(3)

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
          acc.push(current)
        }
        return acc
      }, []).slice(0, 3) // Берем только первые 3 уникальные записи

      console.log('Unique Top Yields Data:', uniqueYields)
      setTopYields(uniqueYields || [])
    } catch (error) {
      console.error('Error fetching top yields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTopYields()
    
    // Обновляем данные каждую минуту
    const interval = setInterval(getTopYields, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='p-4 bg-gray-700 rounded-lg h-20'></div>
        ))}
      </div>
    )
  }

  return (
    <div className='pixel-card p-6 bg-gray-800 border-2 border-green-400'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-bold pixel-text'>TOP YIELDS</h3>
        <Percent className='w-6 h-6 text-green-400' />
      </div>
      <div className='space-y-4'>
        {topYields.map((yield_data, index) => (
          <div key={index} className='p-4 bg-gray-700 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-bold'>{yield_data.asset}</div>
                <div className='text-sm text-gray-400'>
                  Via {yield_data.protocol} on {yield_data.chain}
                </div>
              </div>
              <div className='text-green-400 font-bold'>
                {yield_data.apy.toFixed(2)}% APY
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 