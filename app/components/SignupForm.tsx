'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

type UserRole = 'student' | 'driver' | null

interface FileUploadState {
  file: File | null
  preview: string | null
  uploading: boolean
}

export default function SignupForm() {
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
  const [documentUpload, setDocumentUpload] = useState<FileUploadState>({
    file: null,
    preview: null,
    uploading: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { signup } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentUpload({
          file,
          preview: reader.result as string,
          uploading: false,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentUpload({
          file,
          preview: reader.result as string,
          uploading: false,
        })
      }
      reader.readAsDataURL(file)
    }
  }

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

    if (!documentUpload.file) {
      setError(role === 'driver' ? 'Please upload your Aadhaar or Driving License' : 'Please upload your College ID')
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
        verificationStatus: 'pending',
        documentUploaded: true,
      }

      if (role === 'student') {
        userData.collegeName = formData.collegeName
        userData.studentId = formData.studentId
      } else {
        userData.vehicleNumber = formData.vehicleNumber
        userData.vehicleType = formData.vehicleType
        userData.isAvailable = false
        userData.rating = 0
        userData.totalRides = 0
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

  // Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-20">
        <Card className="w-full max-w-3xl shadow-2xl border-0">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200/50">
              <span className="text-4xl">🛺</span>
            </div>
            <CardTitle className="text-3xl font-bold">Join RikRide</CardTitle>
            <CardDescription className="text-base mt-2">Choose how you want to use RikRide</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 px-8 pb-8">
            <button onClick={() => setRole('student')} className="text-left group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-400 group-focus:border-amber-500 group-focus:ring-2 group-focus:ring-amber-200">
                <CardContent className="pt-8 pb-6 px-6 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">I'm a Student</h3>
                    <p className="text-sm text-gray-600">Book affordable rides from campus to anywhere</p>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      🎓 For Students
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button onClick={() => setRole('driver')} className="text-left group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-400 group-focus:border-amber-500 group-focus:ring-2 group-focus:ring-amber-200">
                <CardContent className="pt-8 pb-6 px-6 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">I'm a Driver</h3>
                    <p className="text-sm text-gray-600">Earn money by providing rides to students</p>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      🚗 For Drivers
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </button>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 border-t bg-gray-50/50">
            <p className="text-sm text-gray-600 pt-4">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-20">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {role === 'student' ? '🎓 Student Registration' : '🚗 Driver Registration'}
              </CardTitle>
              <CardDescription className="mt-1">Create your RikRide account</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRole(null)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              ← Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            {/* Personal Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name" 
                  value={formData.name} 
                  onChange={(e) => updateFormData('name', e.target.value)} 
                  required 
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email} 
                    onChange={(e) => updateFormData('email', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    value={formData.phone} 
                    onChange={(e) => updateFormData('phone', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {role === 'student' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input 
                    id="collegeName" 
                    placeholder="Your college" 
                    value={formData.collegeName} 
                    onChange={(e) => updateFormData('collegeName', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    placeholder="2024-CS-001" 
                    value={formData.studentId} 
                    onChange={(e) => updateFormData('studentId', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input 
                    id="vehicleNumber" 
                    placeholder="DL-01-AB-1234" 
                    value={formData.vehicleNumber} 
                    onChange={(e) => updateFormData('vehicleNumber', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input 
                    id="vehicleType" 
                    placeholder="Auto Rickshaw" 
                    value={formData.vehicleType} 
                    onChange={(e) => updateFormData('vehicleType', e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Document Upload */}
            <div className="space-y-3">
              <Label>
                {role === 'driver' ? 'Upload Aadhaar Card or Driving License' : 'Upload College ID Card'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div
                className={`file-upload rounded-xl p-6 text-center cursor-pointer transition-all ${
                  documentUpload.preview ? 'border-green-400 bg-green-50' : ''
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {documentUpload.preview ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-700">{documentUpload.file?.name}</p>
                      <p className="text-sm text-gray-500">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Drop your document here or click to browse</p>
                      <p className="text-sm text-gray-500">PNG, JPG or PDF up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {role === 'driver' 
                  ? '📋 Your Aadhaar or License will be verified by our team for safety' 
                  : '📋 Your College ID will be verified to ensure campus community safety'}
              </p>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={(e) => updateFormData('password', e.target.value)} 
                  required 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword} 
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)} 
                  required 
                  className="h-11"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-gray-50/50 py-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
