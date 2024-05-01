"use client"
import React from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/config"
import FriendSearch from "./FriendSearch"

const Navbar = () => {
  const [user] = useAuthState(auth)

  const handleSignOut = () => {
    auth.signOut()
  }

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-xl font-bold">
          Home
        </a>
        <a href="/map" className="text-white text-xl font-bold">
          Map
        </a>
        <a href="/profile " className="text-white text-xl font-bold">
          Profile
        </a>
        {/* Pass currentUserUid as a prop */}
        {user && <FriendSearch currentUserUid={user.uid} />}{" "}
        {user ? (
          <div className="flex">
            <p className="m-3">{user.email}</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <div>
            <a href="/sign-in" className="text-white mr-4">
              Sign In
            </a>
            <a href="/sign-up" className="text-white">
              Sign Up
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
