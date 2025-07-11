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
                      <span className="text-3xl font-bold"> ₹{discountedPrice}</span>
                      <span className="text-lg text-muted-foreground line-through ml-2"> ₹{originalPrice}</span>
                      <div className="text-sm text-green-500 font-medium">Save {couponDiscount}%</div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold"> ₹{originalPrice}</span>
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




// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Check, Star } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"
// import { useSubscription } from "@/hooks/useSubscription"
// import { getStripe } from "@/utils/stripe"
// import { useToast } from "@/hooks/use-toast"

// // Define plans directly in the component
// const PLANS = [
//   {
//     id: "free",
//     name: "Free",
//     description: "Perfect for getting started",
//     price: 0,
//     features: [
//       "5 practice exams per month",
//       "Basic performance analytics",
//       "Community support",
//       "Standard question bank access",
//     ],
//   },
//   {
//     id: "basic",
//     name: "Basic",
//     description: "Great for regular practice",
//     price: 9.99,
//     features: [
//       "25 practice exams per month",
//       "Advanced performance analytics",
//       "Email support",
//       "Full question bank access",
//       "Detailed explanations",
//       "Progress tracking",
//     ],
//   },
//   {
//     id: "pro",
//     name: "Pro",
//     description: "Best for serious exam preparation",
//     price: 19.99,
//     features: [
//       "Unlimited practice exams",
//       "Premium analytics & insights",
//       "Priority support",
//       "Custom exam creation",
//       "Performance comparison",
//       "Exam scheduling",
//       "Detailed solution explanations",
//       "Mock test simulations",
//       "Study plan recommendations",
//     ],
//     popular: true,
//   },
// ]

// export default function Subscriptions() {
//   const { user } = useAuth()
//   const { subscription, isPro, isBasic, loading: subscriptionLoading } = useSubscription()
//   const { toast } = useToast()

