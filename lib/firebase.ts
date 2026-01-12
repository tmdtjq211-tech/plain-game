import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDn-CkjlWu9N00Sxhr3E5R7K2Y4m-smX0k",
  authDomain: "boreagame758.firebaseapp.com",
  databaseURL: "https://boreagame758-default-rtdb.firebaseio.com",
  projectId: "boreagame758",
  storageBucket: "boreagame758.firebasestorage.app",
  messagingSenderId: "175596773890",
  appId: "1:175596773890:web:0e7729b3ae1da136e43d1b",
  measurementId: "G-H2V7NB746M"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
