/* eslint-disable react-hooks/exhaustive-deps */
import Store from "electron-store";
import Router from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

import { setupApiClient } from "../services/api";

interface ContextProps {
  handleSignOutWeb: () => void;
  credentialError: boolean;
  messageErr?: string;
  setCredentialError: (value: boolean) => void;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  user?: UserProps;
}

interface ProviderProps {
  children: ReactNode;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface UserProps {
  hasOwnDelivery: boolean;
  type: string;
  name: string;
  id: number;
  picture: string;
}

const AuthContext = createContext({} as ContextProps);

export function AuthProvider({ children }: ProviderProps): JSX.Element {
  const [user, setUser] = useState<UserProps>();
  const [messageErr, setMessageErr] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [credentialError, setCredentialError] = useState(false);

  const api = setupApiClient();
  const store = new Store();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUserData = async (): Promise<void> => {
    const id = store.get("toop.user.id");
    const company = store.get("toop.user.company");

    if (id) {
      try {
        await api.get(`/users/${id}?type=shopper`).then(({ data }) => {
          api.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
        });

        await api
          .get(`/company/company-delivery/${company}`)
          .then(({ data }) => {
            setUser((oldUser) => ({
              ...oldUser,
              hasOwnDelivery: data[0]?.own_delivery
            }));
          });

        await api.get("/acl/users").then(({ data }) => {
          setUser((oldUser) => ({
            ...oldUser,
            name: data.company?.name,
            type: data.company?.type,
            id: data.company?._id,
            picture: data.pic
          }));

          setIsAuthenticated(true);
        });
      } catch (err) {
        console.log("fail err", err);
      }
    } else {
      store.delete("toop.user.id");
      store.delete("toop.user.company");
      store.delete("accessToken");

      setIsAuthenticated(false);
      Router.push("/home");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated]);

  async function signIn({ email, password }: SignInCredentials): Promise<void> {
    try {
      setMessageErr(null);

      const response = await api.post("/users/auth-admin", {
        email,
        password
      });

      if (response.data?.code === 401) {
        if (response.data?.message === "Email ou Senha inválido") {
          setCredentialError(true);
          return;
        }
      }

      if (response.data?.code && response.data?.code !== 200) {
        if (response.data?.message) {
          setMessageErr(response.data?.message)
        }

        setCredentialError(true);
        return
      }

      const { accessToken, user } = response.data;

      store.set("toop.user.id", user?._id);
      store.set("toop.user.company", user?.company);
      store.set("accessToken", `${accessToken}`);

      api.defaults.headers["Authorization"] = `Bearer ${accessToken} `;
      api.defaults.headers["Company"] = `${user?.company} `;

      await fetchUserData();

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
      setCredentialError(true);
    }
  }

  function handleSignOutWeb(): void {
    setUser(undefined);
    setIsAuthenticated(false);
    store.delete("toop.user.id");
    store.delete("toop.user.company");
    store.delete("accessToken");
  }

  return (
    <AuthContext.Provider
      value={{
        credentialError,
        messageErr,
        setCredentialError,
        handleSignOutWeb,
        isAuthenticated,
        signIn,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): ContextProps => useContext(AuthContext);
