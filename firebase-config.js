// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
// 引入 Firebase 功能
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ▼▼▼ 刚才复制的配置放在这里 ▼▼▼
const firebaseConfig = {
    apiKey: "AIzaSyAqxa_wtFwpDhavXZDowqHY5_9oqzX_EZo",
    authDomain: "summary-7fa47.firebaseapp.com",
    projectId: "summary-7fa47",
    storageBucket: "summary-7fa47.firebasestorage.app",
    messagingSenderId: "1006366612870",
    appId: "1:1006366612870:web:55dd0a3b0a7d88dbaa2007",
    measurementId: "G-7DRKNG2JH3"
};

// 初始化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
} else {
    console.error("Firebase SDK not loaded");
}
