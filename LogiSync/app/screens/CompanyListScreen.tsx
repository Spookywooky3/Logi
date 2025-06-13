import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import {
  ActivityIndicator,
  SectionList,
  View,
  Text,
  Pressable,
  Button,
  Modal,
  TextInput,
} from "react-native";

import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { main, list, modal } from "../style/styles";

import { API_URL, useAuth } from "../context/AuthContext";
import { Company } from "../context/CompanyContext";

// this is a fucking messy shit show that i need to clean up desperately its doing my fucking head in
const CompanyListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();

  // Register company modal.
  const [modalVisible, setModalVisible] = React.useState(false);

  // Get company info from api.

  if (user!.isFetching) {
    return (
      <View style={main.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={main.container}>
      {/* 
					If there are no companies, show register company button. 
					Otherwise show company section list
					*/}
      {user!.data!.user.companyIds!.length === 0 ? (
        <>
          <View
            style={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text style={list.headerText}>No Companies Found</Text>
            <Button
              title="Register Company"
              onPress={async () => {
                setModalVisible(true);
              }}
            />
            <NewCompany
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
          </View>
        </>
      ) : (
        <SectionList
          keyExtractor={(item) => item._id}
          sections={user!.data!.companies!.map((company: Company) => ({
            title: company.name,
            data: [company],
          }))}
          renderSectionHeader={({ section }) => (
            <View style={list.headerContainer}>
              <Text
                style={list.headerText}
                key={section.title}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate(item._id, { company: item })}>
              <View style={list.itemContainer}>
                <Text style={list.itemText}>{item.name}</Text>
              </View>
            </Pressable>
          )}
          SectionSeparatorComponent={() => <View style={{ height: "5%" }} />}
        />
      )}
    </View>
  );
};

const NewCompany = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = React.useState("");

  // Register company mutation. Look into a better way of doing this later
  const registerCompany = useMutation({
    mutationFn: async (name: string) => {
      try {
        const result = await axios.post(`${API_URL}/company/register`, {
          name: name, // wittiwy wedundant
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {}}>
      <View
        style={[
          modal.container,
          {
            justifyContent: "flex-start",
            alignContent: "center",
            alignItems: "center",
          },
        ]}>
        <Text style={list.headerText}>New Company</Text>
        <TextInput
          style={list.itemText}
          placeholder="Company Name"
          onChangeText={async (text) => {
            setCompanyName(text);
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: "5%",
        }}>
        <View style={{ flex: 1, marginVertical: "1%", marginRight: "1%" }}>
          <Button
            title="Confirm"
            onPress={async () => {
              await registerCompany
                .mutateAsync(companyName)
                .then(() => setModalVisible(!modalVisible));
            }}
          />
        </View>
        <View style={{ flex: 1, marginVertical: "1%", marginLeft: "1%" }}>
          <Button
            title="Cancel"
            onPress={async () => {
              setModalVisible(!modalVisible);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CompanyListScreen;