//   const [loading, setLoading] = useState(null)
//   const [appliedCoupon, setAppliedCoupon] = useState(null)
//   const [couponCode, setCouponCode] = useState("")
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   const handleSubscribe = async (subscriptionId) => {
//     if (!user) {
//       toast({
//         title: "Authentication Required",
//         description: "Please log in to subscribe to a plan.",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       setLoading(subscriptionId)

//       const response = await fetch("/api/payment/create-checkout-session", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           subscriptionId,
//           couponCode: appliedCoupon?.code,
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         if (data.testMode) {
//           toast({
//             title: "Test Mode Active",
//             description: "Use test card: 4242 4242 4242 4242 with any future expiry and CVC",
//             duration: 8000,
//           })
//         }
//         throw new Error(data.message)
//       }

//       if (data.sessionId) {
//         if (data.testMode) {
//           toast({
//             title: "Test Mode",
//             description: "Redirecting to test payment. Use card: 4242 4242 4242 4242",
//             duration: 5000,
//           })
//         }

//         const stripe = await getStripe()
//         const { error } = await stripe.redirectToCheckout({
//           sessionId: data.sessionId,
//         })

//         if (error) {
//           throw new Error(error.message)
//         }
//       }
//     } catch (error) {
//       console.error("Subscription error:", error)
//       toast({
//         title: "Error",
//         description: error.message || "Failed to process subscription",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(null)
//     }
//   }

//   const handleApplyCoupon = async () => {
//     if (!couponCode.trim()) {
//       setAppliedCoupon(null)
//       return
//     }

//     try {
//       const response = await fetch(`/api/payment/coupon?code=${encodeURIComponent(couponCode)}`)
//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message)
//       }

//       setAppliedCoupon(data)
//       toast({
//         title: "Success",
//         description: `Coupon applied! ${data.percent_off ? `${data.percent_off}% off` : `$${data.amount_off / 100} off`}`,
//       })
//     } catch (error) {
//       setAppliedCoupon(null)
//       toast({
//         title: "Error",
//         description: error.message || "Failed to apply coupon",
//         variant: "destructive",
//       })
//     }
//   }

//   if (!mounted) {
//     return null
//   }

//   return (
//     <div className="container py-6">
//       <div className="mb-8 text-center">
//         <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
//         <p className="text-muted-foreground mt-2">Unlock premium features and take unlimited exams</p>
//       </div>

//       {/* Test Mode Indicator */}
//       {process.env.NODE_ENV === "development" && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center space-x-2">
//             <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
//               TEST MODE
//             </Badge>
//             <div className="text-sm text-yellow-700">
//               <p className="font-medium">Test Card Numbers:</p>
//               <p>
//                 Success: <code className="bg-yellow-100 px-1 rounded">4242 4242 4242 4242</code>
//               </p>
//               <p>
//                 Declined: <code className="bg-yellow-100 px-1 rounded">4000 0000 0000 0002</code>
//               </p>
//               <p>Use any future date for expiry and any 3-digit CVC</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Coupon Code Section */}
//       <Card className="max-w-md mx-auto mb-8">
//         <CardHeader>
//           <CardTitle className="text-lg">Have a coupon code?</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex gap-2">
//             <div className="flex-1">
//               <Input
//                 placeholder="Enter coupon code"
//                 value={couponCode}
//                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//                 onBlur={handleApplyCoupon}
//               />
//             </div>
//             <Button onClick={handleApplyCoupon} variant="outline">
//               Apply
//             </Button>
//           </div>
//           {appliedCoupon && (
//             <Alert className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
//               <Check className="h-4 w-4" />
//               <AlertDescription>
//                 Coupon applied! You'll get{" "}
//                 {appliedCoupon.percent_off
//                   ? `${appliedCoupon.percent_off}% off`
//                   : `$${appliedCoupon.amount_off / 100} off`}
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>

//       {/* Subscription Plans */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
//         {PLANS.map((plan) => {
//           const isCurrentPlan =
//             (plan.id === "basic" && isBasic) ||
//             (plan.id === "pro" && isPro) ||
//             (plan.id === "free" && !isPro && !isBasic)
//           const isPopular = plan.popular

//           return (
//             <Card
//               key={plan.id}
//               className={`relative ${isPopular ? "border-primary" : ""} ${isCurrentPlan ? "bg-muted/50" : ""}`}
//             >
//               {isPopular && (
//                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                   <Badge className="bg-primary text-primary-foreground">
//                     <Star className="w-3 h-3 mr-1" />
//                     Most Popular
//                   </Badge>
//                 </div>
//               )}
//               <CardHeader className="text-center">
//                 <CardTitle className="text-2xl">{plan.name}</CardTitle>
//                 <CardDescription>{plan.description}</CardDescription>
//                 <div className="mt-4">
//                   <span className="text-3xl font-bold">${plan.price}</span>
//                   <span className="text-muted-foreground">/month</span>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-3">
//                   {plan.features.map((feature, featureIndex) => (
//                     <li key={featureIndex} className="flex items-center">
//                       <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span className="text-sm">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//               <div className="p-6 pt-0">
//                 <Button
//                   className="w-full"
//                   onClick={() => handleSubscribe(plan.id)}
//                   disabled={isCurrentPlan || loading === plan.id || plan.id === "free"}
//                   variant={isPopular ? "default" : "outline"}
//                 >
//                   {isCurrentPlan
//                     ? "Current Plan"
//                     : loading === plan.id
//                       ? "Processing..."
//                       : plan.id === "free"
//                         ? "Free Plan"
//                         : "Subscribe Now"}
//                 </Button>
//               </div>
//             </Card>
//           )
//         })}
//       </div>

//       <div className="text-center mt-8 text-sm text-muted-foreground">
//         <p>All plans include a 30-day money-back guarantee</p>
//         <p>Secure payment powered by Stripe</p>
//       </div>
//     </div>
//   )
// }
