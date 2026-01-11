'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useRouter } from 'next/navigation'

// User data type from Firestore
export interface UserData {
  uid: string
  name: string
  email: string
  phone: string
  role: 'student' | 'driver'
  createdAt: Date
  
  // Student specific
  collegeName?: string
  studentId?: string
  
  // Driver specific
  vehicleNumber?: string
  vehicleType?: string
  isAvailable?: boolean
  rating?: number
  totalRides?: number
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signup: (email: string, password: string, userData: Omit<UserData, 'uid' | 'createdAt'>) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData
        setUserData(data)
        return data
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    return null
  }

  // Sign up function
  const signup = async (
    email: string, 
    password: string, 
    additionalData: Omit<UserData, 'uid' | 'createdAt'>
  ) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name
      await updateProfile(user, {
        displayName: additionalData.name
      })

      // Create user document in Firestore
      const userDocData: UserData = {
        uid: user.uid,
        ...additionalData,
        createdAt: new Date(),
      }

      // Initialize driver-specific fields if role is driver
      if (additionalData.role === 'driver') {
        userDocData.isAvailable = false
        userDocData.rating = 0
        userDocData.totalRides = 0
      }

      await setDoc(doc(db, 'users', user.uid), userDocData)

      // Redirect based on role
      if (additionalData.role === 'driver') {
        router.push('/driver/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Failed to create account')
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userData = await fetchUserData(userCredential.user.uid)
      
      // Redirect based on role
      if (userData?.role === 'driver') {
        router.push('/driver/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      setUserData(null)
      router.push('/')
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        await fetchUserData(user.uid)
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userData,
    loading,
    signup,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
