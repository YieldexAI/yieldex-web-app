'use client'

import {
  ArrowRight,
  Shield,
  LineChart,
  Coins,
  ArrowLeftRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Percent,
  HelpCircle,
} from 'lucide-react'
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ConnectWallet } from '@/components/ConnectWallet'
import { ConnectButton } from '@/components/ConnectButton'
import { AvatarButton } from '@/components/AvatarButton'
import { CreateSmartWallet } from '@/components/CreateSmartWallet'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import {YieldStats} from "@/components/YieldStats";
import {PortfolioOverview} from "@/components/PortfolioOverview";
import {TopYields} from "@/components/TopYields";
import { PixelXIcon, PixelDocsIcon } from '@/components/ui/icons'
import Link from 'next/link'

export default function Home() {
  const { address, isConnected } = useAccount()

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    const targetId = href?.replace('#', '')
    const element = document.getElementById(targetId!)
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pixel-font'>
      {/* Header */}
      <header className='container mx-auto px-4 py-6 relative z-10'>
        <div className='flex flex-col items-center justify-between md:flex-row'>
          <div className='flex items-center'>
            <Image 
              src="/Yieldex_logo.png"
              alt="Yieldex Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className='ml-3 text-xl font-bold pixel-text'>YIELDEX</span>
          </div>

          {!isConnected ? (
            <ConnectWallet>
              <ConnectButton />
            </ConnectWallet>
          ) : (
            <AvatarButton />
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className='hero-section container mx-auto px-4 py-16 relative'>
        <div className='hero-background'></div>
        <div className='max-w-4xl mx-auto text-center space-y-8 relative z-10'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 pixel-text animate-pulse'>
            STABLE YIELD
            <span className='block text-green-400'>SIMPLIFIED</span>
          </h1>

          <p className='text-xl text-gray-300 mb-8 pixel-text-sm'>
            Automatically optimize your stablecoin holdings across DeFi
            protocols
          </p>

          <div className='flex flex-wrap justify-center gap-4'>
            <a href='#dashboard' onClick={handleScroll}>
              <button className='pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 flex items-center gap-2'>
                START EARNING
                <ArrowRight className='w-5 h-5' />
              </button>
            </a>
            <a href='#dashboard' onClick={handleScroll}>
              <button className='pixel-button bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8'>
                LEARN MORE
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Current Yields Section - перемещаем этот блок выше */}
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4 pixel-text'>
            CURRENT YIELDS
          </h2>
          <p className='text-gray-300 pixel-text-sm'>
            Real-time yield data across different assets
          </p>
        </div>
        <YieldStats />
      </div>

      {/* Dashboard Preview Section - теперь этот блок идет после Current Yields */}
      <div id='dashboard' className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4 pixel-text'>
            YOUR YIELD DASHBOARD
          </h2>
          <p className='text-gray-300 pixel-text-sm'>
            Track and optimize your yields in real-time
          </p>
        </div>

        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <TopYields />

            {/* Portfolio Overview */}
            {isConnected ? (
                <PortfolioOverview />
            ) : (
                <div className='lg:col-span-2'>
                  <div className='pixel-card p-6 bg-gray-800 border-2 border-gray-600 h-full relative'>
                    {/* Блюр оверлей */}
                    <div className='absolute inset-0 backdrop-blur-sm bg-gray-900/50 z-10 flex items-center justify-center'>
                      <div className='text-center space-y-4'>
                        <Coins className='w-12 h-12 mx-auto text-gray-500' />
                        <p className='text-xl text-gray-400 pixel-text'>
                          CONNECT YOUR WALLET
                        </p>
                        <p className='text-gray-500 pixel-text-sm'>
                          Connect your wallet to view portfolio analytics
                        </p>
                        <ConnectWallet>
                          <button className='pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6'>
                            CONNECT NOW
                          </button>
                        </ConnectWallet>
                      </div>
                    </div>

                    {/* Заблюренный контент */}
                    <div className='opacity-50'>
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
                              $50,000
                            </div>
                          </div>
                          <div className='p-4 bg-gray-700 rounded-lg'>
                            <div className='text-sm text-gray-400'>Total Yield</div>
                            <div className='text-2xl font-bold text-green-400'>
                              $750
                            </div>
                          </div>
                        </div>
                        <div className='relative h-48 bg-gray-700 rounded-lg p-4'>
                          <BarChart3 className='w-full h-full text-green-400 opacity-25' />
                          <div className='absolute bottom-4 left-4 text-sm'>
                            <div className='text-gray-400'>30-Day Performance</div>
                            <div className='text-green-400'>+15.8%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
              </div>
            </div>
          </div>

          {/*/!* Asset Allocation *!/*/}
          {/*<div className='mt-8 pixel-card p-6 bg-gray-800 border-2 border-green-400'>*/}
          {/*  <div className='flex items-center justify-between mb-6'>*/}
          {/*    <h3 className='text-xl font-bold pixel-text'>ASSET ALLOCATION</h3>*/}
          {/*    <PieChart className='w-6 h-6 text-green-400' />*/}
          {/*  </div>*/}
          {/*  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>*/}
          {/*    <div className='p-4 bg-gray-700 rounded-lg'>*/}
          {/*      <div className='flex items-center justify-between'>*/}
          {/*        <div>USDC</div>*/}
          {/*        <div className='text-green-400'>40%</div>*/}
          {/*      </div>*/}
          {/*      <div className='mt-2 h-2 bg-gray-600 rounded-full'>*/}
          {/*        <div className='h-full w-2/5 bg-green-400 rounded-full'></div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*    <div className='p-4 bg-gray-700 rounded-lg'>*/}
          {/*      <div className='flex items-center justify-between'>*/}
          {/*        <div>USDT</div>*/}
          {/*        <div className='text-green-400'>30%</div>*/}
          {/*      </div>*/}
          {/*      <div className='mt-2 h-2 bg-gray-600 rounded-full'>*/}
          {/*        <div className='h-full w-1/3 bg-green-400 rounded-full'></div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*    <div className='p-4 bg-gray-700 rounded-lg'>*/}
          {/*      <div className='flex items-center justify-between'>*/}
          {/*        <div>DAI</div>*/}
          {/*        <div className='text-green-400'>20%</div>*/}
          {/*      </div>*/}
          {/*      <div className='mt-2 h-2 bg-gray-600 rounded-full'>*/}
          {/*        <div className='h-full w-1/5 bg-green-400 rounded-full'></div>*/}
          {/*      </div>*/}
        {/*</div>*/}
      {/*</div>*/}

      {/* Features Grid */}
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='pixel-card p-6 bg-gray-800 border-2 border-green-400'>
            <div className='mb-4'>
              <Shield className='w-12 h-12 text-green-400' />
            </div>
            <h3 className='text-xl font-bold mb-2 pixel-text'>
              FORTIFIED SECURITY
            </h3>
            <p className='text-gray-300 pixel-text-sm'>
              Battle-tested smart contracts protecting your assets
            </p>
          </div>

          <div className='pixel-card p-6 bg-gray-800 border-2 border-green-400'>
            <div className='mb-4'>
              <LineChart className='w-12 h-12 text-green-400' />
            </div>
            <h3 className='text-xl font-bold mb-2 pixel-text'>
              OPTIMAL YIELDS
            </h3>
            <p className='text-gray-300 pixel-text-sm'>
              Auto-compound and rebalance for maximum returns
            </p>
          </div>

          <div className='pixel-card p-6 bg-gray-800 border-2 border-green-400'>
            <div className='mb-4'>
              <Coins className='w-12 h-12 text-green-400' />
            </div>
            <h3 className='text-xl font-bold mb-2 pixel-text'>MULTI-CHAIN</h3>
            <p className='text-gray-300 pixel-text-sm'>
              Access yields across multiple blockchains
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='container mx-auto px-4 py-16 bg-gray-900'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
          <div className='pixel-stat'>
            <div className='text-4xl font-bold text-green-400 mb-2'>$150M+</div>
            <div className='text-gray-300 pixel-text-sm'>
              TOTAL VALUE LOCKED
            </div>
          </div>
          <div className='pixel-stat'>
            <div className='text-4xl font-bold text-green-400 mb-2'>12%</div>
            <div className='text-gray-300 pixel-text-sm'>AVERAGE APY</div>
          </div>
          <div className='pixel-stat'>
            <div className='text-4xl font-bold text-green-400 mb-2'>10K+</div>
            <div className='text-gray-300 pixel-text-sm'>ACTIVE USERS</div>
          </div>
        </div>
      </div>

      {/* Network Section */}
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4 pixel-text'>
            POWERED BY ARBITRUM
          </h2>
          <p className='text-gray-300 pixel-text-sm'>
            Experience lightning-fast transactions with minimal fees
          </p>
        </div>

        <div className='network-grid'>
          <div className='max-w-lg mx-auto'>
            <div className='network-node arbitrum pixel-card p-8 bg-gray-800 border-2 border-green-400'>
              <div className='w-20 h-20 mx-auto mb-6 flex items-center justify-center'>
                <Coins className='w-16 h-16 text-green-400' />
              </div>
              <span className='network-label block text-xl mb-4'>
                ARBITRUM NETWORK
              </span>
              <div className='network-apy text-2xl mb-4'>APY: 15.1%</div>
              <div className='space-y-4'>
                <div className='flex items-center justify-between px-4 py-2 bg-gray-700 rounded'>
                  <span>Gas Savings</span>
                  <span className='text-green-400'>Up to 97%</span>
                </div>
                <div className='flex items-center justify-between px-4 py-2 bg-gray-700 rounded'>
                  <span>Transaction Speed</span>
                  <span className='text-green-400'>&lt; 1 second</span>
                </div>
                <div className='flex items-center justify-between px-4 py-2 bg-gray-700 rounded'>
                  <span>Security</span>
                  <span className='text-green-400'>Ethereum L2</span>
                </div>
              </div>
            </div>
          </div>

          <div className='network-info pixel-card p-6 bg-gray-800 border-2 border-green-400 mt-8 max-w-lg mx-auto'>
            <div className='flex items-center justify-center gap-4 mb-4'>
              <ArrowLeftRight className='w-8 h-8 text-green-400' />
              <span className='text-xl font-bold pixel-text'>
                SEAMLESS BRIDGING
              </span>
            </div>
            <p className='text-gray-300 pixel-text-sm text-center'>
              Easily bridge your assets to Arbitrum and start earning optimal
              yields instantly
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4 pixel-text'>
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className='flex items-center justify-center gap-2'>
            <HelpCircle className='w-6 h-6 text-green-400' />
            <p className='text-gray-300 pixel-text-sm'>
              Everything you need to know about Yieldex
            </p>
          </div>
        </div>

        <div className='max-w-3xl mx-auto'>
          <Accordion type='single' collapsible className='space-y-4'>
            <AccordionItem
              value='item-1'
              className='pixel-card bg-gray-800 border-2 border-green-400'
            >
              <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                <span className='text-lg font-bold pixel-text'>
                  What is Yieldex?
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-4'>
                <p className='text-gray-300 pixel-text-sm'>
                  Yieldex is a DeFi yield optimizer that automatically manages
                  your stablecoin portfolio across multiple protocols and chains
                  to maximize returns while minimizing risk and gas fees.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value='item-2'
              className='pixel-card bg-gray-800 border-2 border-green-400'
            >
              <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                <span className='text-lg font-bold pixel-text'>
                  How does it work?
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-4'>
                <p className='text-gray-300 pixel-text-sm'>
                  Our smart contracts continuously monitor yield opportunities
                  across major DeFi protocols. When better rates are available,
                  your funds are automatically moved to capture the highest
                  yields, all while maintaining your preferred risk parameters.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value='item-3'
              className='pixel-card bg-gray-800 border-2 border-green-400'
            >
              <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                <span className='text-lg font-bold pixel-text'>
                  Is it safe?
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-4'>
                <p className='text-gray-300 pixel-text-sm'>
                  Security is our top priority. Our smart contracts are audited
                  by leading firms, and we only integrate with battle-tested
                  protocols. We also implement strict risk management strategies
                  and maintain insurance coverage for additional protection.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value='item-4'
              className='pixel-card bg-gray-800 border-2 border-green-400'
            >
              <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                <span className='text-lg font-bold pixel-text'>
                  What are the fees?
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-4'>
                <p className='text-gray-300 pixel-text-sm'>
                  We charge a performance fee of 10% on the yields generated.
                  There are no deposit, withdrawal, or management fees. You only
                  pay when you earn, and our success is aligned with yours.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value='item-5'
              className='pixel-card bg-gray-800 border-2 border-green-400'
            >
              <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                <span className='text-lg font-bold pixel-text'>
                  Which assets are supported?
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-4'>
                <p className='text-gray-300 pixel-text-sm'>
                  We currently support major stablecoins including USDC, USDT,
                  and DAI across multiple chains. More assets and chains will be
                  added based on community demand and security considerations.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto text-center space-y-8'>
          <h2 className='text-3xl font-bold mb-6 pixel-text'>
            FOLLOW THE JOURNEY
          </h2>
          <div className="flex items-center justify-center gap-6">
            <Link
              href="https://x.com/YieldexAi"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-6 py-4 text-gray-400 transition-colors hover:text-white pixel-card bg-gray-800 border-2 border-green-400"
            >
              <div className="h-5 w-5">
                <PixelXIcon />
              </div>
              <span className="text-sm pixel-text">X</span>
            </Link>
            <Link
              href="https://yieldex.gitbook.io/yieldex-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-6 py-4 text-gray-400 transition-colors hover:text-white pixel-card bg-gray-800 border-2 border-green-400"
            >
              <div className="h-5 w-5">
                <PixelDocsIcon />
              </div>
              <span className="text-sm pixel-text">DOCS</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
