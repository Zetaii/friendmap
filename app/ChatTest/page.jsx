import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"

// Assuming 'db' is your Firestore database instance and 'users' is your collection
let userId = "QHaIxKB0E9dBhNfJ49KQL7EwSF43"
const userDocRef = doc(db, "users", userId) // Replace 'userId' with the ID of the document you want to retrieve

try {
  const docSnapshot = await getDoc(userDocRef)
  if (docSnapshot.exists()) {
    const userData = docSnapshot.data()
    // Now you can use 'userData' which contains the data of the document
    console.log("Document data:", userData)
  } else {
    console.log("No such document!")
  }
} catch (error) {
  console.error("Error getting document:", error)
}
