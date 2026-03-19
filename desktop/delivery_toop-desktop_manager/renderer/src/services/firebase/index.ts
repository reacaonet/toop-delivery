import "firebase/database";

import firebase from "firebase/app";

const firebaseConfig = {
	apiKey: "AIzaSyD2nOxlpZNx7uDzdyowYgIBEasINrHv05U",
	authDomain: "rich-access-318216.firebaseapp.com",
	databaseURL: "https://rich-access-318216-default-rtdb.firebaseio.com",
	projectId: "rich-access-318216",
	storageBucket: "rich-access-318216.appspot.com",
	messagingSenderId: "611821503010",
	appId: "1:611821503010:web:bac59b5cd578f0b2e3807b",
	measurementId: "G-T37YVVR0BP"
};

if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export { database, firebase };
