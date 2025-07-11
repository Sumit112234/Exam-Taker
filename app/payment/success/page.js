"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    } else {
      setError("No session ID provided")
      setLoading(false)
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/payment/session/${sessionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Link href="/subscriptions">
              <Button>Back to Subscriptions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {session?.mode === "subscription" && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Subscription Active
            </Badge>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Amount: <span className="font-medium">${(session?.amount_total / 100).toFixed(2)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Email: <span className="font-medium">{session?.customer_email}</span>
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/exams">
              <Button variant="outline" className="w-full">
                Start Taking Exams
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">You will receive a confirmation email shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
