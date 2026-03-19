import firebase from "firebase";

import { environment } from "../../../environments/environment";

let config = environment.FIREBASE;

// firebase.initializeApp(config);
// const Firebase = firebase.database();

// export default Firebase;

// const app = initializeApp(config);
// const Firebase = database(app);
// export default Firebase;
let app: any = null;

try {
	app = firebase.app();
} catch (err) {
	app = null;
}

if (!app) {
	app = firebase.initializeApp(config);
}

const Firebase: any = app.database();

export default app;
