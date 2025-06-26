// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

// Konfigurasi Firebase Project Barumu
const firebaseConfig = {
  apiKey: "AIzaSyDtB89oWdCfmiPW084apMBWIZIqP6DhKF4",
  authDomain: "tb-putra-jaya.firebaseapp.com",
  projectId: "tb-putra-jaya",
  storageBucket: "tb-putra-jaya.firebasestorage.app",
  messagingSenderId: "503756701423",
  appId: "1:503756701423:web:6207c36a9bcf1ef40ae51a",
  measurementId: "G-Z2GYJ7LSRH"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Ekspor firestore
export const db = getFirestore(app);
