import type { DailyEntry, BackSafeWithdrawal, SafeBalances, MonthlyArchive, BackSafeTransaction } from "./types"

const ENTRIES_KEY = "cash_reconciliation_entries"
const WITHDRAWALS_KEY = "back_safe_withdrawals"
const BALANCES_KEY = "safe_balances"
const ARCHIVES_KEY = "monthly_archives"
const TRANSACTIONS_KEY = "back_safe_transactions"

export function getEntries(): DailyEntry[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ENTRIES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveEntry(entry: DailyEntry): void {
  const entries = getEntries()
  const existingIndex = entries.findIndex((e) => e.id === entry.id)
  if (existingIndex >= 0) {
    entries[existingIndex] = entry
  } else {
    entries.unshift(entry)
  }
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id)
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function approveEntry(id: string, approvalNote: string): void {
  const entries = getEntries()
  const entryIndex = entries.findIndex((e) => e.id === id)
  if (entryIndex >= 0) {
    entries[entryIndex] = {
      ...entries[entryIndex],
      manuallyApproved: true,
      approvalNote,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  }
}

export function removeApproval(id: string): void {
  const entries = getEntries()
  const entryIndex = entries.findIndex((e) => e.id === id)
  if (entryIndex >= 0) {
    entries[entryIndex] = {
      ...entries[entryIndex],
      manuallyApproved: false,
      approvalNote: undefined,
      approvedAt: undefined,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  }
}

export function getWithdrawals(): BackSafeWithdrawal[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(WITHDRAWALS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveWithdrawal(withdrawal: BackSafeWithdrawal): void {
  const withdrawals = getWithdrawals()
  const existingIndex = withdrawals.findIndex((w) => w.id === withdrawal.id)
  if (existingIndex >= 0) {
    withdrawals[existingIndex] = withdrawal
  } else {
    withdrawals.unshift(withdrawal)
  }
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals))
}

export function deleteWithdrawal(id: string): void {
  const withdrawals = getWithdrawals().filter((w) => w.id !== id)
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals))
}

export function getBalances(): SafeBalances {
  if (typeof window === "undefined") {
    return { frontSafe: 0, backSafe: 0, lastUpdated: new Date().toISOString() }
  }
  const data = localStorage.getItem(BALANCES_KEY)
  return data ? JSON.parse(data) : { frontSafe: 0, backSafe: 0, lastUpdated: new Date().toISOString() }
}

export function saveBalances(balances: SafeBalances): void {
  localStorage.setItem(BALANCES_KEY, JSON.stringify(balances))
}

export function calculateExpectedFrontSafe(
  previousBalance: number,
  cashIn: number,
  deposited: number,
  toBackSafe: number,
): number {
  return previousBalance + cashIn - deposited - toBackSafe
}

export function getLastEntryForDate(date: string): DailyEntry | undefined {
  const entries = getEntries()
  return entries.find((e) => e.date === date)
}

export function getPreviousDayBalance(): number {
  const entries = getEntries()
  if (entries.length === 0) return getBalances().frontSafe
  return entries[0].leftInFront
}

export function getBackSafeTransactions(): BackSafeTransaction[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveBackSafeTransaction(transaction: BackSafeTransaction): void {
  const transactions = getBackSafeTransactions()
  transactions.unshift(transaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function getBackSafeTransactionsForMonth(month: string): BackSafeTransaction[] {
  const transactions = getBackSafeTransactions()
  return transactions.filter((t) => t.date.startsWith(month))
}

export function getArchives(): MonthlyArchive[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ARCHIVES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveArchive(archive: MonthlyArchive): void {
  const archives = getArchives()
  const existingIndex = archives.findIndex((a) => a.month === archive.month)
  if (existingIndex >= 0) {
    archives[existingIndex] = archive
  } else {
    archives.unshift(archive)
  }
  // Sort archives by month descending
  archives.sort((a, b) => b.month.localeCompare(a.month))
  localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives))
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function getEntriesForMonth(month: string): DailyEntry[] {
  const entries = getEntries()
  return entries.filter((e) => e.date.startsWith(month))
}

export function getWithdrawalsForMonth(month: string): BackSafeWithdrawal[] {
  const withdrawals = getWithdrawals()
  return withdrawals.filter((w) => w.date.startsWith(month))
}

export function closeMonth(month: string): MonthlyArchive | null {
  const balances = getBalances()
  const entries = getEntriesForMonth(month)
  const withdrawals = getWithdrawalsForMonth(month)

  if (entries.length === 0) return null

  // Get starting balances from previous archive or default to 0
  const archives = getArchives()
  const previousArchive = archives.find((a) => a.month < month && a.isClosed)

  const startingFrontSafe = previousArchive?.endingFrontSafe ?? 0
  const startingBackSafe = previousArchive?.endingBackSafe ?? 0

  const archive: MonthlyArchive = {
    month,
    startingFrontSafe,
    startingBackSafe,
    endingFrontSafe: balances.frontSafe,
    endingBackSafe: balances.backSafe,
    entries,
    withdrawals,
    isClosed: true,
    closedAt: new Date().toISOString(),
  }

  saveArchive(archive)
  return archive
}

export function getMonthStartingBalances(month: string): { frontSafe: number; backSafe: number } {
  const archives = getArchives()
  const previousArchive = archives
    .filter((a) => a.month < month && a.isClosed)
    .sort((a, b) => b.month.localeCompare(a.month))[0]

  if (previousArchive) {
    return {
      frontSafe: previousArchive.endingFrontSafe,
      backSafe: previousArchive.endingBackSafe,
    }
  }

  return { frontSafe: 0, backSafe: 0 }
}

export function getAvailableMonths(): string[] {
  const entries = getEntries()
  const archives = getArchives()
  const months = new Set<string>()

  // Add current month
  months.add(getCurrentMonth())

  // Add months from entries
  entries.forEach((e) => months.add(e.date.slice(0, 7)))

  // Add months from archives
  archives.forEach((a) => months.add(a.month))

  return Array.from(months).sort((a, b) => b.localeCompare(a))
}
