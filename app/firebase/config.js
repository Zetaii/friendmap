import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBroOUpNMRfOUvLq8ifkshPwEM4Yt-P_GM",
  authDomain: "map-dev-177ae.firebaseapp.com",
  projectId: "map-dev-177ae",
  storageBucket: "map-dev-177ae.appspot.com",
  messagingSenderId: "178424228068",
  appId: "1:178424228068:web:7e0b59ba337bf23de4e4f1",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { app, auth }
