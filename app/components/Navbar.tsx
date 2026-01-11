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
import { useRouter } from 'next/navigation'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userData, logout } = useAuth()
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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

  const getDashboardLink = () => {
    if (!userData) return '/'
    return userData.role === 'driver' ? '/driver/dashboard' : '/student/dashboard'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
                    <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛺</span>
            </div>
                    <span className="text-2xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              RikHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {user && (
              <Link href={getDashboardLink()} className="text-gray-700 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/about" className="text-gray-700 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                              <AvatarFallback className="bg-linear-to-br from-yellow-400 to-orange-500 text-white">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userData.name}</p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                      <p className="text-xs text-yellow-600 font-semibold capitalize">{userData.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                    <span className="mr-2">📊</span> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/${userData.role}/profile`)}>
                    <span className="mr-2">👤</span> Profile
                  </DropdownMenuItem>
                  {userData.role === 'driver' && (
                    <DropdownMenuItem onClick={() => router.push('/driver/earnings')}>
                      <span className="mr-2">💰</span> Earnings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push(`/${userData.role}/history`)}>
                    <span className="mr-2">📜</span> History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <span className="mr-2">🚪</span> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500 p-2"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-yellow-200">
          {user && userData && (
            <div className="px-3 py-2 mb-2 bg-yellow-50 rounded-md">
              <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
              <p className="text-xs text-gray-600">{userData.email}</p>
              <p className="text-xs text-yellow-600 font-semibold capitalize mt-1">{userData.role}</p>
            </div>
          )}
          
          <Link
            href="/"
            className="block text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className="block text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/about"
            className="block text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          <div className="pt-4 space-y-2">
            {user && userData ? (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar