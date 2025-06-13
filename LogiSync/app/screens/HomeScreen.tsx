import { View, Image, Text, Button, Pressable } from "react-native";
import React from "react";

import { main, list } from "../style/styles";

import { useAuth } from "../context/AuthContext";

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <View style={main.container}>
      <View style={list.headerContainer}>
        <Text style={list.headerText}>Profile</Text>
      </View>
      <View
        style={[
          list.itemContainer,
          {
            flex: 0.15,
            flexDirection: "row",
            alignContent: "flex-start",
            padding: "2%",
            backgroundColor: "#e6e6e6",
            borderColor: "#dcdcdc",
            borderRadius: 15,
          },
        ]}>
        <View
          style={{
            flex: 0.6,
            justifyContent: "flex-start",
            marginRight: "5%",
          }}>
          <Text>{user!.data!.user.username}</Text>
          <Text>{user!.data!.user.email}</Text>
          <Text>{user!.data!.user.first_name} {user!.data!.user.last_name}</Text>

          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <Button title="Edit Profile"></Button>
          </View>
        </View>
        <View style={{ flex: 0.4, alignItems: "flex-end" }}>
          <Image
            source={require("../../assets/icon.png")}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              borderRadius: 15,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
