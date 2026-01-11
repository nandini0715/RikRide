'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '../components/Navbar'

type UserRole = 'student' | 'driver' | null

export default function SignupPage() {
  const [role, setRole] = useState<UserRole>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    studentId: '',
    vehicleNumber: '',
    vehicleType: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signup } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      if (!role) {
        setError('Please select a role')
        return
      }

      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role,
      }

      if (role === 'student') {
        userData.collegeName = formData.collegeName
        userData.studentId = formData.studentId
      } else {
        userData.vehicleNumber = formData.vehicleNumber
        userData.vehicleType = formData.vehicleType
      }

      await signup(formData.email, formData.password, userData)
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!role) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Join RikHub</CardTitle>
              <CardDescription>Choose your account type to get started</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div onClick={() => setRole('student')} className="cursor-pointer group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-900">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Student</h3>
                      <p className="text-sm text-gray-600">Book rides easily from college to anywhere</p>
                    </div>
                    <Badge variant="secondary">For Students</Badge>
                  </CardContent>
                </Card>
              </div>

              <div onClick={() => setRole('driver')} className="cursor-pointer group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-900">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Driver</h3>
                      <p className="text-sm text-gray-600">Earn money by providing rides to students</p>
                    </div>
                    <Badge variant="secondary">For Drivers</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-gray-900 hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Sign up as {role === 'student' ? 'Student' : 'Driver'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setRole(null)}>Change</Button>
            </div>
            <CardDescription>Create your RikHub account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} required />
              </div>

              {role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input id="collegeName" placeholder="ABC College" value={formData.collegeName} onChange={(e) => updateFormData('collegeName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" placeholder="2024-CS-001" value={formData.studentId} onChange={(e) => updateFormData('studentId', e.target.value)} required />
                  </div>
                </>
              )}

              {role === 'driver' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input id="vehicleNumber" placeholder="DL-01-AB-1234" value={formData.vehicleNumber} onChange={(e) => updateFormData('vehicleNumber', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input id="vehicleType" placeholder="Auto Rickshaw" value={formData.vehicleType} onChange={(e) => updateFormData('vehicleType', e.target.value)} required />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-gray-900 hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
