"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, Calendar, CheckCircle2, AlertTriangle, Lock, ArrowRight, Banknote, Vault } from "lucide-react"
import type { MonthlyArchive } from "@/lib/types"
import {
  getArchives,
  getEntriesForMonth,
  getWithdrawalsForMonth,
  getCurrentMonth,
  getAvailableMonths,
  closeMonth,
  getMonthStartingBalances,
} from "@/lib/cash-store"

interface MonthlyArchivesProps {
  refreshTrigger: number
  onRefresh: () => void
}

export function MonthlyArchives({ refreshTrigger, onRefresh }: MonthlyArchivesProps) {
  const [archives, setArchives] = useState<MonthlyArchive[]>([])
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [viewingArchive, setViewingArchive] = useState<MonthlyArchive | null>(null)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [monthToClose, setMonthToClose] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      const archivesData = await getArchives()
      const monthsData = await getAvailableMonths()
      setArchives(archivesData)
      setAvailableMonths(monthsData)
    }

    loadData()
  }, [refreshTrigger])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const currentMonth = getCurrentMonth()

  const handleViewMonth = async (month: string) => {
    const archive = archives.find((a) => a.month === month)
    if (archive) {
      setViewingArchive(archive)
    } else {
      const entries = await getEntriesForMonth(month)
      const withdrawals = await getWithdrawalsForMonth(month)
      const startingBalances = await getMonthStartingBalances(month)

      const lastEntry = entries.length > 0 ? entries[0] : null

      setViewingArchive({
        month,
        startingFrontSafe: startingBalances.frontSafe,
        startingBackSafe: startingBalances.backSafe,
        endingFrontSafe: lastEntry?.leftInFront ?? startingBalances.frontSafe,
        endingBackSafe: 0,
        entries,
        withdrawals,
        isClosed: false,
      })
    }
    setSelectedMonth(month)
  }

  const handleCloseMonth = async () => {
    if (!monthToClose) return

    const result = await closeMonth(monthToClose)
    if (result) {
      const updatedArchives = await getArchives()
      setArchives(updatedArchives)
      setIsCloseDialogOpen(false)
      setMonthToClose("")
      onRefresh()
    }
  }

  const getPastMonths = () => {
    return availableMonths.filter((m) => m < currentMonth && !archives.find((a) => a.month === m && a.isClosed))
  }

  const pastMonthsToClose = getPastMonths()

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Monthly Archives</CardTitle>
              <CardDescription>View past months and starting balances</CardDescription>
            </div>
          </div>

          {pastMonthsToClose.length > 0 && (
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Lock className="h-4 w-4" />
                  Close Month
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Month</DialogTitle>
                  <DialogDescription>
                    Closing a month will archive all entries and set ending balances as the starting balances for the
                    next month.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Select value={monthToClose} onValueChange={setMonthToClose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month to close" />
                    </SelectTrigger>
                    <SelectContent>
                      {pastMonthsToClose.map((month) => (
                        <SelectItem key={month} value={month}>
                          {formatMonthYear(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <Button onClick={handleCloseMonth} disabled={!monthToClose} className="flex-1">
                      Close & Archive
                    </Button>
                    <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Month selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableMonths.map((month) => {
            const isArchived = archives.find((a) => a.month === month && a.isClosed)
            const isCurrent = month === currentMonth

            return (
              <Button
                key={month}
                variant={selectedMonth === month ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewMonth(month)}
                className="gap-2"
              >
                {isArchived && <Lock className="h-3 w-3" />}
                {isCurrent && <Calendar className="h-3 w-3" />}
                {formatMonthYear(month)}
              </Button>
            )
          })}
        </div>

        {/* Selected month view */}
        {viewingArchive && (
          <div className="space-y-6">
            {/* Starting and ending balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Starting Balances
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Banknote className="h-3 w-3" />
                      Front Safe
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(viewingArchive.startingFrontSafe)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Vault className="h-3 w-3" />
                      Back Safe
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(viewingArchive.startingBackSafe)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  {viewingArchive.isClosed ? "Ending Balances" : "Current Balances"}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Banknote className="h-3 w-3" />
                      Front Safe
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(viewingArchive.endingFrontSafe)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Vault className="h-3 w-3" />
                      Back Safe
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(viewingArchive.endingBackSafe)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Entries table */}
            {viewingArchive.entries.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="text-right font-semibold">Cash In</TableHead>
                      <TableHead className="text-right font-semibold">Deposited</TableHead>
                      <TableHead className="text-right font-semibold">To Back</TableHead>
                      <TableHead className="text-right font-semibold">Left in Front</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingArchive.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-right font-mono text-success">
                          +{formatCurrency(entry.cashIn)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          −{formatCurrency(entry.deposited)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-3">
                          −{formatCurrency(entry.toBackSafe)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(entry.leftInFront)}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.isBalanced ? (
                            <Badge
                              variant="outline"
                              className="border-success/50 bg-success/10 text-success font-medium"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="font-medium">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Off {formatCurrency(Math.abs(entry.difference))}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No entries for this month</div>
            )}

            {/* Withdrawals summary */}
            {viewingArchive.withdrawals.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Back Safe Withdrawals</h4>
                <div className="space-y-2">
                  {viewingArchive.withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{formatDate(w.date)}</span>
                        <span>{w.reason}</span>
                      </div>
                      <span className="font-mono text-destructive">-{formatCurrency(w.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!viewingArchive && availableMonths.length > 0 && (
          <div className="text-center py-8">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Select a month to view</h3>
            <p className="text-sm text-muted-foreground">Click on any month above to see its entries and balances.</p>
          </div>
        )}

        {availableMonths.length === 0 && (
          <div className="text-center py-8">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No archives yet</h3>
            <p className="text-sm text-muted-foreground">Start adding daily entries to build your history.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
