import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCEcNmUPjxmjapyufPOWFkc7z66xn8QVh0",
  authDomain: "cetema-project.firebaseapp.com",
  databaseURL: "https://cetema-project.firebaseio.com",
  projectId: "cetema-project",
  storageBucket: "cetema-project.appspot.com",
  messagingSenderId: "128337473069",
  appId: "1:128337473069:web:1c8f234597490237f052a4",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
