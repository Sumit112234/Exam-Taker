"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/subscription")

      if (!response.ok) {
        throw new Error("Failed to fetch subscription")
      }

      const data = await response.json()
      setSubscription(data.subscription)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching subscription:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = () => {
    if (user) {
      fetchSubscription()
    }
  }

  // Helper functions to check subscription status
  const isActive = subscription?.status === "active"
  const isPro = isActive && subscription?.plan === "pro"
  const isBasic = isActive && subscription?.plan === "basic"
  const isFree = !subscription || subscription?.status !== "active"

  // Check if subscription is expired
  const isExpired = subscription?.endDate && new Date(subscription.endDate) < new Date()

  // Get days remaining
  const daysRemaining = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  return {
    subscription,
    loading,
    error,
    isActive,
    isPro,
    isBasic,
    isFree,
    isExpired,
    daysRemaining,
    refreshSubscription,
  }
}
