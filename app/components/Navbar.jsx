import React from "react"

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-xl font-bold">
          Home
        </a>
        <a href="/map" className="text-white text-xl font-bold">
          Map
        </a>
        <div>
          <a href="/sign-in" className="text-white mr-4">
            Sign In
          </a>
          <a href="/sign-up" className="text-white">
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
