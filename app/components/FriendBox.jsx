import React, { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"
import FriendItem from "./FriendItem"

const FriendBox = ({ onCalculateTravelTime }) => {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [userFriends, setUserFriends] = useState([])
  const [loading, setLoading] = useState(true)

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
            console.log("No such document for user:", user.uid)
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
        setUserFriends(fetchedUsers)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    console.log("User data:", userData)
    console.log("User friends:", userFriends)
  }, [userData, userFriends])

  const handleCalculateTravelTime = (destination) => {
    // Call the callback function with the destination
    onCalculateTravelTime(destination)
  }

  return (
    <div className="bg-slate-800">
      <h2>Friends</h2>
      <div className="flex">
        {loading ? (
          <p>Loading...</p>
        ) : userFriends.length > 0 ? (
          userFriends.map((friend) => (
            <FriendItem
              key={friend.id}
              friend={friend}
              onCalculateTravelTime={handleCalculateTravelTime} // Pass the callback function to FriendItem
            />
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </div>
    </div>
  )
}

export default FriendBox
