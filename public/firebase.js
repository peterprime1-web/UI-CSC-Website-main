// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbLvQjgkbmE7OQPMNGveovSnb5HdP_q7Y",
  authDomain: "uicsc-prime.firebaseapp.com",
  projectId: "uicsc-prime",
  databaseURL: "https://uicsc-prime-default-rtdb.firebaseio.com/",
  storageBucket: "uicsc-prime.firebasestorage.app",
  messagingSenderId: "599654087384",
  appId: "1:599654087384:web:a220d4072ad030dd3575ad",
  measurementId: "G-D3BB83M4EJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make these globally available
window.db = firebase.database();
window.storage = firebase.storage();

const auth = firebase.auth();

window.auth = auth;

const SERVER_URL = "http://localhost:3000";

window.SERVER_URL = SERVER_URL;