import React from "react"

const FriendBox = ({ friends, onFriendClick, friendTravelTime }) => {
  return (
    <div className="bg-slate-800">
      <h2>Friends</h2>
      <div className="flex">
        {friends.map((friend) => (
          <div key={friend.id} className="flex ml-2">
            <button
              className="bg-slate-300 text-black rounded px-2 py-1 m-1"
              key={friend.uid}
              onClick={() => onFriendClick(friend)}
            >
              {friend.data.username}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FriendBox
