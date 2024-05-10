import React, { useState, useEffect, useRef } from "react"

const GoogleAutoComplete = ({
  destinationInputRef,
  setDestination,
  onDestinationSelected,
  userOrigin,
}) => {
  const [text, setText] = useState("")
  const [coincidences, setCoincidences] = useState([])
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsListRef = useRef(null)
  const [travelTime, setTravelTime] = useState(null)
  const [travelTimes, setTravelTimes] = useState([])

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const getMatches = async () => {
    return new Promise((resolve, reject) => {
      if (!text) {
        return reject(new Error("Need valid text input"))
      }

      if (typeof window === "undefined") {
        return reject(new Error("Window object not available"))
      }
      try {
        new window.google.maps.places.AutocompleteService().getPlacePredictions(
          {
            input: text,
            componentRestrictions: { country: "us" },
          },
          resolve
        )
      } catch (e) {
        reject(e)
      }
    })
  }

  const doQuery = async () => {
    try {
      const results = JSON.parse(JSON.stringify(await getMatches()))
      const parsedResults = results.map((result) => {
        const { structured_formatting, description } = result
        const { main_text: establishment, secondary_text: address } =
          structured_formatting
        return {
          establishment,
          address,
          description,
        }
      })
      setCoincidences(parsedResults.map((result) => result.establishment))
      setSuggestions(parsedResults) // Set suggestions to parsed results
      console.log("GoogleAutoComplete", parsedResults)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  useEffect(() => {
    if (text) {
      doQuery()
    }
  }, [text])

  useEffect(() => {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setScriptLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (scriptLoaded && destinationInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        destinationInputRef.current
      )

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) {
          console.error("Place not found")
          return
        }
        setDestination(place.formatted_address)
        if (onDestinationSelected) {
          onDestinationSelected(place.formatted_address)
        }

        // Calculate travel time
        calculateTravelTime(place.formatted_address)
      })

      autocomplete.addListener("predictions_changed", () => {
        const newSuggestions = autocomplete.getPlacePredictions()
        setSuggestions(newSuggestions)
        console.log(newSuggestions)
      })

      // Custom styling to hide the default Google Autocomplete dropdown
      const style = document.createElement("style")
      style.innerHTML = `
              .pac-container {
                display: none !important;
              }
            `
      document.head.appendChild(style)

      // Cleanup function to remove the custom style when component unmounts
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [scriptLoaded, destinationInputRef, setDestination, onDestinationSelected])

  useEffect(() => {
    if (
      scriptLoaded &&
      userOrigin &&
      Array.isArray(suggestions) &&
      suggestions.length > 0
    ) {
      calculateTravelTime(suggestions)
    }
  }, [scriptLoaded, userOrigin, suggestions])

  const calculateTravelTime = (suggestions) => {
    if (!Array.isArray(suggestions)) {
      console.error("Invalid suggestions format")
      return
    }

    const service = new window.google.maps.DistanceMatrixService()
    service.getDistanceMatrix(
      {
        origins: [userOrigin],
        destinations: suggestions.map((suggestion) => suggestion.description),
        travelMode: "DRIVING",
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        if (status === "OK") {
          const times = {}
          response.rows[0].elements.forEach((element, index) => {
            const suggestion = suggestions[index].description
            if (element.status === "OK") {
              const duration = element.duration.value // Duration in seconds
              const hours = Math.floor(duration / 3600)
              const minutes = Math.round((duration % 3600) / 60)
              times[suggestion] = `${hours}H ${minutes}M`
            } else {
              times[suggestion] = "N/A"
            }
          })
          setTravelTimes(times)
        } else {
          console.error("Error calculating travel times:", status)
        }
      }
    )
  }

  useEffect(() => {
    if (scriptLoaded && userOrigin && suggestions.length > 0) {
      calculateTravelTime(suggestions)
    }
  }, [scriptLoaded, userOrigin, suggestions])

  const handleSuggestionClick = (item, event) => {
    const suggestion = { description: item } // Create an object with a 'description' property
    setDestination(suggestion.description) // Set the destination
    console.log("Destination set:", suggestion.description)
    setText(suggestion.description) // Set input text to the clicked suggestion
    setCoincidences([]) // Clear all suggestions
    setSuggestions([]) // Clear suggestions after selecting one
    event.stopPropagation() // Prevent event propagation to avoid closing the suggestion box

    // Check if suggestions is not empty or null before calling calculateTravelTime
    if (suggestions && suggestions.length > 0) {
      // Calculate travel time
      calculateTravelTime(suggestion.description)
    }
  }

  const handleClickOutside = (event) => {
    if (
      suggestionsListRef.current &&
      !suggestionsListRef.current.contains(event.target) &&
      !destinationInputRef.current.contains(event.target) &&
      !destinationInputRef.current.matches(":focus") &&
      !text.trim() && // Check if the destination has been set
      suggestions.length === 0 // Check if there are no suggestions
    ) {
      setShowSuggestions(false) // Hide suggestions when clicking outside
    }
  }

  const handleInputFocus = () => {
    setShowSuggestions(true) // Show suggestions when input is focused
  }

  const handleSuggestionBoxClick = (event) => {
    // Prevent propagation of click event to the parent div
    event.stopPropagation()
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // Add event listener when component mounts
    document.addEventListener("click", handleClickOutside)
    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return (
    <div>
      <div className="w-full pr-6 ml-1 text-center relative flex">
        <img src="bluelocation.png" className="w-6 h-6" alt="location icon" />
        <label
          className="pr-2 font-bold text-blue-400"
          htmlFor="destinationInput"
        >
          Destination
        </label>
        <input
          className="text-black text-center w-50% px-2 border-2 border-slate-400 rounded py-1"
          type="text"
          placeholder="Enter destination... "
          ref={destinationInputRef}
          value={text} // Bind input value to the state
          onChange={(e) => setText(e.target.value)}
          onFocus={handleInputFocus}
          id="destinationInput"
        />
        {showSuggestions && (
          <ul
            id="concidences_list"
            ref={suggestionsListRef}
            className="absolute left-[45%] transform -translate-x-1/2 mt-6 w-96 text-sm rounded-md bg-white text-black border-2 border-slate-400 border-solid "
            onClick={handleSuggestionBoxClick}
          >
            {Array.isArray(suggestions) &&
              suggestions.map((item, index) => (
                <button
                  className="hover:bg-gray-400 hover:pointer w-full justify-center text-center "
                  key={`${item.place_id}-${index}`} // Ensure a unique key for each suggestion
                  onClick={(e) => handleSuggestionClick(item.description, e)}
                >
                  <div className=" justify-center mb-2 mt-2 ">
                    <div className="flex justify-center">
                      <div className="font-bold">{item.establishment}</div>

                      {travelTimes[item.description] && (
                        <div className="ml-3 font-bold bg-blue-50 rounded-md  mb-1">
                          <div className="w-full px-1">
                            {travelTimes[item.description]}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>{item.address}</div>
                  </div>
                </button>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GoogleAutoComplete
