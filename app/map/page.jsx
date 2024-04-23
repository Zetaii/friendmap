"use client"

import React, { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"
import Chat from "../components/Chat"

const MapPage = () => {
  const [destination, setDestination] = useState("")
  const [map, setMap] = useState(null)
  const [travelTime, setTravelTime] = useState(null)
  const [users, setUsers] = useState(null)
  const [userData, setUserData] = useState(null) // State variable to store user data

  const [user] = useAuthState(auth)

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", "9xyMSsYByEXpWjLq8FAkyG1XfvE3") // Specify user's UID
          const docSnapshot = await getDoc(userDocRef)
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()

            setUserData(userData)
            console.log("User data:", userData)
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
    // Load the Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Initialize the map once the script is loaded
    window.initMap = () => {
      const mapOptions = {
        center: { lat: 44.97007, lng: -93.28378 }, // New York City coordinates - will change to default to user's location
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

  const calculateRoute = () => {
    if (!userData || !userData.address || !destination) {
      console.error("Origin or destination not provided")
      return
    }

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: userData.address,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          // Display the route on the map
          const directionsRenderer = new window.google.maps.DirectionsRenderer()
          directionsRenderer.setMap(map)
          directionsRenderer.setDirections(response)

          // Set travel time
          const route = response.routes[0]
          setTravelTime(route.legs[0].duration.text)
        } else {
          console.error("Directions request failed due to " + status)
        }
      }
    )
  }

  return (
    <div className="border-2">
      <div>
        <Chat />
        <div className="">
          <div className="m-1">
            <label>Origin: </label>
            <input
              className="text-black text-center"
              type="text"
              placeholder={
                !userData || !userData.address ? "Enter origin..." : ""
              }
              value={userData && userData.address ? userData.address : ""}
              readOnly
            />
          </div>
          <div className="m-1">
            <label>Destination: </label>
            <input
              className="text-black text-center "
              type="text"
              placeholder="Enter destination... "
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        <button className="bg-white text-black mt-2" onClick={calculateRoute}>
          Calculate Route
        </button>
        <div>{travelTime && <p>Travel time: {travelTime}</p>}</div>
        {/* Other JSX */}
      </div>
      <div
        className="ml-[25%] mt-20"
        id="map"
        style={{ height: "400px", width: "30%" }}
      ></div>
    </div>
  )
}

export default MapPage
