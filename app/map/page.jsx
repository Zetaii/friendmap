"use client"
import React, { useState } from "react"

const MapPage = () => {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [map, setMap] = useState(null)
  const [travelTime, setTravelTime] = useState(null)

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const handleLoadMap = () => {
    // Load the Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Initialize the map once the script is loaded
    window.initMap = () => {
      const mapOptions = {
        center: { lat: 40.7128, lng: -74.006 }, // New York City coordinates
        zoom: 10,
      }
      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        mapOptions
      )
      setMap(newMap)
    }
  }

  const handleCalculateRoute = () => {
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
    if (!origin || !destination) {
      console.error("Origin and destination must be provided.")
      return
    }

    // Construct the request to the Directions API
    const directionsService = new window.google.maps.DirectionsService()
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
    })

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          // Extract the travel time from the response
          const route = response.routes[0]
          const travelTimeInSeconds = route.legs[0].duration.value
          const hours = Math.floor(travelTimeInSeconds / 3600)
          const minutes = Math.floor((travelTimeInSeconds % 3600) / 60)
          setTravelTime(`${hours} hours ${minutes} minutes`)

          // Display the route on the map
          directionsRenderer.setDirections(response)
        } else {
          console.error(`Error calculating route: ${status}`)
        }
      }
    )
  }
  return (
    <div>
      <h1>Google Maps</h1>
      <div>
        <label>Origin:</label>
        <input
          className="text-black"
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
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
      <button onClick={handleCalculateRoute}>Calculate Route</button>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
      {travelTime && <p>Travel Time: {travelTime}</p>}
      <button onClick={handleLoadMap}>Load Map</button>
    </div>
  )
}

export default MapPage
