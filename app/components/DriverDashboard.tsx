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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RideRequest {
  rideId: string
  studentId: string
  studentName: string
  pickupLocation: { address: string }
  dropLocation: { address: string }
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

export default function DriverDashboardContent() {
  const { user, userData } = useAuth()
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

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (userData && userData.role !== 'driver') {
      router.push('/student/dashboard')
    } else if (userData) {
      setIsAvailable(userData.isAvailable || false)
    }
  }, [user, userData, router])

  // Listen to ride requests
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(ridesRef, where('status', '==', 'requested'), orderBy('requestedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: RideRequest[] = []
      snapshot.forEach((doc) => {
        requests.push({ rideId: doc.id, ...doc.data() } as RideRequest)
      })
      setRideRequests(requests)
    })

    return () => unsubscribe()
  }, [user])

  // Listen to active rides
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(ridesRef, where('driverId', '==', user.uid), where('status', 'in', ['accepted', 'ongoing']))

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

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return

    setLoading(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { isAvailable: checked })
      setIsAvailable(checked)
    } catch (error) {
      console.error('Error updating availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRide = async (ride: RideRequest) => {
    if (!user) return

    try {
      const rideRef = doc(db, 'rides', ride.rideId)
      await updateDoc(rideRef, { status: 'accepted', acceptedAt: serverTimestamp() })
    } catch (error) {
      console.error('Error accepting ride:', error)
    }
  }

  const handleDeclineRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, { status: 'declined', declinedAt: serverTimestamp() })
    } catch (error) {
      console.error('Error declining ride:', error)
    }
  }

  const handleUpdateFare = async () => {
    if (!editFareDialog.rideId || !newFare) return

    const fareValue = parseInt(newFare)
    if (isNaN(fareValue) || fareValue <= 0) return

    try {
      const rideRef = doc(db, 'rides', editFareDialog.rideId)
      await updateDoc(rideRef, { fare: fareValue })
      setEditFareDialog({ open: false, rideId: '', currentFare: 0 })
      setNewFare('')
    } catch (error) {
      console.error('Error updating fare:', error)
    }
  }

  const handleStartRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, { status: 'ongoing', startedAt: serverTimestamp() })
    } catch (error) {
      console.error('Error starting ride:', error)
    }
  }

  const handleCompleteRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, { status: 'completed', completedAt: serverTimestamp() })
    } catch (error) {
      console.error('Error completing ride:', error)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (!userData || userData.role !== 'driver') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {userData.name.split(' ')[0]}! 🚗</h1>
              <p className="text-green-100 mt-1">
                {isAvailable ? 'You are online and accepting rides' : 'Go online to start earning'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isAvailable ? 'bg-white/20' : 'bg-white/10'}`}>
                <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`} />
                <span className="font-medium">{isAvailable ? 'Online' : 'Offline'}</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-green-400 to-emerald-400" />
              <CardContent className="-mt-10 pb-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white text-2xl font-bold">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-bold text-lg">{userData.name}</h3>
                  <p className="text-gray-500 text-sm">{userData.email}</p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    🚗 Driver
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle</span>
                    <span className="font-medium">{userData.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Number</span>
                    <span className="font-medium">{userData.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating</span>
                    <span className="font-medium">⭐ {userData.rating || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Rides</span>
                    <span className="font-medium">{userData.totalRides || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-amber-600">{userData.totalRides || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Rides</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">⭐ {userData.rating || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Rating</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Ride */}
            {activeRide && (
              <Card className="shadow-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <CardTitle className="text-lg">Active Ride</CardTitle>
                  </div>
                  <CardDescription>Ride with {activeRide.studentName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-500 text-white">
                          {getInitials(activeRide.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{activeRide.studentName}</p>
                        <Badge className={activeRide.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                          {activeRide.status === 'accepted' ? 'Accepted' : 'Ongoing'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{activeRide.fare}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditFareDialog({ open: true, rideId: activeRide.rideId, currentFare: activeRide.fare })
                          setNewFare(activeRide.fare.toString())
                        }}
                        className="text-xs text-blue-600"
                      >
                        Edit Fare
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="font-medium text-sm">{activeRide.pickupLocation.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5" />
                      <div>
                        <p className="text-xs text-gray-500">Drop</p>
                        <p className="font-medium text-sm">{activeRide.dropLocation.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {activeRide.status === 'accepted' && (
                      <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => handleStartRide(activeRide.rideId)}>
                        Start Ride
                      </Button>
                    )}
                    {activeRide.status === 'ongoing' && (
                      <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => handleCompleteRide(activeRide.rideId)}>
                        Complete Ride
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ride Requests */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ride Requests</CardTitle>
                    <CardDescription>
                      {!isAvailable ? 'Go online to see requests' : activeRide ? 'Complete current ride first' : `${rideRequests.length} new requests`}
                    </CardDescription>
                  </div>
                  {isAvailable && !activeRide && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse" />
                      Live
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isAvailable ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You're Offline</h3>
                    <p className="text-gray-600 mb-4">Go online to start receiving ride requests</p>
                    <Button onClick={() => handleAvailabilityToggle(true)} disabled={loading} className="bg-green-500 hover:bg-green-600">
                      Go Online
                    </Button>
                  </div>
                ) : activeRide ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-5xl">🛺</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ride in Progress</h3>
                    <p className="text-gray-600">Complete your current ride to accept new requests</p>
                  </div>
                ) : rideRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Yet</h3>
                    <p className="text-gray-600">You're online! Waiting for ride requests...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rideRequests.map((request) => (
                      <Card key={request.rideId} className="border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-amber-500 text-white">
                                  {getInitials(request.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{request.studentName}</p>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">New Request</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-amber-600">₹{request.fare}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditFareDialog({ open: true, rideId: request.rideId, currentFare: request.fare })
                                  setNewFare(request.fare.toString())
                                }}
                                className="text-xs text-blue-600"
                              >
                                Edit Fare
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                              <div>
                                <p className="text-xs text-gray-500">Pickup</p>
                                <p className="font-medium text-sm">{request.pickupLocation.address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5" />
                              <div>
                                <p className="text-xs text-gray-500">Drop</p>
                                <p className="font-medium text-sm">{request.dropLocation.address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => handleAcceptRide(request)}>
                              Accept
                            </Button>
                            <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleDeclineRide(request.rideId)}>
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
      </div>

      {/* Edit Fare Dialog */}
      <Dialog open={editFareDialog.open} onOpenChange={(open) => !open && setEditFareDialog({ open: false, rideId: '', currentFare: 0 })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fare</DialogTitle>
            <DialogDescription>Enter the new fare amount</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fare">Fare Amount (₹)</Label>
              <Input
                id="fare"
                type="number"
                placeholder="Enter fare"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500">Current: ₹{editFareDialog.currentFare}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFareDialog({ open: false, rideId: '', currentFare: 0 })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFare} className="bg-amber-500 hover:bg-amber-600">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
