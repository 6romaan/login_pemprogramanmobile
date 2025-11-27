import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDK-wvaSJh5wEsNpjQVKJVjBqH650IX2Uk",
    authDomain: "projek-57f01.firebaseapp.com",
    projectId: "projek-57f01",
    storageBucket: "projek-57f01.firebasestorage.app",
    messagingSenderId: "983899879214",
    appId: "1:983899879214:web:b584256f98d43f30bdacbf",
    measurementId: "G-GLR4VG2VSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics (conditionally to avoid errors in environments where it's not supported)
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

export { auth, app, analytics };
