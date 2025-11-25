"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpFromLine, Plus, Minus } from "lucide-react"
import type { BackSafeWithdrawal, SafeBalances } from "@/lib/types"
import { saveWithdrawal, saveBalances, getWithdrawals } from "@/lib/cash-store"

interface BackSafeWithdrawalProps {
  balances: SafeBalances
  onWithdrawal: () => void
}

export function BackSafeWithdrawalSection({ balances, onWithdrawal }: BackSafeWithdrawalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [withdrawals, setWithdrawals] = useState<BackSafeWithdrawal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  if (!isLoaded && typeof window !== "undefined") {
    setWithdrawals(getWithdrawals())
    setIsLoaded(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = Number.parseFloat(amount) || 0

    if (amountNum > balances.backSafe) {
      alert("Cannot withdraw more than the current back safe balance")
      return
    }

    const withdrawal: BackSafeWithdrawal = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      amount: amountNum,
      reason,
      createdAt: new Date().toISOString(),
    }

    saveWithdrawal(withdrawal)

    const newBalances: SafeBalances = {
      ...balances,
      backSafe: balances.backSafe - amountNum,
      lastUpdated: new Date().toISOString(),
    }
    saveBalances(newBalances)

    setAmount("")
    setReason("")
    setIsOpen(false)
    setWithdrawals(getWithdrawals())
    onWithdrawal()
  }

  const recentWithdrawals = withdrawals.slice(0, 5)

  return (
    <Card className="border-0 shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-3/10 rounded-lg">
              <ArrowUpFromLine className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <CardTitle className="text-lg">Back Safe</CardTitle>
              <p className="text-2xl font-bold font-mono mt-1">{formatCurrency(balances.backSafe)}</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Minus className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw from Back Safe</DialogTitle>
                <DialogDescription>
                  Current balance: <span className="font-mono font-medium">{formatCurrency(balances.backSafe)}</span>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={balances.backSafe}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="pl-7 font-mono h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawReason">Reason for Withdrawal</Label>
                  <Textarea
                    id="withdrawReason"
                    placeholder="e.g., Bank deposit, Change for register..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 h-11">
                    Confirm Withdrawal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-11">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent Withdrawals</p>
          {recentWithdrawals.length > 0 ? (
            <div className="space-y-2">
              {recentWithdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{w.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(w.date)}</p>
                  </div>
                  <p className="font-mono font-medium text-destructive ml-3">-{formatCurrency(w.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-muted/30 rounded-full w-fit mx-auto mb-3">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No withdrawals yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
