'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, ChevronDown, Wallet, Shield, ArrowRight } from 'lucide-react'
import { createPortal } from 'react-dom'

interface TokenInput {
  token: string
  amount: string
}

interface CreateSmartWalletProps {
  onSuccess?: () => void
}

const TOKENS = [
  { symbol: 'USDT', name: 'Tether USD', icon: '💵' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💰' },
]

const RISK_LEVELS = [
  { name: 'Low Risk', apy: '8%', description: 'Focus on stable yields with lower risk' },
  { name: 'Medium', apy: '12%', description: 'Optimal balance of yield and risk' },
  { name: 'High Risk', apy: '15%', description: 'Maximum yields with higher risk tolerance' },
]

export function CreateSmartWallet({ onSuccess }: CreateSmartWalletProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState(TOKENS[0])
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(1)
  const [selectedRisk, setSelectedRisk] = useState(RISK_LEVELS[1])
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState('0x1234...5678')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTokenSelect = (token: (typeof TOKENS)[0]) => {
    setSelectedToken(token)
    setIsTokenSelectOpen(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
      setIsTokenSelectOpen(false)
    }
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleActivate = async () => {
    setIsLoading(true)
    setStep(2)
    
    // Mock wallet creation process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStep(3)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStep(4)

    setIsLoading(false)
  }

  const handleDeposit = () => {
    setIsLoading(true)
    // Simulate deposit
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      onSuccess?.()
      // Close modal after successful deposit
      setTimeout(() => {
        setIsOpen(false)
      }, 1500)
    }, 2000)
  }

  const calculateEstimatedEarnings = () => {
    if (!amount) return '0'
    const apy = parseFloat(selectedRisk.apy) / 100
    return ((Number(amount) * apy) / 12).toFixed(2)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='relative'>
              <label className='block pixel-text text-gray-300 mb-2 text-lg'>
                Select Token
              </label>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsTokenSelectOpen(!isTokenSelectOpen)
                }}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg flex items-center justify-between text-white hover:bg-gray-700/50 transition-colors backdrop-blur-sm'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 flex items-center justify-center bg-gray-700/50 rounded-lg border border-gray-600/50'>
                    <span className='text-xl'>{selectedToken.icon}</span>
                  </div>
                  <div className='flex flex-col items-start'>
                    <span className='pixel-text font-medium'>{selectedToken.name}</span>
                    <span className='pixel-text text-sm text-gray-400'>{selectedToken.symbol}</span>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isTokenSelectOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isTokenSelectOpen && (
                <div
                  className='absolute top-full left-0 right-0 mt-2 bg-gray-800/90 border border-gray-600/50 rounded-lg shadow-xl z-10 backdrop-blur-sm'
                  onClick={(e) => e.stopPropagation()}
                >
                  {TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTokenSelect(token)
                      }}
                      className='w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                    >
                      <div className='w-8 h-8 flex items-center justify-center bg-gray-700/50 rounded-lg border border-gray-600/50'>
                        <span className='text-xl'>{token.icon}</span>
                      </div>
                      <div className='flex flex-col items-start'>
                        <span className='pixel-text font-medium text-white'>{token.name}</span>
                        <span className='pixel-text text-sm text-gray-400'>{token.symbol}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className='block pixel-text text-gray-300 mb-2 text-lg'>
                Amount
              </label>
              <div className='relative'>
                <input
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter ${selectedToken.symbol} amount`}
                  className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pixel-text backdrop-blur-sm'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 pixel-text text-gray-400'>
                  {selectedToken.symbol}
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className='text-center py-8'>
            <div className='animate-pulse flex flex-col items-center'>
              <Wallet className='w-12 h-12 text-blue-400 mb-4' />
              <p className='pixel-text text-gray-300'>Creating your Smart Wallet...</p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className='text-center py-8'>
            <div className='flex flex-col items-center'>
              <div className='relative'>
                <Wallet className='w-12 h-12 text-blue-400 mb-4' />
                <div className='absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                  <Check className='w-3 h-3 text-white' />
                </div>
              </div>
              <p className='pixel-text text-gray-300'>Smart Wallet Created!</p>
              <p className='pixel-text text-gray-400 mt-2'>Initializing account...</p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className='space-y-6 py-4'>
            <div className='text-center'>
              <div className='flex flex-col items-center mb-6'>
                <div className='relative'>
                  <div className='relative'>
                    <Wallet className='w-12 h-12 text-green-400 mb-4' />
                    <div className='absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                      <Check className='w-3 h-3 text-white' />
                    </div>
                    <div className='absolute inset-0 bg-green-400/20 rounded-full animate-ping' />
                  </div>
                </div>
                <p className='pixel-text text-green-400 font-bold mb-2'>Smart Wallet Created!</p>
                <p className='pixel-text text-gray-400'>Ready to start earning</p>
              </div>

              <div className='bg-gradient-to-b from-gray-700/50 to-gray-800/50 p-4 rounded-lg mb-6 border border-gray-600 shadow-lg'>
                <div className='flex items-center justify-center gap-2 mb-3'>
                  <div className='h-2 w-2 bg-green-400 rounded-full animate-pulse'></div>
                  <h4 className='pixel-text text-white font-medium'>Auto-Rebalancing Active</h4>
                </div>
                <p className='pixel-text text-gray-300 leading-relaxed'>
                  Your funds will be automatically distributed across top DeFi protocols to maximize your yields while maintaining optimal risk levels.
                </p>
                <div className='mt-4 flex items-center justify-center gap-3 text-sm'>
                  <div className='px-3 py-1.5 rounded bg-gray-800/80 text-green-400 border border-green-400/20 shadow-sm'>
                    <div className='pixel-text font-medium'>APY up to {selectedRisk.apy}</div>
                  </div>
                  <div className='px-3 py-1.5 rounded bg-gray-800/80 text-blue-400 border border-blue-400/20 shadow-sm'>
                    <div className='pixel-text font-medium'>Auto-compound</div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block pixel-text text-gray-300 mb-1'>
                  Risk Level
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {RISK_LEVELS.map((risk) => (
                    <button
                      key={risk.name}
                      onClick={() => setSelectedRisk(risk)}
                      className={`p-2 rounded border ${
                        selectedRisk.name === risk.name
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } text-sm transition-all duration-200`}
                    >
                      <div className='pixel-text font-medium'>{risk.name}</div>
                      <div className='pixel-text text-xs mt-1 text-gray-400'>{risk.apy} APY</div>
                    </button>
                  ))}
                </div>
                <p className='mt-1 pixel-text text-gray-400'>{selectedRisk.description}</p>
              </div>

              <div>
                <label className='block pixel-text text-gray-300 mb-1'>
                  Initial Deposit Amount
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter ${selectedToken.symbol} amount`}
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pixel-text'
                  />
                  <div className='absolute right-3 top-1/2 -translate-y-1/2 pixel-text text-gray-400'>
                    {selectedToken.symbol}
                  </div>
                </div>
                <div className='flex justify-between mt-1 text-sm'>
                  <p className='pixel-text text-gray-400'>
                    Min. deposit: 100 {selectedToken.symbol}
                  </p>
                  {amount && Number(amount) >= 100 && (
                    <p className='pixel-text text-green-400'>
                      Est. monthly earnings: {calculateEstimatedEarnings()} {selectedToken.symbol}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={handleDeposit}
                  disabled={isLoading || isSuccess || !amount || Number(amount) < 100}
                  className={`flex-1 pixel-button ${
                    isSuccess
                      ? 'bg-green-500 hover:bg-green-500'
                      : !amount || Number(amount) < 100
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white font-bold py-3 px-4 flex items-center justify-center gap-2 transition-all duration-200`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Depositing...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className='w-4 h-4' />
                      Deposited!
                    </>
                  ) : (
                    'Deposit'
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {isSuccess ? (
        <div className='bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-600/50 backdrop-blur-sm space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-green-500/20 p-2 rounded-lg'>
              <Wallet className='w-6 h-6 text-green-400' />
            </div>
            <div>
              <h3 className='pixel-text text-white font-bold'>Smart Wallet Active</h3>
              <p className='pixel-text text-gray-400 text-sm'>{walletAddress}</p>
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-3 px-3 py-2 bg-gray-800/80 rounded-lg border border-gray-700/50'>
              <div className='w-8 h-8 flex items-center justify-center bg-gray-700/50 rounded-lg border border-gray-600/50'>
                <span className='text-xl'>{selectedToken.icon}</span>
              </div>
              <div>
                <div className='pixel-text text-white'>{amount} {selectedToken.symbol}</div>
                <div className='pixel-text text-sm text-gray-400'>Deposited</div>
              </div>
            </div>

            <div className='flex items-center justify-between px-3 py-2 bg-gray-800/80 rounded-lg border border-gray-700/50'>
              <div className='pixel-text text-sm text-gray-400'>Est. APY</div>
              <div className='flex items-center gap-2'>
                <span className='pixel-text text-green-400'>{selectedRisk.apy}</span>
                <div className='h-2 w-2 bg-green-400 rounded-full animate-pulse'></div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between px-3 py-2 bg-gray-800/80 rounded-lg border border-gray-700/50'>
            <div className='flex items-center gap-2'>
              <Shield className='w-4 h-4 text-blue-400' />
              <span className='pixel-text text-sm text-gray-400'>Risk Level</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='pixel-text text-white'>{selectedRisk.name}</span>
              <div className='h-2 w-2 bg-blue-400 rounded-full'></div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className='pixel-button bg-blue-500/90 hover:bg-blue-600 text-white font-bold py-3 px-8 transition-all duration-200 backdrop-blur-sm rounded-lg shadow-lg'
        >
          <span className='pixel-text'>Create Smart Wallet</span>
        </button>
      )}

      {/* Modal Portal */}
      {mounted && isOpen && createPortal(
        <div
          className='fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none'
          onClick={handleOverlayClick}
        >
          <div
            className='bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 md:p-8 w-full max-w-4xl shadow-xl border border-gray-600/50 relative pixel-font'
            onClick={handleModalClick}
          >
            {step === 4 ? (
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                  <div className='text-center'>
                    <div className='flex flex-col items-center mb-6'>
                      <div className='relative'>
                        <div className='relative'>
                          <Wallet className='w-12 h-12 text-green-400 mb-4' />
                          <div className='absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                            <Check className='w-3 h-3 text-white' />
                          </div>
                          <div className='absolute inset-0 bg-green-400/20 rounded-full animate-ping' />
                        </div>
                      </div>
                      <p className='pixel-text text-green-400 font-bold mb-2 text-xl'>Smart Wallet Created!</p>
                      <p className='pixel-text text-gray-400'>Ready to start earning</p>
                    </div>

                    <div className='bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-lg mb-6 border border-gray-600/50 shadow-lg backdrop-blur-sm'>
                      <div className='flex items-center justify-center gap-2 mb-4'>
                        <div className='h-2 w-2 bg-green-400 rounded-full animate-pulse'></div>
                        <h4 className='pixel-text text-white font-medium text-lg'>Auto-Rebalancing Active</h4>
                      </div>
                      <p className='pixel-text text-gray-300 leading-relaxed'>
                        Your funds will be automatically distributed across top DeFi protocols to maximize your yields while maintaining optimal risk levels.
                      </p>
                      <div className='mt-6 flex items-center justify-center gap-4 text-sm'>
                        <div className='px-4 py-2 rounded bg-gray-800/80 text-green-400 border border-green-400/20 shadow-sm backdrop-blur-sm'>
                          <div className='pixel-text font-medium'>APY up to {selectedRisk.apy}</div>
                        </div>
                        <div className='px-4 py-2 rounded bg-gray-800/80 text-blue-400 border border-blue-400/20 shadow-sm backdrop-blur-sm'>
                          <div className='pixel-text font-medium'>Auto-compound</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-6'>
                  <div>
                    <label className='block pixel-text text-gray-300 mb-2 text-lg'>
                      Risk Level
                    </label>
                    <div className='grid grid-cols-3 gap-3'>
                      {RISK_LEVELS.map((risk) => (
                        <button
                          key={risk.name}
                          onClick={() => setSelectedRisk(risk)}
                          className={`p-3 rounded-lg border backdrop-blur-sm ${
                            selectedRisk.name === risk.name
                              ? 'border-blue-500/50 bg-blue-500/10 text-white shadow-lg shadow-blue-500/20'
                              : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                          } transition-all duration-200`}
                        >
                          <div className='pixel-text font-medium text-sm'>{risk.name}</div>
                          <div className='pixel-text text-xs mt-2 text-gray-400'>{risk.apy} APY</div>
                        </button>
                      ))}
                    </div>
                    <p className='mt-2 pixel-text text-gray-400'>{selectedRisk.description}</p>
                  </div>

                  <div>
                    <label className='block pixel-text text-gray-300 mb-2 text-lg'>
                      Initial Deposit Amount
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter ${selectedToken.symbol} amount`}
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pixel-text backdrop-blur-sm'
                      />
                      <div className='absolute right-4 top-1/2 -translate-y-1/2 pixel-text text-gray-400'>
                        {selectedToken.symbol}
                      </div>
                    </div>
                    <div className='flex justify-between mt-2'>
                      <p className='pixel-text text-gray-400 text-sm'>
                        Min. deposit: 100 {selectedToken.symbol}
                      </p>
                      {amount && Number(amount) >= 100 && (
                        <p className='pixel-text text-green-400 text-sm'>
                          Est. monthly earnings: {calculateEstimatedEarnings()} {selectedToken.symbol}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={handleDeposit}
                      disabled={isLoading || isSuccess || !amount || Number(amount) < 100}
                      className={`flex-1 pixel-button ${
                        isSuccess
                          ? 'bg-green-500/90 hover:bg-green-500'
                          : !amount || Number(amount) < 100
                          ? 'bg-gray-600/50 cursor-not-allowed'
                          : 'bg-blue-500/90 hover:bg-blue-600'
                      } text-white font-bold py-3 px-4 flex items-center justify-center gap-2 transition-all duration-200 backdrop-blur-sm rounded-lg shadow-lg`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          <span className='pixel-text'>Depositing...</span>
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check className='w-4 h-4' />
                          <span className='pixel-text'>Deposited!</span>
                        </>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <span className='pixel-text'>Deposit</span>
                          <ArrowRight className='w-4 h-4' />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className='text-center mb-8'>
                  <h3 className='pixel-text text-3xl font-bold mb-6 text-white'>
                    Initial Deposit
                  </h3>
                  <div className='bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-lg mb-6 border border-gray-600/50 backdrop-blur-sm'>
                    <p className='pixel-text text-gray-300 leading-relaxed text-lg'>
                      A Smart Wallet is your secure gateway to automated DeFi earnings
                    </p>
                  </div>
                  <p className='pixel-text text-gray-400 text-lg'>
                    Choose your initial deposit amount to activate your Smart Wallet
                  </p>
                </div>

                {renderStep()}

                {step === 1 && (
                  <div className='mt-8 flex gap-4'>
                    <button
                      onClick={handleActivate}
                      disabled={isLoading}
                      className='flex-1 pixel-button bg-blue-500/90 hover:bg-blue-600 text-white font-bold py-3 px-6 flex items-center justify-center gap-2 transition-all duration-200 backdrop-blur-sm rounded-lg shadow-lg'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          <span className='pixel-text'>Creating...</span>
                        </>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <span className='pixel-text'>Create Wallet</span>
                          <ArrowRight className='w-4 h-4' />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setIsTokenSelectOpen(false)
                      }}
                      disabled={isLoading}
                      className='pixel-button bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-3 px-6 backdrop-blur-sm rounded-lg shadow-lg'
                    >
                      <span className='pixel-text'>Cancel</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
