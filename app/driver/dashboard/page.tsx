'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface RideRequest {
  rideId: string
  studentId: string
  studentName: string
  pickupLocation: {
    address: string
  }
  dropLocation: {
    address: string
  }
  fare: number
  status: string
  requestedAt: any
}

interface ActiveRide {
  rideId: string
  studentId: string
  studentName: string
  pickupLocation: { address: string }
  dropLocation: { address: string }
  fare: number
  status: string
}

export default function DriverDashboard() {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [editFareDialog, setEditFareDialog] = useState<{ open: boolean; rideId: string; currentFare: number }>({
    open: false,
    rideId: '',
    currentFare: 0,
  })
  const [newFare, setNewFare] = useState('')

  // Redirect if not logged in or not a driver
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (userData && userData.role !== 'driver') {
      router.push('/student/dashboard')
    } else if (userData) {
      setIsAvailable(userData.isAvailable || false)
    }
  }, [user, userData, router])

  // Listen to ride requests in real-time
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(
      ridesRef,
      where('status', '==', 'requested'),
      orderBy('requestedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: RideRequest[] = []
      snapshot.forEach((doc) => {
        requests.push({ rideId: doc.id, ...doc.data() } as RideRequest)
      })
      setRideRequests(requests)
    })

    return () => unsubscribe()
  }, [user])

  // Listen to active rides (accepted by this driver)
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(
      ridesRef,
      where('driverId', '==', user.uid),
      where('status', 'in', ['accepted', 'ongoing'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0]
        setActiveRide({ rideId: rideDoc.id, ...rideDoc.data() } as ActiveRide)
      } else {
        setActiveRide(null)
      }
    })

    return () => unsubscribe()
  }, [user])

  // Toggle availability
  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return

    setLoading(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        isAvailable: checked,
      })
      setIsAvailable(checked)
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability')
    } finally {
      setLoading(false)
    }
  }

  // Accept ride
  const handleAcceptRide = async (ride: RideRequest) => {
    if (!user) return

    try {
      const rideRef = doc(db, 'rides', ride.rideId)
      await updateDoc(rideRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      })
      alert('Ride accepted! Navigate to pickup location.')
    } catch (error) {
      console.error('Error accepting ride:', error)
      alert('Failed to accept ride')
    }
  }

  // Decline ride
  const handleDeclineRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, {
        status: 'declined',
        declinedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error declining ride:', error)
      alert('Failed to decline ride')
    }
  }

  // Update fare
  const handleUpdateFare = async () => {
    if (!editFareDialog.rideId || !newFare) return

    const fareValue = parseInt(newFare)
    if (isNaN(fareValue) || fareValue <= 0) {
      alert('Please enter a valid fare amount')
      return
    }

    try {
      const rideRef = doc(db, 'rides', editFareDialog.rideId)
      await updateDoc(rideRef, {
        fare: fareValue,
      })
      setEditFareDialog({ open: false, rideId: '', currentFare: 0 })
      setNewFare('')
      alert('Fare updated successfully!')
    } catch (error) {
      console.error('Error updating fare:', error)
      alert('Failed to update fare')
    }
  }

  // Start ride
  const handleStartRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, {
        status: 'ongoing',
        startedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error starting ride:', error)
      alert('Failed to start ride')
    }
  }

  // Complete ride
  const handleCompleteRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
      })
      alert('Ride completed! Waiting for student rating.')
    } catch (error) {
      console.error('Error completing ride:', error)
      alert('Failed to complete ride')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!userData || userData.role !== 'driver') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page content now sits under the global Navbar provided by app/layout.tsx */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Driver Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle>Availability Status</CardTitle>
                <CardDescription>Toggle to accept ride requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <Label htmlFor="availability" className="text-base font-semibold">
                      {isAvailable ? 'Online' : 'Offline'}
                    </Label>
                  </div>
                  <Switch
                    id="availability"
                    checked={isAvailable}
                    onCheckedChange={handleAvailabilityToggle}
                    disabled={loading}
                  />
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🚗 Vehicle: {userData.vehicleType}</p>
                  <p>🔢 Number: {userData.vehicleNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Rides</span>
                  <span className="text-2xl font-bold">{userData.totalRides || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{userData.rating || 0}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={isAvailable ? 'default' : 'secondary'}>
                    {isAvailable ? 'Available' : 'Offline'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Active Ride & Ride Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Ride */}
            {activeRide && (
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                    Active Ride
                  </CardTitle>
                  <CardDescription>Ride in progress with {activeRide.studentName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{activeRide.studentName}</h4>
                      <Badge className="mt-1 bg-yellow-500">
                        {activeRide.status === 'accepted' ? 'Accepted' : 'Ongoing'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{activeRide.fare}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditFareDialog({
                            open: true,
                            rideId: activeRide.rideId,
                            currentFare: activeRide.fare,
                          })
                          setNewFare(activeRide.fare.toString())
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Edit Fare
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Pickup</div>
                        <div className="font-medium">{activeRide.pickupLocation.address}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Drop</div>
                        <div className="font-medium">{activeRide.dropLocation.address}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {activeRide.status === 'accepted' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStartRide(activeRide.rideId)}
                      >
                        Start Ride
                      </Button>
                    )}
                    {activeRide.status === 'ongoing' && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteRide(activeRide.rideId)}
                      >
                        Complete Ride
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ride Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Ride Requests</CardTitle>
                <CardDescription>
                  {!isAvailable
                    ? 'Go online to see ride requests'
                    : activeRide
                    ? 'Complete current ride to accept new requests'
                    : `${rideRequests.length} new request${rideRequests.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAvailable ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Offline</h3>
                    <p className="text-gray-600 mb-4">Turn on availability to start receiving ride requests</p>
                    <Button onClick={() => handleAvailabilityToggle(true)} disabled={loading}>
                      Go Online
                    </Button>
                  </div>
                ) : activeRide ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-3xl">🛺</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ride in Progress</h3>
                    <p className="text-gray-600">Complete your current ride to accept new requests</p>
                  </div>
                ) : rideRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ride Requests</h3>
                    <p className="text-gray-600">You're online! Waiting for ride requests from students.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rideRequests.map((request) => (
                      <Card key={request.rideId} className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{request.studentName}</h4>
                              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                                New Request
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">₹{request.fare}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditFareDialog({
                                    open: true,
                                    rideId: request.rideId,
                                    currentFare: request.fare,
                                  })
                                  setNewFare(request.fare.toString())
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Edit Fare
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Pickup</div>
                                <div className="font-medium">{request.pickupLocation.address}</div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Drop</div>
                                <div className="font-medium">{request.dropLocation.address}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              className="flex-1"
                              onClick={() => handleAcceptRide(request)}
                            >
                              Accept Ride
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleDeclineRide(request.rideId)}
                            >
                              Decline
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Fare Dialog */}
      <Dialog open={editFareDialog.open} onOpenChange={(open) => !open && setEditFareDialog({ open: false, rideId: '', currentFare: 0 })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ride Fare</DialogTitle>
            <DialogDescription>
              Enter the new fare amount for this ride (in ₹ INR)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fare">Fare Amount (₹)</Label>
              <Input
                id="fare"
                type="number"
                placeholder="Enter fare in INR"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500">Current fare: ₹{editFareDialog.currentFare}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditFareDialog({ open: false, rideId: '', currentFare: 0 })}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateFare}>
              Update Fare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
