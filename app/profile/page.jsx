"use client"

import React, { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/config"

function page() {
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
        console.log("Fetched users:", fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, []) // Empty dependency array ensures this effect runs only once after component mounts

  return (
    <div>
      <div className="m-2">
        <h1>Profile</h1>
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
