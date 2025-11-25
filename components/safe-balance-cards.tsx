"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Vault, ArrowDownToLine, TrendingUp } from "lucide-react"

interface SafeBalanceCardsProps {
  frontSafe: number
  backSafe: number
  lastUpdated: string
}

export function SafeBalanceCards({ frontSafe, backSafe, lastUpdated }: SafeBalanceCardsProps) {
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const total = frontSafe + backSafe

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="relative overflow-hidden border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/95">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Front Safe</p>
              <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(frontSafe)}</p>
              <p className="text-xs text-muted-foreground mt-2">Updated {formatDate(lastUpdated)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg shadow-chart-3/5 bg-gradient-to-br from-card to-card/95">
        <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-full -translate-y-16 translate-x-16" />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Back Safe</p>
              <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(backSafe)}</p>
              <p className="text-xs text-muted-foreground mt-2">Secure storage</p>
            </div>
            <div className="p-3 bg-chart-3/10 rounded-xl">
              <Vault className="h-5 w-5 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg shadow-success/5 bg-gradient-to-br from-card to-card/95">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -translate-y-16 translate-x-16" />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Cash</p>
              <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground mt-2">Combined balance</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
