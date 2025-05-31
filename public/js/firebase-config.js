// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAzzglYwhR2RFJ3hj5DCnHcGBxB9f5fq2U",
    authDomain: "tokobangunan-997e8.firebaseapp.com",
    projectId: "tokobangunan-997e8",
    storageBucket: "tokobangunan-997e8.firebasestorage.app",
    messagingSenderId: "360315236922",
    appId: "1:360315236922:web:cd3f5197a1e0c793b67b03",
    measurementId: "G-Y26BN71EZZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
