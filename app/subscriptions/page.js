"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Star, AlertCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions")
      const data = await response.json()
      setSubscriptions(data)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("")
      setCouponDiscount(0)
      return
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setCouponDiscount(data.discount)
        setCouponError("")
      } else {
        setCouponDiscount(0)
        setCouponError(data.message)
      }
    } catch (error) {
      setCouponDiscount(0)
      setCouponError("Error validating coupon")
    }
  }

  const handleSubscribe = async (subscriptionId) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          couponCode: couponDiscount > 0 ? couponCode : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const stripe = await stripePromise
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        alert(data.message || "Error creating checkout session")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error processing payment")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDiscountedPrice = (price) => {
    if (couponDiscount > 0) {
      return price - Math.round((price * couponDiscount) / 100)
    }
    return price
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Unlock premium features and take unlimited exams</p>
      </div>

      {/* Coupon Code Section */}
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Have a coupon code?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="coupon">Coupon Code</Label>
              <Input
                id="coupon"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onBlur={validateCoupon}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={validateCoupon} variant="outline">
                Apply
              </Button>
            </div>
          </div>
          {couponError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{couponError}</AlertDescription>
            </Alert>
          )}
          {couponDiscount > 0 && (
            <Alert className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
              <Check className="h-4 w-4" />
              <AlertDescription>Coupon applied! You&apos;ll get {couponDiscount}% off</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {subscriptions.map((subscription, index) => {
          const originalPrice = subscription.price
          const discountedPrice = calculateDiscountedPrice(originalPrice)
          const isPopular = index === 1 // Make middle plan popular

          return (
            <Card key={subscription._id} className={`relative ${isPopular ? "border-primary" : ""}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{subscription.name}</CardTitle>
                <div className="mt-4">
                  {couponDiscount > 0 && originalPrice !== discountedPrice ? (
                    <div>
                      <span className="text-3xl font-bold">${discountedPrice}</span>
                      <span className="text-lg text-muted-foreground line-through ml-2">${originalPrice}</span>
                      <div className="text-sm text-green-500 font-medium">Save {couponDiscount}%</div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">${originalPrice}</span>
                  )}
                  <span className="text-muted-foreground">/{subscription.duration} days</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {subscription.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(subscription._id)}
                  disabled={isLoading}
                  variant={isPopular ? "default" : "outline"}
                >
                  {isLoading ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All plans include a 30-day money-back guarantee</p>
        <p>Secure payment powered by Stripe</p>
      </div>
    </div>
  )
}
