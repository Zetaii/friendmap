import React, { useState, useEffect, useRef } from "react"

const GoogleAutoComplete = ({ destinationInputRef, setDestination }) => {
  const [text, setText] = useState("")
  const [coincidences, setCoincidences] = useState([])
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsListRef = useRef(null)

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
            types: ["address"],
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
      setCoincidences(results.map((result) => result.description))
      setSuggestions(results) // Set suggestions to fetched results
      console.log("GoogleAutoComplete", results)
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
    // Load the Google Maps API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    document.head.appendChild(script)

    // Cleanup function to remove the script when component unmounts
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
  }, [scriptLoaded, destinationInputRef, setDestination])

  const handleSuggestionClick = (item, event) => {
    console.log("Button has been clicked")
    const suggestion = { description: item } // Create an object with a 'description' property
    setDestination(suggestion.description) // Set the destination
    console.log("Destination set:", suggestion.description)
    setText(suggestion.description) // Set input text to the clicked suggestion
    setCoincidences([]) // Clear all suggestions
    setSuggestions([]) // Clear suggestions after selecting one
    event.stopPropagation() // Prevent event propagation to avoid closing the suggestion box
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
      <div className="w-full pr-6 m-1 text-center relative">
        <label className="pr-2">Destination: </label>
        <input
          className="text-black text-center w-50%"
          type="text"
          placeholder="Enter destination... "
          ref={destinationInputRef}
          value={text} // Bind input value to the state
          onChange={(e) => setText(e.target.value)}
          onFocus={handleInputFocus}
        />
        {showSuggestions && (
          <ul
            id="concidences_list"
            ref={suggestionsListRef}
            className="w-[85%] ml-24 mt-0 pt-2 text-sm rounded bg-white text-black border-2 border-slate-400 border-solid"
            onClick={handleSuggestionBoxClick}
          >
            {suggestions.map((item) => (
              <button
                className="hover:bg-gray-400 hover:pointer w-full"
                key={item.place_id} // Ensure a unique key for each suggestion
                onClick={(e) => handleSuggestionClick(item.description, e)}
              >
                {item.description}
              </button>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GoogleAutoComplete
