"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Calculator, Save, X } from "lucide-react"
import type { DailyEntry, SafeBalances } from "@/lib/types"
import { getPreviousDayBalance, saveEntry, saveBalances } from "@/lib/cash-store"

interface DailyEntryFormProps {
  balances: SafeBalances
  onEntrySaved: () => void
  editingEntry?: DailyEntry | null
  onCancelEdit?: () => void
}

export function DailyEntryForm({ balances, onEntrySaved, editingEntry, onCancelEdit }: DailyEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [cashIn, setCashIn] = useState("")
  const [deposited, setDeposited] = useState("")
  const [toBackSafe, setToBackSafe] = useState("")
  const [leftInFront, setLeftInFront] = useState("")
  const [notes, setNotes] = useState("")
  const [previousBalance, setPreviousBalance] = useState(0)

  useEffect(() => {
    const loadPreviousBalance = async () => {
      if (editingEntry) {
        setDate(editingEntry.date)
        setCashIn(editingEntry.cashIn.toString())
        setDeposited(editingEntry.deposited.toString())
        setToBackSafe(editingEntry.toBackSafe.toString())
        setLeftInFront(editingEntry.leftInFront.toString())
        setNotes(editingEntry.notes || "")
        setPreviousBalance(
          editingEntry.expectedFrontSafe - editingEntry.cashIn + editingEntry.deposited + editingEntry.toBackSafe,
        )
      } else {
        const balance = await getPreviousDayBalance()
        setPreviousBalance(balance)
      }
    }
    loadPreviousBalance()
  }, [editingEntry])

  const cashInNum = Number.parseFloat(cashIn) || 0
  const depositedNum = Number.parseFloat(deposited) || 0
  const toBackSafeNum = Number.parseFloat(toBackSafe) || 0
  const leftInFrontNum = Number.parseFloat(leftInFront) || 0

  const expectedFrontSafe = previousBalance + cashInNum - depositedNum - toBackSafeNum
  const difference = leftInFrontNum - expectedFrontSafe
  const isBalanced = Math.abs(difference) < 0.01

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const entry: DailyEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      date,
      cashIn: cashInNum,
      deposited: depositedNum,
      toBackSafe: toBackSafeNum,
      leftInFront: leftInFrontNum,
      expectedFrontSafe,
      difference,
      isBalanced,
      notes: notes || undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const isEditing = !!editingEntry
    const previousToBackSafe = editingEntry?.toBackSafe || 0
    await saveEntry(entry, isEditing, previousToBackSafe)

    // saveBalances is now a no-op since balances are calculated from transactions
    await saveBalances({
      frontSafe: leftInFrontNum,
      backSafe: balances.backSafe + toBackSafeNum,
      lastUpdated: new Date().toISOString(),
    })

    setCashIn("")
    setDeposited("")
    setToBackSafe("")
    setLeftInFront("")
    setNotes("")
    setDate(new Date().toISOString().split("T")[0])

    onEntrySaved()
    if (onCancelEdit) onCancelEdit()
  }

  const handleCancel = () => {
    setCashIn("")
    setDeposited("")
    setToBackSafe("")
    setLeftInFront("")
    setNotes("")
    setDate(new Date().toISOString().split("T")[0])
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{editingEntry ? "Edit Daily Entry" : "Daily Cash Entry"}</CardTitle>
            <CardDescription>
              Previous balance:{" "}
              <span className="font-mono font-medium text-foreground">{formatCurrency(previousBalance)}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashIn" className="text-sm font-medium">
                Cash In (Today&apos;s Total)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="cashIn"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={cashIn}
                  onChange={(e) => setCashIn(e.target.value)}
                  required
                  className="h-11 pl-7 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposited" className="text-sm font-medium">
                Amount Deposited
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="deposited"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={deposited}
                  onChange={(e) => setDeposited(e.target.value)}
                  required
                  className="h-11 pl-7 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toBackSafe" className="text-sm font-medium">
                To Back Safe
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="toBackSafe"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={toBackSafe}
                  onChange={(e) => setToBackSafe(e.target.value)}
                  required
                  className="h-11 pl-7 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leftInFront" className="text-sm font-medium">
                Actual Count (Front Safe)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="leftInFront"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={leftInFront}
                  onChange={(e) => setLeftInFront(e.target.value)}
                  required
                  className="h-11 pl-7 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any notes about today's reconciliation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border/50">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Reconciliation Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="font-mono font-semibold text-lg">{formatCurrency(previousBalance)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">+ Cash In</p>
                <p className="font-mono font-semibold text-lg text-success">{formatCurrency(cashInNum)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">− Deposited</p>
                <p className="font-mono font-semibold text-lg text-destructive">{formatCurrency(depositedNum)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">− To Back</p>
                <p className="font-mono font-semibold text-lg text-chart-3">{formatCurrency(toBackSafeNum)}</p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Expected</p>
                <p className="font-mono font-bold text-xl">{formatCurrency(expectedFrontSafe)}</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Actual</p>
                <p className="font-mono font-bold text-xl">{formatCurrency(leftInFrontNum)}</p>
              </div>
              <div className={`text-center p-3 rounded-lg ${isBalanced ? "bg-success/10" : "bg-destructive/10"}`}>
                <p className="text-xs text-muted-foreground mb-1">Difference</p>
                <p className={`font-mono font-bold text-xl ${isBalanced ? "text-success" : "text-destructive"}`}>
                  {difference >= 0 ? "+" : ""}
                  {formatCurrency(difference)}
                </p>
              </div>
            </div>
          </div>

          {leftInFront && (
            <Alert
              variant={isBalanced ? "default" : "destructive"}
              className={isBalanced ? "border-success/50 bg-success/5" : ""}
            >
              {isBalanced ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle className="font-semibold">{isBalanced ? "Balanced" : "Discrepancy Detected"}</AlertTitle>
              <AlertDescription>
                {isBalanced
                  ? "Your cash count matches the expected amount."
                  : `There is a ${formatCurrency(Math.abs(difference))} ${difference > 0 ? "overage" : "shortage"}. Please verify your count or add a note.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 h-11 font-medium shadow-lg shadow-primary/20">
              <Save className="h-4 w-4 mr-2" />
              {editingEntry ? "Update Entry" : "Save Entry"}
            </Button>
            {editingEntry && (
              <Button type="button" variant="outline" onClick={handleCancel} className="h-11 bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
