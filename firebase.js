// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2F9VeKTRb0_leSAwGnErojSeTrLuFMME",
  authDomain: "fir-project-practice-8ddd6.firebaseapp.com",
  projectId: "fir-project-practice-8ddd6",
  storageBucket: "fir-project-practice-8ddd6.appspot.com",
  messagingSenderId: "713389075996",
  appId: "1:713389075996:web:485afa5a96e20851b239d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore=getFirestore(app)
export {firestore}
