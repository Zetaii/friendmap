"use client"
import {
  useAuthState,
  useCreateUserWithEmailAndPassword,
} from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import React, { useState } from "react"
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
  const [error, setError] = useState(null)

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth)

  const [user] = useAuthState(auth)

  const userRef = collection(db, "users")

  const handleSignUp = async () => {
    try {
      const res = await createUserWithEmailAndPassword(email, password)

      const { user } = res // Extract user from the response

      if (user) {
        const userDocRef = doc(userRef, user.uid)
        await setDoc(userDocRef, {
          createdAt: serverTimestamp(),
          uid: user.uid, // Store the Firebase Authentication UID in Firestore
          email: user.email,
          username: username,
          address: address,
        })
        sessionStorage.setItem("user", true)
        setEmail("")
        setPassword("")
        setUsername("")
        setAddress("")
      }
    } catch (error) {
      setError(error.message) // Set error message
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
        {/* Display error message if there's an error */}
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
          type="address"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
