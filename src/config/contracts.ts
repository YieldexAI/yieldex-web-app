// Type for Ethereum addresses
type Address = `0x${string}`

// Popular ERC20 Tokens
export const TOKEN_CONTRACTS = {
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }
    ] as const,
  }
}
