import React, { useState } from "react"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { auth, db } from "../firebase/config"
import { firebase } from "../firebase/config"
import "firebase/firestore"
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"

const Chat = () => {
  const [newMessage, setNewMessage] = useState("")

  const messagesRef = collection(db, "messages")

  useEffect(() => {
    const queryMessages = query(messagesRef, where())
    onSnapshot()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newMessage === "") return

    await addDoc(messagesRef, {
      createdAt: serverTimestamp(),
      text: newMessage,
      user: auth.currentUser.displayName,
    })

    setNewMessage("")
  }

  return (
    <>
      <div className="absolute right-80">
        <div className="bg-slate-500 h-72 w-[275px]">
          <p>Steven: Hello</p>
          <p>Kristina: Hi</p>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Type your message here..."
              className="text-black"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            />
            <button type="submit" className="ml-2 bg-blue-400">
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Chat
