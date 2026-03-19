// Actions
import { AuthActions, AuthActionTypes } from "../_actions/auth.actions";
import { environment } from "../../../../environments/environment";
// Models
import { User } from "../_models/user.model";
import { Company } from "../_models/company.model";

export interface AuthState {
	loggedIn: boolean;
	authToken: string;
	user: User;
	companyMain: Company;
	isUserLoaded: boolean;
}

export const initialAuthState: AuthState = {
	loggedIn: false,
	authToken: undefined,
	user: undefined,
	companyMain: undefined,
	isUserLoaded: false,
};

export function authReducer(
	state = initialAuthState,
	action: AuthActions
): AuthState {
	switch (action.type) {
		case AuthActionTypes.Login: {
			const _token: string = action.payload.authToken;
			return {
				loggedIn: true,
				authToken: _token,
				user: undefined,
				companyMain: undefined,
				isUserLoaded: false,
			};
		}

		case AuthActionTypes.Register: {
			const _token: string = action.payload.authToken;
			return {
				loggedIn: true,
				authToken: _token,
				user: undefined,
				companyMain: undefined,
				isUserLoaded: false,
			};
		}

		case AuthActionTypes.Logout: {
			localStorage.removeItem(environment.authTokenKey);
			localStorage.removeItem("@user-logged");
			localStorage.removeItem("@user-info");
			localStorage.removeItem("@company-main");
			return initialAuthState;
		}

		case AuthActionTypes.UserLoaded: {
			const _user: User = action.payload.user;
			return {
				...state,
				user: _user,
				isUserLoaded: true,
			};
		}

		case AuthActionTypes.CompanyMain: {
			const _company: Company = action.payload.companyMain;
			return {
				...state,
				companyMain: _company,
			};
		}

		default:
			return state;
	}
}
