"use client"
import React, { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/config"
import { collection, getDoc, doc, getDocs } from "firebase/firestore"

function Page() {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState(null)
  const [userData, setUserData] = useState(null)
  const [userFriends, setUserFriends] = useState([])

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
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (userData && users) {
      const userFriendsIds = userData.friends
        ? Object.keys(userData.friends)
        : []
      const friendsData = userFriendsIds.map((friendId) => {
        const friend = users.find((user) => user.id === friendId)
        return friend ? { id: friend.id, data: friend.data } : null
      })
      setUserFriends(friendsData.filter(Boolean))
    }
  }, [userData, users])

  return (
    <div>
      <div>User: {userData ? userData.username : "No user data"}</div>
      <div>Home: {userData ? userData.address : "No user data"}</div>

      <div className="">
        <h1>Friends</h1>
        {userFriends.length > 0 ? (
          userFriends.map((friend) => (
            <div key={friend.id} className=" bg-slate-800 w-64 p-2">
              <h2>Username: {friend.data.username}</h2>
              <p>
                Name: {friend.data.firstName} {friend.data.lastName}
              </p>

              <p>Address: {friend.data.address}</p>

              <button className="bg-blue-300 mt-2 p-1">Map</button>
            </div>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </div>
    </div>
  )
}

export default Page
