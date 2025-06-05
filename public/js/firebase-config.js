// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtM9BnM3iJF_KcZDHMKE11Mob8EBXDGX0",
  authDomain: "toko-bangunan01.firebaseapp.com",
  projectId: "toko-bangunan01",
  storageBucket: "toko-bangunan01.appspot.com",
  messagingSenderId: "162547296082",
  appId: "1:162547296082:web:e455b3d66749fd0003c8b",
  measurementId: "G-XEXDVSLBGW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
