// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtM9BnM3iJF_KcZDHMKE11MOb8EBXDGX0",
  authDomain: "toko-bangunan01.firebaseapp.com",
  projectId: "toko-bangunan01",
  storageBucket: "toko-bangunan01.firebasestorage.app",
  messagingSenderId: "162547296082",
  appId: "1:162547296082:web:e455b3d66749fd90003c8b",
  measurementId: "G-XEXDVSLBGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);