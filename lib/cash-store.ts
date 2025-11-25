import type { DailyEntry, BackSafeWithdrawal, SafeBalances } from "./types"

const ENTRIES_KEY = "cash_reconciliation_entries"
const WITHDRAWALS_KEY = "back_safe_withdrawals"
const BALANCES_KEY = "safe_balances"

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

export function getWithdrawals(): BackSafeWithdrawal[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(WITHDRAWALS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveWithdrawal(withdrawal: BackSafeWithdrawal): void {
  const withdrawals = getWithdrawals()
  withdrawals.unshift(withdrawal)
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
