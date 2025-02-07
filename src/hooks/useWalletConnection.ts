import { useCallback, useEffect, useState } from 'react'
import { useConnect } from 'wagmi'

export function useWalletConnection() {
  const { connect, connectors, error, isPending } = useConnect()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Debug connector status
    connectors.forEach((connector) => {
      console.log(`Connector ${connector.name}:`, {
        ready: connector.ready,
        id: connector.id,
        uid: connector.uid,
      })
    })
  }, [connectors])

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
    }
  }, [error])

  const handleConnect = useCallback(
    async (connector: any) => {
      try {
        console.log('Attempting to connect with:', connector.name)
        await connect({ connector })
        setIsOpen(false)
      } catch (err) {
        console.error('Failed to connect:', err)
      }
    },
    [connect],
  )

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    handleConnect,
    toggleDropdown,
    isOpen,
    connectors,
    error,
    isPending,
  }
}
