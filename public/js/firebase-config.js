// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtB89oWdCfmiPW084apMBWIZIqP6DhKF4",
  authDomain: "tb-putra-jaya.firebaseapp.com",
  projectId: "tb-putra-jaya",
  storageBucket: "tb-putra-jaya.firebasestorage.app",
  messagingSenderId: "503756701423",
  appId: "1:503756701423:web:6207c36a9bcf1ef40ae51a",
  measurementId: "G-Z2GYJ7LSRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);