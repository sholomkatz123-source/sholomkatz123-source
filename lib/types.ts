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
  manuallyApproved?: boolean
  approvalNote?: string
  approvedAt?: string
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

export interface MonthlyArchive {
  month: string // Format: "YYYY-MM"
  startingFrontSafe: number
  startingBackSafe: number
  endingFrontSafe: number
  endingBackSafe: number
  entries: DailyEntry[]
  withdrawals: BackSafeWithdrawal[]
  isClosed: boolean
  closedAt?: string
}

export interface BackSafeTransaction {
  id: string
  date: string
  amount: number
  type: "deposit" | "withdrawal"
  reason?: string
  fromEntryId?: string // Links to DailyEntry if it's a deposit from front safe
  withdrawalId?: string // Links to BackSafeWithdrawal if it's a withdrawal
  createdAt: string
}
