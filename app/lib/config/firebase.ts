// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDigNqre1I2lgWNVUmxV6zmCfEc4XT9toc",
  authDomain: "wews-7fc10.firebaseapp.com",
  projectId: "wews-7fc10",
  storageBucket: "wews-7fc10.appspot.com",
  messagingSenderId: "883100704316",
  appId: "1:883100704316:web:5b025ed3152ec4de936d39",
  measurementId: "G-K4PHTC6N2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export {auth,db,storage}
export default app