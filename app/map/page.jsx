"use client"
import React, { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDocs } from "firebase/firestore"
import Chat from "../components/Chat"

const MapPage = () => {
  const [destination, setDestination] = useState("")
  const [map, setMap] = useState(null)
  const [travelTime, setTravelTime] = useState(null)
  const [users, setUsers] = useState(null)

  const [user] = useAuthState(auth)

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Load the Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Initialize the map once the script is loaded
    window.initMap = () => {
      const mapOptions = {
        zoom: 10,
      }
      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        mapOptions
      )
      setMap(newMap)
    }
  }, []) // Empty dependency array to ensure it runs only once on mount

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
    <div className="border-2">
      <div>
        <h1>Google Maps</h1>
        <Chat />
        <div>
          <label>Destination:</label>
          <input
            className="text-black"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <button className="bg-white text-black mt-2">Calculate Route</button>
        <div>
          {users && (
            <div className="flex">
              {users.map((user) => (
                <div key={user.id}>
                  <button className="bg-slate-500 rounded m-2">
                    {user.data.Name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {users && (
          <div className="ml-2">
            <h2 className="text-lg font-bold">People</h2>
            {users.map((user) => (
              <div key={user.id}>
                <p className="mb-1 font-bold">{user.data.username}</p>
                <p className="test">Travel Time: {user.travelTime}</p>
                <p>Location: {user.data.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className="ml-[25%] mt-5  "
        id="map"
        style={{ height: "500px", width: "50%" }}
      ></div>
    </div>
  )
}

export default MapPage
