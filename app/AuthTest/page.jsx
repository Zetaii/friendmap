"use client"

import React, { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDocs } from "firebase/firestore"
import Chat from "../components/Chat"

const LandingPage = () => {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users")
        const querySnapshot = await getDocs(usersRef)
        const fetchedUsers = []
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, data: doc.data() })
        })
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, []) // Empty dependency array ensures this effect runs only once after component mounts

  const addUser = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, "users"), userData)
      console.log("User added with ID:", docRef.id)
      // You can optionally update the state here if needed
    } catch (error) {
      console.error("Error adding user:", error)
    }
  }

  const handleSignUp = async () => {
    const email = prompt("Enter your email:")
    const password = prompt("Enter your password:")

    if (!email || !password) {
      console.error("Email and password must be provided.")
      return
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password)
    } catch (error) {
      console.error("Error signing up:", error)
    }
  }

  const handleSignIn = async () => {
    const email = prompt("Enter your email:")
    const password = prompt("Enter your password:")

    if (!email || !password) {
      console.error("Email and password must be provided.")
      return
    }

    try {
      await auth.signInWithEmailAndPassword(email, password)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  return (
    <>
      <div>
        <h1>Firebase Authentication Example</h1>
        {user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <button onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        ) : (
          <div>
            <button onClick={handleSignUp}>Sign Up</button>
            <button onClick={handleSignIn}>Sign In</button>
          </div>
        )}
      </div>
      <Chat />
      {/* Display user data */}
      {users && (
        <div>
          <h2>User Data</h2>
          {users.map((user) => (
            <div key={user.id}>
              <p>Email: {user.data.Name}</p>
              <p>Location: {user.data.City}</p>
              {/* Add other user data fields here */}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default LandingPage
