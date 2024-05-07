import React, { useEffect, useState } from "react"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { auth, db } from "../firebase/config"
import { firebase } from "../firebase/config"
import "firebase/firestore"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

const Chat = () => {
  const [user] = useAuthState(auth)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [userData, setUserData] = useState(null)

  const messagesRef = collection(db, "messages")

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid) // Specify user's UID
          const docSnapshot = await getDoc(userDocRef)
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()
            console.log("Document data:", userData)
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
  }, [user]) // Ensure useEffect runs when user changes

  useEffect(() => {
    const queryMessages = query(messagesRef, orderBy("createdAt"), limit(25))
    onSnapshot(queryMessages, (snapshot) => {
      let messages = []
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id })
      })
      setMessages(messages)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newMessage === "") return

    await addDoc(messagesRef, {
      createdAt: serverTimestamp(),
      text: newMessage,
      user: user.email,
      uid: user.uid,
      username: userData.username,
    })

    setNewMessage("")
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp?.toDate()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <div className="w-full h-[93vh] border-black border-l-4">
        <div className="bg-slate-900 h-full p-2">
          <div className="border-b-2 mb-[10%] w-full bg-black">Chat Box</div>
          <form onSubmit={handleSubmit}>
            <div>
              {messages.map((message, index) => (
                <div className="border-b-2" key={index}>
                  <div className="flex justify-between">
                    <h1
                      className="font-bold text-l text-blue-300 "
                      key={message.id}
                    >
                      {message.username}
                    </h1>
                    <h1>{formatTime(message.createdAt)}</h1>
                  </div>
                  <h1> {message.text}</h1>
                </div>
              ))}
            </div>
            <div className="flex mt-10">
              <input
                placeholder="Type your message here..."
                className="text-black"
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                id="messageInput"
              />
              <button type="submit" className="ml-2 bg-blue-400">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Chat
