import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import Store from 'electron-store';

import { setupApiClient } from '../services/api';

interface SignInData {
	email: string;
	password: string;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	company?: string;
}

interface AuthContextData {
	authenticated: boolean;
	isAuthenticated: boolean;
	user: User | null;
	credentialError: boolean;
	messageErr: string;
	setCredentialError: (value: boolean) => void;
	login(data: SignInData): Promise<void>;
	signIn(data: SignInData): Promise<void>;
	signOut(): void;
	loadUser(): void;
}

interface AuthProviderProps {
	children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
	const [user, setUser] = useState<User | null>(null);
	const [credentialError, setCredentialError] = useState(false);
	const [messageErr, setMessageErr] = useState('');

	const store = new Store();
	const isAuthenticated = !!user;

	const loadUser = useCallback(() => {
		const storedUser = store.get('toop.user');
		const token = store.get('accessToken');

		if (storedUser && token) {
			setUser(storedUser as User);
		}
	}, []);

	useEffect(() => {
		loadUser();
	}, [loadUser]);

	const login = useCallback(async (data: SignInData) => {
		try {
			setCredentialError(false);
			setMessageErr('');
			const api = setupApiClient();
			const { data: response } = await api.post('/auth', {
				email: data.email,
				password: data.password,
			});

			if (!response?.success) {
				setCredentialError(true);
				setMessageErr(response?.message || 'Credenciais inválidas');
				return;
			}

			const { user: userData, token, refreshToken } = response.data;

			store.set('accessToken', token);
			store.set('refreshToken', refreshToken);
			store.set('toop.user', userData);
			if (userData.company) {
				store.set('toop.user.company', userData.company);
			}

			setUser(userData);
		} catch (err: any) {
			setCredentialError(true);
			const msg = err?.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
			setMessageErr(msg);
		}
	}, []);

	const signIn = login;

	const signOut = useCallback(() => {
		store.clear();
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				authenticated: isAuthenticated,
				isAuthenticated,
				user,
				credentialError,
				messageErr,
				setCredentialError,
				login,
				signIn,
				signOut,
				loadUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextData {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
