"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, DollarSign, Users, TrendingUp, Calendar, MoreHorizontal, Star, Gift } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState([])
  const [coupons, setCoupons] = useState([])
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false)
  const [isAddCouponDialogOpen, setIsAddCouponDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyGrowth: 0,
    churnRate: 0,
  })
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "",
    features: [],
    stripePriceId: "",
    isActive: true,
  })
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  })

  useEffect(() => {
    fetchSubscriptions()
    fetchCoupons()
    fetchStats()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions")
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons")
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleAddPlan = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPlan,
          price: Number.parseFloat(newPlan.price),
          duration: Number.parseInt(newPlan.duration),
          features: newPlan.features.filter((f) => f.trim()),
        }),
      })

      if (response.ok) {
        const plan = await response.json()
        setSubscriptions([...subscriptions, plan])
        setNewPlan({
          name: "",
          price: "",
          duration: "",
          features: [],
          stripePriceId: "",
          isActive: true,
        })
        setIsAddPlanDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding plan:", error)
    }
  }

  const handleAddCoupon = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCoupon,
          discount: Number.parseInt(newCoupon.discount),
          maxUses: Number.parseInt(newCoupon.maxUses),
        }),
      })

      if (response.ok) {
        const coupon = await response.json()
        setCoupons([...coupons, coupon])
        setNewCoupon({
          code: "",
          discount: "",
          maxUses: "",
          expiresAt: "",
          isActive: true,
        })
        setIsAddCouponDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding coupon:", error)
    }
  }

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const response = await fetch(`/api/admin/subscriptions/${planId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setSubscriptions(subscriptions.filter((plan) => plan._id !== planId))
        }
      } catch (error) {
        console.error("Error deleting plan:", error)
      }
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await fetch(`/api/admin/coupons/${couponId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setCoupons(coupons.filter((coupon) => coupon._id !== couponId))
        }
      } catch (error) {
        console.error("Error deleting coupon:", error)
      }
    }
  }

  const togglePlanStatus = async (planId, isActive) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setSubscriptions(subscriptions.map((plan) => (plan._id === planId ? { ...plan, isActive } : plan)))
      }
    } catch (error) {
      console.error("Error updating plan status:", error)
    }
  }

  const addFeature = () => {
    setNewPlan({ ...newPlan, features: [...newPlan.features, ""] })
  }

  const updateFeature = (index, value) => {
    const features = [...newPlan.features]
    features[index] = value
    setNewPlan({ ...newPlan, features })
  }

  const removeFeature = (index) => {
    const features = newPlan.features.filter((_, i) => i !== index)
    setNewPlan({ ...newPlan, features })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions Management</h1>
        <p className="text-muted-foreground">Manage subscription plans, pricing, and coupons</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">From last month</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Manage your subscription plans and pricing</CardDescription>
                </div>
                <Dialog open={isAddPlanDialogOpen} onOpenChange={setIsAddPlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Subscription Plan</DialogTitle>
                      <DialogDescription>Create a new subscription plan for users</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPlan} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Plan Name</Label>
                          <Input
                            id="name"
                            value={newPlan.name}
                            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            placeholder="Premium Plan"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newPlan.price}
                            onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                            placeholder="199"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (days)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newPlan.duration}
                            onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                            placeholder="30"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                          <Input
                            id="stripePriceId"
                            value={newPlan.stripePriceId}
                            onChange={(e) => setNewPlan({ ...newPlan, stripePriceId: e.target.value })}
                            placeholder="price_1234567890"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Features</Label>
                        {newPlan.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              placeholder="Feature description"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addFeature}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Feature
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={newPlan.isActive}
                          onCheckedChange={(checked) => setNewPlan({ ...newPlan, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddPlanDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Plan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((plan) => (
                      <TableRow key={plan._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {plan.name}
                            {plan.name.toLowerCase().includes("premium") && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>₹{plan.price}</TableCell>
                        <TableCell>{plan.duration} days</TableCell>
                        <TableCell>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{plan.subscribers || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => togglePlanStatus(plan._id, !plan.isActive)}>
                                {plan.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePlan(plan._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Coupon Codes</CardTitle>
                  <CardDescription>Manage discount coupons and promotional codes</CardDescription>
                </div>
                <Dialog open={isAddCouponDialogOpen} onOpenChange={setIsAddCouponDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Gift className="mr-2 h-4 w-4" />
                      Add Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Coupon</DialogTitle>
                      <DialogDescription>Create a new discount coupon</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCoupon} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="code">Coupon Code</Label>
                          <Input
                            id="code"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            placeholder="SAVE20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount">Discount (%)</Label>
                          <Input
                            id="discount"
                            type="number"
                            min="1"
                            max="100"
                            value={newCoupon.discount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                            placeholder="20"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="maxUses">Max Uses</Label>
                          <Input
                            id="maxUses"
                            type="number"
                            min="1"
                            value={newCoupon.maxUses}
                            onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                            placeholder="100"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiresAt">Expires At</Label>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={newCoupon.expiresAt}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={newCoupon.isActive}
                          onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddCouponDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Coupon</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-mono">{coupon.code}</TableCell>
                        <TableCell>{coupon.discount}%</TableCell>
                        <TableCell>
                          {coupon.usedCount}/{coupon.maxUses}
                        </TableCell>
                        <TableCell>{new Date(coupon.expiresAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              coupon.isActive && new Date(coupon.expiresAt) > new Date() ? "default" : "secondary"
                            }
                          >
                            {coupon.isActive && new Date(coupon.expiresAt) > new Date() ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
