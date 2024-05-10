"use client"
import React, { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"
import Chat from "../components/Chat"
import FriendBox from "../components/FriendBox"
import GoogleAutoComplete from "../components/GoogleAutoComplete"
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"

export const MapPage = () => {
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

  const libraries = ["places"]
  const mapContainerStyle = {
    width: "30vw",
    height: "30vh",
  }
  const center = {
    lat: 44.97007, // default latitude
    lng: -93.28378, // default longitude
  }

  // useEffect(() => {
  //   const script = document.createElement("script")
  //   script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&libraries=places&callback=initMap`
  //   script.async = true
  //   script.defer = true
  //   script.addEventListener("load", initializeMap)
  //   document.head.appendChild(script)

  //   return () => {
  //     script.removeEventListener("load", initializeMap)
  //   }
  // }, [])

  // const initializeMap = () => {
  //   const mapOptions = {
  //     center: { lat: 44.97007, lng: -93.28378 },
  //     zoom: 10,
  //   }

  //   // Check if the Google Maps API has loaded
  //   if (!window.google || !window.google.maps || !window.google.maps.Map) {
  //     console.error("Google Maps API not loaded.")
  //     return
  //   }

  //   // Create the map
  //   const newMap = new window.google.maps.Map(
  //     document.getElementById("map"),
  //     mapOptions
  //   )
  //   setMap(newMap)
  // }

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

  const calculateRoute = (origin, destination) => {
    if (!origin || !destination) {
      console.error("Origin or destination not provided")
      return
    }

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const route = response.routes[0]
          const travelTimeInSeconds = route.legs[0].duration.value
          const travelTimeInMinutes = Math.ceil(travelTimeInSeconds / 60)
          setTravelTime(travelTimeInMinutes)
        } else {
          console.error("Directions request failed due to", status)
        }
      }
    )
  }

  const handleCalculateTravelTime = (destination) => {
    if (!userData || !userData.address) {
      console.error("User data not available")
      return
    }

    calculateRoute(userData.address, destination)
  }

  const handleFriendBoxButtonClick = (friendAddress, friendUsername) => {
    if (!destination || !friendAddress) {
      console.error("Destination or friend address not available")
      return
    }

    calculateFriendRoute(destination, friendAddress, friendUsername)
  }

  const calculateFriendRoute = (
    origin,
    destination,
    friendId,
    friendUsername,
    friendAddress
  ) => {
    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const route = response.routes[0]
          const travelTimeInSeconds = route.legs[0].duration.value
          const travelTimeInMinutes = Math.ceil(travelTimeInSeconds / 60)
          setFriendTravelTimes((prev) => ({
            ...prev,
            [friendId]: {
              username: friendUsername,
              travelTime: travelTimeInMinutes,
              address: friendAddress,
            },
          }))
        } else {
          console.error(
            `Directions request for ${friendUsername} failed due to`,
            status
          )
        }
      }
    )
  }

  useEffect(() => {
    // Check if the user's address and destination are available
    if (userData && userData.address && destination) {
      // Call calculateRoute function with user's address and destination
      calculateRoute(userData.address, destination)
    }
  }, [userData, destination])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  })

  if (loadError) {
    return <div>Error loading maps</div>
  }

  if (!isLoaded) {
    return <div>Loading maps</div>
  }

  return (
    <>
      <div
        className="h-screen flex flex-col bg-slate-200"
        style={{ height: "92vh" }}
      >
        <div className="flex scrollbar-hide">
          <div className="w-[30%] mt-5 justify-center align-middle">
            <div className="w-full ">
              <div className="mx-2 w-full text-center flex">
                <img src="home.png" className="w-6 h-6" alt="home icon" />
                <label
                  className="pr-6 ml-1 text-center text-blue-400 font-bold"
                  htmlFor="originInput"
                >
                  Origin
                </label>
                <input
                  className="text-black text-center w-50% px-2 border-2 border-slate-400 rounded ml-5 py-1"
                  type="text"
                  placeholder={
                    !userData || !userData.address ? "Enter origin..." : ""
                  }
                  value={userData && userData.address ? userData.address : ""}
                  readOnly
                  id="originInput"
                />
              </div>
              <GoogleAutoComplete
                destinationInputRef={destinationInputRef}
                setDestination={setDestination}
                onDestinationSelected={handleCalculateTravelTime}
                userOrigin={
                  userData && userData.address ? userData.address : ""
                }
              />
              <div className="">
                <div className="flex ml-1 text-center">
                  <img src="clock.png" className="w-6  h-6" alt="clock icon" />
                  <p className=" ml-1  text-center font-bold text-blue-400">
                    Travel Time
                  </p>
                  <div className="">
                    {travelTime && (
                      <div className="text-black bg-white text-center w-56  border-2 ml-1 border-slate-400 rounded py-1">
                        {travelTime} minutes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-[20%]">
              <FriendBox onFriendBoxButtonClick={handleFriendBoxButtonClick} />
            </div>
            <div className="mt-2 ml-1 font-bold text-blue-400">
              Friend Travel Times:
              {Object.entries(friendTravelTimes).map(
                ([friendId, { travelTime, address }]) => (
                  <div key={friendId} className="">
                    <div className="flex">
                      <div>
                        <p>{friendId}</p>
                        <p>Travel Time: {travelTime} minutes</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex-grow">
            <div className="mt-96 ml-15">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={10}
                center={center}
                onLoad={setMap}
              ></GoogleMap>
            </div>
          </div>
          <div className="w-[17%]">
            <Chat />
          </div>
        </div>
      </div>
    </>
  )
}

export default MapPage
