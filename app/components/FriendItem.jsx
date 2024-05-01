import React from "react"

const FriendItem = ({ friend, onCalculateTravelTime }) => {
  const { data } = friend

  const handleCalculateTravelTime = () => {
    // Call the callback function with the destination (data.address)
    onCalculateTravelTime(data.address)
  }

  return (
    <div className="bg-slate-800 p-2 flex">
      <div className="flex">
        <button
          onClick={handleCalculateTravelTime}
          className="flex bg-red-400 rounded-md p-1"
        >
          {data.username}
        </button>
      </div>
    </div>
  )
}

export default FriendItem
