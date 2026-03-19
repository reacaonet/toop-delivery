import { Action } from '@ngrx/store';

import { User } from '../_models/user.model';
import { Company as CompanyModel } from '../_models/company.model';

export enum AuthActionTypes {
  Login = '[Login] Action',
  Logout = '[Logout] Action',
  Register = '[Register] Action',
  UserRequested = '[Request User] Action',
  UserLoaded = '[Load User] Auth API',
  CompanyMain = '[Company Main] Action'
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;
  constructor(public payload: { authToken: string }) { }
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class Register implements Action {
  readonly type = AuthActionTypes.Register;
  constructor(public payload: { authToken: string }) { }
}

export class UserRequested implements Action {
  readonly type = AuthActionTypes.UserRequested;
}

export class UserLoaded implements Action {
  readonly type = AuthActionTypes.UserLoaded;
  constructor(public payload: { user: User }) { }
}

export class CompanyMain implements Action {
  readonly type = AuthActionTypes.CompanyMain;
  constructor(public payload: { companyMain: CompanyModel }) { }
}

export type AuthActions = Login | Logout | Register | UserRequested | UserLoaded | CompanyMain;
