// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzzglYwhR2RFJ3hj5DCnHcGBxB9f5fq2U",
  authDomain: "tokobangunan-997e8.firebaseapp.com",
  projectId: "tokobangunan-997e8",
  storageBucket: "tokobangunan-997e8.firebasestorage.app",
  messagingSenderId: "360315236922",
  appId: "1:360315236922:web:0d8f38e10f6d39bfb67b03",
  measurementId: "G-0KQRYD9NYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);