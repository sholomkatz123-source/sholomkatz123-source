import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Banknote, Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
              <Banknote className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">CashRecon</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-4 bg-success/10 rounded-full w-fit mb-4">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email inbox and click on the confirmation link to activate your account.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="gap-2 bg-transparent">
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
