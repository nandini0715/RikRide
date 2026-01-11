'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
const RideMapPicker = dynamic(() => import('@/app/components/RideMapPicker'), { ssr: false })
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export default function StudentDashboard() {
  const { user, userData, logout } = useAuth()
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

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (userData && userData.role !== 'student') {
      router.push('/driver/dashboard')
    }
  }, [user, userData, router])

  // Listen to available drivers in real-time
  useEffect(() => {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('role', '==', 'driver'),
      where('isAvailable', '==', true)
    )

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
    const q = query(
      ridesRef,
      where('studentId', '==', user.uid),
      where('status', 'in', ['requested', 'accepted', 'ongoing'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0]
        const rideData = { rideId: rideDoc.id, ...rideDoc.data() } as ActiveRide
        setActiveRide(rideData)
      } else {
        setActiveRide(null)
      }
    })

    return () => unsubscribe()
  }, [user])

  // Separate listener for completed rides to show rating dialog
  useEffect(() => {
    if (!user) return

    const ridesRef = collection(db, 'rides')
    const q = query(
      ridesRef,
      where('studentId', '==', user.uid),
      where('status', '==', 'completed')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((rideDoc) => {
        // Show rating dialog if ride is completed and not yet rated
        if (!rideDoc.data().rating) {
          setRatingDialog({ open: true, rideId: rideDoc.id })
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleRequestRide = (driver: Driver) => {
    setSelectedDriver(driver)
    setPickup(null)
    setDrop(null)
    setIsRequestDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!user || !userData || !selectedDriver) return
    
    if (!pickup || !drop) {
      alert('Please select both pickup and drop locations on the map')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'rides'), {
        studentId: user.uid,
        studentName: userData.name,
        driverId: selectedDriver.uid,
        driverName: selectedDriver.name,
        pickupLocation: {
          address: pickup.address,
          coordinates: { lat: pickup.lat, lng: pickup.lng },
        },
        dropLocation: {
          address: drop.address,
          coordinates: { lat: drop.lat, lng: drop.lng },
        },
        fare: 50,
        status: 'requested',
        requestedAt: serverTimestamp(),
      })

      alert('Ride requested successfully! Waiting for driver confirmation.')
      setIsRequestDialogOpen(false)
      setPickup(null)
      setDrop(null)
      setSelectedDriver(null)
    } catch (error) {
      console.error('Error requesting ride:', error)
      alert('Failed to request ride. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId)
      await updateDoc(rideRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      })
      alert('Ride cancelled successfully.')
    } catch (error) {
      console.error('Error cancelling ride:', error)
      alert('Failed to cancel ride')
    }
  }

  const handleSubmitRating = async () => {
    if (!ratingDialog.rideId || rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      const rideRef = doc(db, 'rides', ratingDialog.rideId)
      await updateDoc(rideRef, {
        rating,
        ratedAt: serverTimestamp(),
      })

      // Update driver rating
      if (activeRide) {
        const driverRef = doc(db, 'users', activeRide.driverId)
        await updateDoc(driverRef, {
          rating: rating,
        })
      }

      setRatingDialog({ open: false, rideId: '' })
      setRating(0)
      alert('Thank you for your rating!')
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      requested: { text: 'Requested', className: 'bg-blue-100 text-blue-700' },
      accepted: { text: 'Accepted', className: 'bg-yellow-100 text-yellow-700' },
      ongoing: { text: 'Ongoing', className: 'bg-green-100 text-green-700' },
      completed: { text: 'Completed', className: 'bg-gray-100 text-gray-700' },
    }
    return badges[status] || badges.requested
  }

  if (!userData || userData.role !== 'student') {
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">RikHub Student</h1>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userData.name}</p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/student/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/student/history')}>
                  Ride History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Student Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{userData.name}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">College</div>
                  <div className="font-medium">{userData.collegeName}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">Student ID</div>
                  <div className="font-medium">{userData.studentId}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{userData.phone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Active Ride Status */}
            {activeRide && (
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                    Current Ride
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-500">Driver</div>
                        <div className="font-semibold">{activeRide.driverName}</div>
                      </div>
                      <Badge className={getStatusBadge(activeRide.status).className}>
                        {getStatusBadge(activeRide.status).text}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">₹{activeRide.fare}</div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500">Pickup</div>
                      <div className="font-medium">{activeRide.pickupLocation.address}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Drop</div>
                      <div className="font-medium">{activeRide.dropLocation.address}</div>
                    </div>
                  </div>

                  {activeRide.status === 'requested' && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
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
            <Card>
              <CardHeader>
                <CardTitle>Available Drivers</CardTitle>
                <CardDescription>
                  {activeRide
                    ? 'Complete your current ride to book another'
                    : `${availableDrivers.length} driver${availableDrivers.length !== 1 ? 's' : ''} available now`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeRide ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-3xl">🛺</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ride in Progress</h3>
                    <p className="text-gray-600">Complete your current ride to book another</p>
                  </div>
                ) : availableDrivers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drivers Available</h3>
                    <p className="text-gray-600">Please check back in a few minutes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDrivers.map((driver) => (
                      <Card key={driver.uid} className="border-2 hover:border-yellow-400 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-yellow-100 text-yellow-700">
                                  {getInitials(driver.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-lg">{driver.name}</h4>
                                <Badge className="mt-1 bg-green-100 text-green-700">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                  Available
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold">{driver.rating.toFixed(1)}</span>
                                <span className="text-yellow-500">⭐</span>
                              </div>
                              <div className="text-xs text-gray-500">{driver.totalRides} rides</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="text-xs text-gray-500">Vehicle</div>
                              <div className="font-medium text-sm">{driver.vehicleType}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Number</div>
                              <div className="font-medium text-sm">{driver.vehicleNumber}</div>
                            </div>
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => handleRequestRide(driver)}
                          >
                            Request Ride
                          </Button>
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

      {/* Request Ride Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Ride</DialogTitle>
            <DialogDescription>
              Search and select pickup and drop locations for {selectedDriver?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RideMapPicker
              onPickupSelect={setPickup}
              onDropSelect={setDrop}
              pickup={pickup}
              drop={drop}
            />

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated Fare</span>
                <span className="text-2xl font-bold text-blue-600">₹50</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Driver can adjust the final fare</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={loading}>
              {loading ? 'Requesting...' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onOpenChange={(open) => !open && setRatingDialog({ open: false, rideId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Ride</DialogTitle>
            <DialogDescription>
              How was your experience with {activeRide?.driverName}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRatingDialog({ open: false, rideId: '' })
                setRating(0)
              }}
            >
              Skip
            </Button>
            <Button onClick={handleSubmitRating} disabled={rating === 0}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
