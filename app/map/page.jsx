"use client"
import React, { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDocs } from "firebase/firestore"

const MapPage = () => {
  const [destination, setDestination] = useState("")
  const [map, setMap] = useState(null)
  const [travelTime, setTravelTime] = useState(null)
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState(null)

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
        center: { lat: 40.7128, lng: -74.006 }, // New York City coordinates - will change to default to user's location
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

  const handleCalculateRoute = async () => {
    // Check if the google.maps namespace is available
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.DirectionsService ||
      !window.google.maps.DirectionsRenderer
    ) {
      console.error("Google Maps API is not yet loaded.")
      return
    }

    // Perform input validation
    if (!destination) {
      console.error("Destination must be provided.")
      return
    }

    // Construct the request to the Directions API
    const directionsService = new window.google.maps.DirectionsService()

    // Iterate through each user and calculate the travel time
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const response = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: user.data.City, // Use the city of the user as the origin
                destination: destination,
                travelMode: "DRIVING",
              },
              (response, status) => {
                if (status === "OK") {
                  resolve(response)
                } else {
                  reject(
                    `Error calculating route for ${user.data.Name}: ${status}`
                  )
                }
              }
            )
          })

          // Extract the travel time from the response
          const route = response.routes[0]
          const travelTimeInSeconds = route.legs[0].duration.value
          const hours = Math.floor(travelTimeInSeconds / 3600)
          const minutes = Math.floor((travelTimeInSeconds % 3600) / 60)

          let formattedTravelTime
          if (hours === 0) {
            formattedTravelTime = `${minutes} minutes`
          } else {
            formattedTravelTime = `${hours} hours ${minutes} minutes`
          }

          return {
            ...user,
            travelTime: formattedTravelTime,
          }
        } catch (error) {
          console.error(error)
          return {
            ...user,
            travelTime: "Error calculating travel time",
          }
        }
      })
    )

    // Update the state with the updated user data including travel time
    setUsers(updatedUsers)
  }

  return (
    <div className="border-2">
      <div>
        <h1>Google Maps</h1>
        <div className="absolute border-2 border-white w-96 h-96 right-16">
          <h1 className="text-center bg-slate-600">Chat</h1>
          <h2 className="p-2 bg-white text-black h-72">Messages</h2>
          <h2 className="p-2 bg-slate-300 h-[68px]   ">Enter Text Here...</h2>
        </div>
        <div>
          <label>Destination:</label>
          <input
            className="text-black"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <button
          className="bg-white text-black mt-2"
          onClick={handleCalculateRoute}
        >
          Calculate Route
        </button>
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
        {travelTime && <p>Travel Time: {travelTime}</p>}
        {users && (
          <div className="ml-2">
            <h2 className="text-lg font-bold">People</h2>
            {users.map((user) => (
              <div key={user.id}>
                <p className="mb-1 font-bold">{user.data.Name}</p>
                <p>Travel Time: {user.travelTime}</p>
              </div>
            ))}
          </div>
        )}{" "}
      </div>
      <div id="map" style={{ height: "500px", width: "50%" }}></div>
    </div>
  )
}

export default MapPage
