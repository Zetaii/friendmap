"use client"

import React, { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"

function page() {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState(null)
  const [userData, setUserData] = useState(null) // State variable to store user data

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", `${user.uid}`) // Specify user's UID
          const docSnapshot = await getDoc(userDocRef)
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()

            setUserData(userData)
            console.log("Test data:", userData)
          } else {
            console.log("No such document!")
          }
        }
      } catch (error) {
        console.error("Error getting document:", error)
      }
    }
    fetchDocument()
  }, [user]) // Ensure useEffect runs when user changes

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
        console.log("Fetched users:", fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, []) // Empty dependency array ensures this effect runs only once after component mounts

  return (
    <div>
      <div>User: {userData ? `${userData.username}` : "No user data"}</div>
      <div>Home: {userData ? `${userData.address}` : "No user data"}</div>

      <div className="m-2">
        <h1>Friends</h1>
      </div>
      <div className="m-2 bg-slate-800 w-64 p-2 ">
        <h2>Name: Steven</h2>
        <p>Location: 4304 Blakewood Dr </p>
        <p>Phone: 123-456-7890</p>
        <p>Email: fake@email.com</p>
        <button className="bg-blue-300 mt-2 mb-2 ml-[40%] p-1">Map</button>
      </div>
      <div className="m-2 bg-slate-800 w-64 p-2 ">
        <h2>Name: Kristina </h2>
        <p>Location: 4304 Blakewood Dr </p>
        <p>Phone: 123-456-7890</p>
        <p>Email: fake@email.com</p>
        <button className="bg-blue-300 mt-2 mb-2 ml-[40%] p-1">Map</button>
      </div>
    </div>
  )
}

export default page
