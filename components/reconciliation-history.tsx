"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History, Edit, Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, FileText } from "lucide-react"
import type { DailyEntry } from "@/lib/types"
import { getEntries, deleteEntry } from "@/lib/cash-store"

interface ReconciliationHistoryProps {
  onEdit: (entry: DailyEntry) => void
  refreshTrigger: number
}

export function ReconciliationHistory({ onEdit, refreshTrigger }: ReconciliationHistoryProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(0)

  if ((!isLoaded || lastRefresh !== refreshTrigger) && typeof window !== "undefined") {
    setEntries(getEntries())
    setIsLoaded(true)
    setLastRefresh(refreshTrigger)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id)
      setEntries(getEntries())
    }
  }

  const displayedEntries = showAll ? entries : entries.slice(0, 7)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Reconciliation History</CardTitle>
            <CardDescription>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Cash In</TableHead>
                    <TableHead className="text-right font-semibold">Deposited</TableHead>
                    <TableHead className="text-right font-semibold">To Back</TableHead>
                    <TableHead className="text-right font-semibold">Left in Front</TableHead>
                    <TableHead className="text-right font-semibold">Difference</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedEntries.map((entry) => (
                    <TableRow key={entry.id} className="group">
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-2">
                              {formatDate(entry.date)}
                              {entry.notes && <FileText className="h-3 w-3 text-muted-foreground" />}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{entry.notes || "No notes"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
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
                      <TableCell
                        className={`text-right font-mono font-semibold ${entry.isBalanced ? "text-success" : "text-destructive"}`}
                      >
                        {entry.difference >= 0 ? "+" : ""}
                        {formatCurrency(entry.difference)}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.isBalanced ? (
                          <Badge variant="outline" className="border-success/50 bg-success/10 text-success font-medium">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-medium">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Off
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(entry)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit entry</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete entry</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {entries.length > 7 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" onClick={() => setShowAll(!showAll)} className="gap-2">
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show All ({entries.length} entries)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No entries yet</h3>
            <p className="text-sm text-muted-foreground">Add your first daily entry above to start tracking.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
