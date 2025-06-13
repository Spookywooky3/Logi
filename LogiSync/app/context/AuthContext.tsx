import { createContext, useContext, useEffect, useState } from "react";

import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";

import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "jwtKey";
export const API_URL = "http://192.168.1.9:3000/api";

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null };
  user?: UseQueryResult<any, Error>;
  onRegister?: UseMutationResult<any, Error, any, unknown>;
  onLogin?: UseMutationResult<any, Error, any, unknown>;
  onLogout?: () => Promise<any>;
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `bearer ${token}`;

          setAuthState({
            token: token,
            authenticated: true,
          });
        }
      } catch (error: any) {
        alert(`Error retrieving token. ${(error as any).response.data.msg}`);
      }
    };
    loadToken();
  }, []);

  const user = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const result = await axios.get(`${API_URL}/user/me`);
        return result.data;
      } catch (error: any) {
        alert(`Failed to retrieve user data, ${error.message}`);
      }
    },
    enabled: authState.authenticated == true && authState.token != null,
  });

  const register = useMutation({
    mutationFn: async ({
      first_name,
      last_name,
      username,
      email,
      password,
    }: {
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      password: string;
    }) => {
      try {
        username = username.toLowerCase();
        email = email.toLowerCase();

        const result = await axios.post(`${API_URL}/user/register`, {
          first_name,
          last_name,
          username,
          email,
          password,
        });

        if (result.status == 201) { 
            return await login.mutateAsync({ email, password });
        }

      } catch (error) {
        alert(`Error registering. ${(error as any).response.data.msg}`);
      }
    },
  });

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        email = email.toLowerCase();

        const result = await axios.post(`${API_URL}/user/login`, {
          email,
          password,
        });

        await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);

        axios.defaults.headers.common["Authorization"] = `bearer ${result.data.token}`;

        setAuthState({
          token: result.data.token,
          authenticated: true,
        });

        return result;
      } catch (error) {
        alert(`Error logging in. ${(error as any).response.data.msg}`);
      }
    },
  });

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    axios.defaults.headers.common["Authorization"] = "";

    setAuthState({
      token: null,
      authenticated: false,
    });
  };

  const value = {
    authState,
    user: user,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
