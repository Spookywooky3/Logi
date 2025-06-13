import { View, Platform, StatusBar, Button, StyleSheet, TextInput } from "react-native";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

import { login, main } from "../style/styles";

const LoginScreen = () => {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { onLogin, onRegister } = useAuth();

  return (
    <SafeAreaView style={main.safeArea}>
      <View style={login.form}>
        <TextInput
          style={login.input}
          placeholder="First Name"
          onChangeText={(text: string) => setFirstName(text)}
          value={first_name}
        />
        <TextInput
          style={login.input}
          placeholder="Last Name"
          onChangeText={(text: string) => setLastName(text)}
          value={last_name}
        />
        <TextInput
          style={login.input}
          autoCapitalize="none"
          placeholder="Username"
          onChangeText={(text: string) => setUsername(text)}
          value={username}
        />
        <TextInput
          style={login.input}
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(text: string) => setEmail(text)}
          value={email}></TextInput>
        <TextInput
          style={login.input}
          autoCapitalize="none"
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={(text: string) => setPassword(text)}
          value={password}
        />
        <Button
          onPress={async () => await onLogin!.mutateAsync({ email, password })}
          title="Login"
        />
        <Button
          onPress={async () =>
            await onRegister!.mutateAsync({
              first_name,
              last_name,
              username,
              email,
              password,
            })
          }
          title="Register"
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
