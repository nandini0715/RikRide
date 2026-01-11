'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
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

  const getDashboardLink = () => {
    if (!userData) return '/'
    return userData.role === 'driver' ? '/driver/dashboard' : '/student/dashboard'
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="glass border-b border-amber-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-300/50 transition-all duration-300 group-hover:scale-105">
              <span className="text-2xl">🛺</span>
            </div>
            <span className="text-2xl font-bold gradient-text">
              RikRide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              Home
            </Link>
            {user && (
              <Link 
                href={getDashboardLink()} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.includes('dashboard') 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link 
              href="/about" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/about') 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-amber-200 hover:ring-amber-400 transition-all">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end">
                  <DropdownMenuLabel className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 w-fit mt-1">
                        {userData.role === 'driver' ? '🚗 Driver' : '🎓 Student'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())} className="cursor-pointer rounded-lg">
                    <span className="mr-3">📊</span> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/${userData.role}/profile`)} className="cursor-pointer rounded-lg">
                    <span className="mr-3">👤</span> Profile
                  </DropdownMenuItem>
                  {userData.role === 'driver' && (
                    <DropdownMenuItem onClick={() => router.push('/driver/earnings')} className="cursor-pointer rounded-lg">
                      <span className="mr-3">💰</span> Earnings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push(`/${userData.role}/history`)} className="cursor-pointer rounded-lg">
                    <span className="mr-3">📜</span> History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50">
                    <span className="mr-3">🚪</span> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-amber-700 hover:bg-amber-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-amber-50 transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-50" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {user && (
                <Link href={getDashboardLink()} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-50" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              <Link href="/about" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-50" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              
              {user && userData ? (
                <>
                  <div className="px-4 py-3 bg-amber-50 rounded-lg mx-2">
                    <p className="font-semibold text-gray-900">{userData.name}</p>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2 pt-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
