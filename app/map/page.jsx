"use client"
import React, { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"
import Chat from "../components/Chat"
import FriendBox from "../components/FriendBox"
import GoogleAutoComplete from "../components/GoogleAutoComplete"

const MapPage = () => {
  const [destination, setDestination] = useState("")
  const [map, setMap] = useState(null)
  const [travelTime, setTravelTime] = useState(null)
  const [users, setUsers] = useState(null)
  const [userData, setUserData] = useState(null)
  const [friendTravelTimes, setFriendTravelTimes] = useState({})
  const [selectedFriends, setSelectedFriends] = useState([])
  const [selectedFriendIds, setSelectedFriendIds] = useState([])

  const [user] = useAuthState(auth)
  const destinationInputRef = useRef(null)

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Load the Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Initialize the map once the script is loaded
    window.initMap = () => {
      const mapOptions = {
        center: { lat: 44.97007, lng: -93.28378 },
        zoom: 10,
      }
      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        mapOptions
      )
      setMap(newMap)
    }
  }, [])

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid)
          const docSnapshot = await getDoc(userDocRef)
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()
            setUserData(userData)
          } else {
            console.log("No such document!")
          }
        }
      } catch (error) {
        console.error("Error getting document:", error)
      }
    }
    fetchDocument()
  }, [user])

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
  }, [])

  const calculateRoute = (customDestination) => {
    const destinationToUse = customDestination || destination // Use custom destination if provided, otherwise use state destination

    if (!userData || !userData.address || !destinationToUse) {
      console.error("Origin or destination not provided")
      return
    }

    const directionsService = new window.google.maps.DirectionsService()
  }

  const handleCalculateTravelTime = (destination) => {
    // Implement the logic to calculate travel time from the destination
    // For now, let's just log the destination
    console.log("Calculating travel time to:", destination)
  }

  return (
    <div className="border-2 h-fit flex">
      <div className="w-[50%]">
        <div className="">
          <div className="m-1 w-full text-center">
            <label className="pr-6 text-center  ">Origin: </label>
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
          <GoogleAutoComplete
            destinationInputRef={destinationInputRef}
            setDestination={(destination) => calculateRoute(destination)} // Pass the selected destination
          />
          <div className="flex w-full pr-6   m-1 text-center">
            <label className="ml-2">Travel Time:</label>
            {travelTime && (
              <p className="ml-4 text-center bg-white text-black w-56">
                {travelTime}
              </p>
            )}
          </div>
        </div>
        <div>My Friends: </div>
      </div>
      <div className=" w-full">
        <FriendBox onCalculateTravelTime={handleCalculateTravelTime} />
        <div
          className=" mt-60 ml-24"
          id="map"
          style={{ height: "400px", width: "80%" }}
        ></div>
      </div>
      <div className="w-[25%] ml-12 mr-16">
        <Chat />
      </div>
    </div>
  )
}

export default MapPage
