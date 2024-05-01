"use client"
import React, { useState, useEffect } from "react"
import {
  useAuthState,
  useCreateUserWithEmailAndPassword,
} from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

const SignUp = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [address, setAddress] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState(null)
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false)

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth)
  const [user] = useAuthState(auth)
  const userRef = collection(db, "users")
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Load Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.onload = () => {
      setIsGoogleScriptLoaded(true)
    }
    document.head.appendChild(script)

    // Cleanup
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (isGoogleScriptLoaded) {
      // Initialize Google Places Autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("autocomplete"),
        { types: ["geocode"] } // Specify the type of place data to return
      )

      // Listen for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        setAddress(place.formatted_address) // Update the address state with the selected place
      })
    }
  }, [isGoogleScriptLoaded])

  const handleSignUp = async () => {
    try {
      const res = await createUserWithEmailAndPassword(email, password)
      const { user } = res

      if (user) {
        const userDocRef = doc(userRef, user.uid)
        await setDoc(userDocRef, {
          createdAt: serverTimestamp(),
          uid: user.uid,
          email: user.email,
          username: username,
          address: address,
          firstName: firstName,
          lastName: lastName,
        })
        sessionStorage.setItem("user", true)
        setEmail("")
        setPassword("")
        setUsername("")
        setAddress("")
        setFirstName("")
        setLastName("")
      }
    } catch (error) {
      setError(error.message)
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="firstName"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="lastName"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          id="autocomplete"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autocomplete="new-address"
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}

export default SignUp
