import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Banknote, LogIn, UserPlus, Shield, TrendingUp, History } from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
              <Banknote className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">CashRecon</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Daily Cash Reconciliation
            <span className="block text-primary mt-2">Made Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Track your front and back safe balances, manage deposits, transfers, and withdrawals with ease. Never lose
            track of your cash again.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2 text-base px-8">
                <UserPlus className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-transparent">
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dual Safe Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Manage front and back safes separately with automatic balance calculations and transfer tracking.
            </p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-success/10 rounded-xl w-fit mb-4">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Discrepancy Detection</h3>
            <p className="text-muted-foreground text-sm">
              Instantly spot differences between expected and actual amounts with clear visual indicators.
            </p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-warning/10 rounded-xl w-fit mb-4">
              <History className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Complete History</h3>
            <p className="text-muted-foreground text-sm">
              Full audit trail of all entries, edits, and withdrawals with easy search and filtering.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">Cash Reconciliation App</div>
      </footer>
    </div>
  )
}
