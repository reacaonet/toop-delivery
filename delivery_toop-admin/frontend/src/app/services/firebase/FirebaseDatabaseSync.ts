import firebase from "firebase";
import { environment } from "../../../environments/environment";

const firebaseConfig = (application = "toop") => {
	try {
		let app: any = null;
		let defaultConfig = environment.FIREBASE;

		try {
			app = firebase.app(`${application}`);
		} catch (err) {
			app = null;
		}

		if (!app) {
			app = firebase.initializeApp(defaultConfig, application);
		}

		const Firebase: any = app.database();
		return Firebase;
	} catch (err) {
		console.log("err", err);
		return null;
	}
};

export default firebaseConfig;
