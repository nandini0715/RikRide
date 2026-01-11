'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
const RideMapPicker = dynamic(() => import('@/app/components/RideMapPicker'), { ssr: false })
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Driver {
  uid: string
  name: string
  vehicleType: string
  vehicleNumber: string
  rating: number
  totalRides: number
  isAvailable: boolean
}

interface ActiveRide {
  rideId: string
  driverId: string
  driverName: string
  pickupLocation: { address: string }
  dropLocation: { address: string }
  fare: number
  status: string
}

interface Location {
  lat: number
  lng: number
  address: string
}

export default function StudentDashboardContent() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [pickup, setPickup] = useState<Location | null>(null)
  const [drop, setDrop] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [ratingDialog, setRatingDialog] = useState<{ open: boolean; rideId: string }>({
    open: false,
    rideId: '',
  })
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (userData && userData.role !== 'student') {
      router.push('/driver/dashboard')
    }
  }, [user, userData, router])

  // Listen to available drivers
  useEffect(() => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'driver'), where('isAvailable', '==', true))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivers: Driver[] = []
      snapshot.forEach((doc) => {
        drivers.push({ uid: doc.id, ...doc.data() } as Driver)
      })
      setAvailableDrivers(drivers)
    })

    return () => unsubscribe()
  }, [])

  // Listen to active ride
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(ridesRef, where('studentId', '==', user.uid), where('status', 'in', ['requested', 'accepted', 'ongoing']))

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

  // Listen for completed rides for rating
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(ridesRef, where('studentId', '==', user.uid), where('status', '==', 'completed'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((rideDoc) => {
        if (!rideDoc.data().rating) {
          setRatingDialog({ open: true, rideId: rideDoc.id })
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  const handleRequestRide = (driver: Driver) => {
    setSelectedDriver(driver)
    setPickup(null)
    setDrop(null)
    setIsRequestDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!user || !userData || !selectedDriver || !pickup || !drop) {
      alert('Please select both pickup and drop locations')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'rides'), {
        studentId: user.uid,
        studentName: userData.name,
        driverId: selectedDriver.uid,
        driverName: selectedDriver.name,
        pickupLocation: { address: pickup.address, coordinates: { lat: pickup.lat, lng: pickup.lng } },
        dropLocation: { address: drop.address, coordinates: { lat: drop.lat, lng: drop.lng } },
        fare: 50,
        status: 'requested',
        requestedAt: serverTimestamp(),
      })

      setIsRequestDialogOpen(false)
      setPickup(null)
      setDrop(null)
      setSelectedDriver(null)
    } catch (error) {
      console.error('Error requesting ride:', error)
      alert('Failed to request ride')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, { status: 'cancelled', cancelledAt: serverTimestamp() })
    } catch (error) {
      console.error('Error cancelling ride:', error)
    }
  }

  const handleSubmitRating = async () => {
    if (!ratingDialog.rideId || rating === 0) return

    try {
      const rideRef = doc(db, 'rides', ratingDialog.rideId)
      await updateDoc(rideRef, { rating, ratedAt: serverTimestamp() })
      setRatingDialog({ open: false, rideId: '' })
      setRating(0)
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      requested: { text: 'Waiting', className: 'bg-amber-100 text-amber-700 border-amber-200' },
      accepted: { text: 'Accepted', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      ongoing: { text: 'On the way', className: 'bg-green-100 text-green-700 border-green-200' },
    }
    return badges[status] || badges.requested
  }

  if (!userData || userData.role !== 'student') {
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
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {userData.name.split(' ')[0]}! 👋</h1>
              <p className="text-amber-100 mt-1">Find your next ride</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/20 rounded-xl px-4 py-2">
              <span className="text-sm">🎓 {userData.collegeName}</span>
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
              <div className="h-20 bg-gradient-to-r from-amber-400 to-orange-400" />
              <CardContent className="-mt-10 pb-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl font-bold">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-bold text-lg">{userData.name}</h3>
                  <p className="text-gray-500 text-sm">{userData.email}</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200">
                    🎓 Student
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">College</span>
                    <span className="font-medium">{userData.collegeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Student ID</span>
                    <span className="font-medium">{userData.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{userData.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Ride Card */}
            {activeRide && (
              <Card className="shadow-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                    <CardTitle className="text-lg">Current Ride</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-amber-500 text-white">
                          {getInitials(activeRide.driverName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{activeRide.driverName}</p>
                        <Badge className={getStatusBadge(activeRide.status).className}>
                          {getStatusBadge(activeRide.status).text}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">₹{activeRide.fare}</p>
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

                  {activeRide.status === 'requested' && (
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelRide(activeRide.rideId)}
                    >
                      Cancel Ride
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Available Drivers */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Drivers</CardTitle>
                    <CardDescription>
                      {activeRide ? 'Complete current ride first' : `${availableDrivers.length} drivers nearby`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activeRide ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-5xl">🛺</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ride in Progress</h3>
                    <p className="text-gray-600">Complete your current ride to book another</p>
                  </div>
                ) : availableDrivers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Drivers Available</h3>
                    <p className="text-gray-600">Check back in a few minutes</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableDrivers.map((driver) => (
                      <Card key={driver.uid} className="border-2 hover:border-amber-300 transition-all hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-14 w-14">
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                                  {getInitials(driver.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-lg">{driver.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center text-sm text-gray-600">
                                    ⭐ {driver.rating.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">{driver.totalRides} rides</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-700 mb-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                Online
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>🛺 {driver.vehicleType}</span>
                              <span>#{driver.vehicleNumber}</span>
                            </div>
                            <Button 
                              onClick={() => handleRequestRide(driver)}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            >
                              Book Ride
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

      {/* Request Ride Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Your Ride</DialogTitle>
            <DialogDescription>
              Select pickup and drop locations for {selectedDriver?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RideMapPicker
              onPickupSelect={setPickup}
              onDropSelect={setDrop}
              pickup={pickup}
              drop={drop}
            />

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Fare</span>
                <span className="text-2xl font-bold text-amber-600">₹50</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Final fare may vary based on distance</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              disabled={loading || !pickup || !drop}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              {loading ? 'Requesting...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onOpenChange={(open) => !open && setRatingDialog({ open: false, rideId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Ride</DialogTitle>
            <DialogDescription>How was your experience?</DialogDescription>
          </DialogHeader>
          
          <div className="py-8">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-5xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p className="text-center mt-4 text-gray-600">
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setRatingDialog({ open: false, rideId: '' }); setRating(0) }}>
              Skip
            </Button>
            <Button onClick={handleSubmitRating} disabled={rating === 0} className="bg-amber-500 hover:bg-amber-600">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
