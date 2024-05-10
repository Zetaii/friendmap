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
    <nav className="bg-slate-900  text-blue-400 border-b-black border-b-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className=" text-xl font-extrabold">
          Home
        </a>
        <a href="/map" className=" text-xl font-extrabold">
          Map
        </a>
        <a href="/profile " className=" text-xl font-extrabold">
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
