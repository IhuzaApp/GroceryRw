"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import "rsuite/dist/rsuite.min.css"
import UserRegistration from "@components/ui/Auth/userAuth/UserRegistration"

export default function RegisterPage() {


  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 6.5a2 2 0 100-4 2 2 0 000 4zM8.5 8a2 2 0 100-4 2 2 0 000 4zM15.5 8a2 2 0 100-4 2 2 0 000 4zM18 9.5a2 2 0 100-4 2 2 0 000 4zM6 9.5a2 2 0 100-4 2 2 0 000 4zM18 14a2 2 0 100-4 2 2 0 000 4zM6 14a2 2 0 100-4 2 2 0 000 4zM15.5 16a2 2 0 100-4 2 2 0 000 4zM8.5 16a2 2 0 100-4 2 2 0 000 4zM12 17.5a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold">GroceryApp</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8">Sign up to start shopping for groceries</p>

          <UserRegistration />
          {/* Add Phone and Gender Fields here for clarity */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/Auth/Login" className="text-green-600 hover:text-green-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <Image
          src="https://img.freepik.com/free-photo/woman-shopping-vegetables-supermarket_1157-37870.jpg?t=st=1745879445~exp=1745883045~hmac=89b4fe4ddde4a9e7dd4dd89bfdf05705e1910df7e3274e0e074441dd5534758a&w=2000"
          alt="Fresh groceries"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-8 left-8 max-w-md bg-white bg-opacity-90 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Shop smarter, not harder</h2>
          <p className="text-gray-600">
            Join thousands of customers who save time and money by ordering groceries online with our easy-to-use
            platform.
          </p>
        </div>
      </div>
    </div>
  )
}
