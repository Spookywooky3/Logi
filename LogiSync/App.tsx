import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import React from "react";
import { Button, View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { header } from "./app/style/styles";

import HomeScreen from "./app/screens/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import CompanyListScreen from "./app/screens/CompanyListScreen";
import CompanyScreen from "./app/screens/CompanyScreen";

import { AuthProvider, useAuth } from "./app/context/AuthContext";
import CompanyProvider from "./app/context/CompanyContext";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider>
            <Layout />
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export const Layout = () => {
  const { authState, user } = useAuth();

  if (user!.isFetching) {
    return <ActivityIndicator />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState?.authenticated && !user!.isFetching ? (
          <>
            <Stack.Screen
              name="MainDrawer"
              component={MainDrawerNavigator}
              options={{ headerShown: false }}
            />
            {user!.data!.user.companyIds!.length > 0 &&
              user!.data!.user.companyIds!.map((companyId: string) => {
                return (
                  <Stack.Screen
                    name={companyId}
                    options={{ headerShown: false }}
                    key={`stack-${companyId}`}>
                    {({ route }: any) => (
                      <CompanyProvider company={route.params.company}>
                        <CompanyScreen />
                      </CompanyProvider>
                    )}
                  </Stack.Screen>
                );
              })}
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainDrawerNavigator = () => {
  const { onLogout } = useAuth();

  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => (
            <View style={header.headerButtonContainer}>
              <Button
                onPress={onLogout}
                title="Logout"
              />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Companies"
        component={CompanyListScreen}
        options={{
          headerRight: () => (
            <View style={header.headerButtonContainer}>
              <Button
                onPress={onLogout}
                title="Logout"
              />
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
