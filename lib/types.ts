export interface DailyEntry {
  id: string
  date: string
  cashIn: number
  deposited: number
  toBackSafe: number
  leftInFront: number
  expectedFrontSafe: number
  difference: number
  isBalanced: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BackSafeWithdrawal {
  id: string
  date: string
  amount: number
  reason: string
  createdAt: string
}

export interface SafeBalances {
  frontSafe: number
  backSafe: number
  lastUpdated: string
}
