import React from "react";
import {
  Text,
  View,
  Modal,
  SectionList,
  Pressable,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";

import { Menu } from "react-native-paper";

import { pickDirectory } from "react-native-document-picker";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

import AntDesign from "@expo/vector-icons/AntDesign";

import { main, list } from "../style/styles";

import LoadItemComponent from "../components/LoadItemComponent";
import NewLoadComponent from "../components/NewLoadComponent";
import EmployeeItemComponent from "../components/EmployeeItemComponent";
import NewEmployeeComponent from "../components/NewEmployeeComponent";

import { useCompany, PermissionsKeys } from "../context/CompanyContext";

const Tab = createBottomTabNavigator();

const CompanyScreen = () => {
  const navigation = useNavigation();
  const { permissions } = useCompany();

  const [loadMenuVisible, setLoadMenuVisible] = React.useState(false);
  const [employeeMenuVisible, setEmployeeMenuVisible] = React.useState(false);
  const [loadModalVisible, setLoadModalVisible] = React.useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = React.useState(false);

  if (permissions!.isFetching) {
    return <ActivityIndicator />;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Loads"
        children={() => (
          <LoadsChild
            modalVisible={loadModalVisible}
            setModalVisible={setLoadModalVisible}
          />
        )}
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
              <AntDesign
                name="back"
                size={30}
                color="black"
              />
            </Pressable>
          ),
          headerRight: () => (
            <Menu
              visible={loadMenuVisible}
              onDismiss={() => setLoadMenuVisible(false)}
              anchorPosition="bottom"
              anchor={
                <Pressable
                  onPress={() => {
                    setLoadMenuVisible(true);
                  }}>
                  <AntDesign
                    name="menuunfold"
                    size={30}
                    color="black"
                  />
                </Pressable>
              }>
              <Menu.Item
                title="Add Load"
                onPress={() => {
                  setLoadMenuVisible(false);
                  setLoadModalVisible(true);
                }}
              />
              <Menu.Item
                title="Export CSV"
                onPress={async () => {}}
              />
            </Menu>
          ),
          tabBarIcon: ({ color }) => (
            <AntDesign
              name="copy1"
              color={color}
              size={30}
            />
          ),
        }}
      />
      {permissions!.data!.get(PermissionsKeys.getEmployees) ? (
        <Tab.Screen
          name="Employees"
          children={() => (
            <EmployeeChild
              modalVisible={employeeModalVisible}
              setModalVisible={setEmployeeModalVisible}
            />
          )}
          options={{
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <Pressable onPress={() => navigation.goBack()}>
                <AntDesign
                  name="back"
                  size={30}
                  color="black"
                />
              </Pressable>
            ),
            headerRight: () =>
              permissions!.data!.get(PermissionsKeys.owner) ? (
                <Menu
                  visible={employeeMenuVisible}
                  onDismiss={() => setEmployeeMenuVisible(false)}
                  anchorPosition="bottom"
                  anchor={
                    <Pressable onPress={() => setEmployeeMenuVisible(true)}>
                      <AntDesign
                        name="menuunfold"
                        size={30}
                        color="black"
                      />
                    </Pressable>
                  }>
                  <Menu.Item
                    title="Add Employee"
                    onPress={() => {
                      setEmployeeMenuVisible(false);
                      setEmployeeModalVisible(true);
                    }}
                  />
                </Menu>
              ) : null,
            tabBarIcon: ({ color }) => (
              <AntDesign
                name="team"
                color={color}
                size={30}
              />
            ),
          }}
        />
      ) : null}
      {permissions!.data!.get(PermissionsKeys.owner) ? (
        <Tab.Screen
          name="Company Profile"
          children={() => <CompanyProfileChild />}
          options={{
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <Pressable onPress={() => navigation.goBack()}>
                <AntDesign
                  name="back"
                  size={30}
                  color="black"
                />
              </Pressable>
            ),
            tabBarIcon: ({ color }) => (
              <AntDesign
                name="setting"
                color={color}
                size={30}
              />
            ),
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
};

const LoadsChild = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { loads } = useCompany();

  return (
    <View style={main.container}>
      {loads!.isFetching ? (
        <ActivityIndicator />
      ) : (
        <>
          <SectionList
            keyExtractor={(item) => item._id!}
            sections={loads!.data!.map((load) => ({
              title: load.title,
              data: [load],
              _id: load._id,
            }))}
            renderSectionHeader={({ section }) => (
              <View style={list.headerContainer}>
                <Text
                  style={list.headerText}
                  key={section._id}>
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => <LoadItemComponent item={item} />}
            SectionSeparatorComponent={() => <View style={{ height: "3%" }} />}
          />

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}>
            <NewLoadComponent
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
          </Modal>
        </>
      )}
    </View>
  );
};

const EmployeeChild = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { employees } = useCompany();

  return (
    <View style={main.container}>
      {employees!.isFetching ? (
        <ActivityIndicator />
      ) : (
        <>
          <SectionList
            keyExtractor={(item) => item._id}
            sections={employees!.data!.map((employee) => ({
              first_name: employee.first_name,
              last_name: employee.last_name,
              _id: employee._id,
              data: [employee],
            }))}
            renderSectionHeader={({ section }) => (
              <View style={list.headerContainer}>
                <Text
                  style={list.headerText}
                  key={section._id}>
                  {section.first_name} {section.last_name}
                </Text>
              </View>
            )}
            renderItem={({ item }) => <EmployeeItemComponent item={item} />}
            SectionSeparatorComponent={() => <View style={{ height: "3%" }} />}
          />

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}>
            <NewEmployeeComponent
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
          </Modal>
        </>
      )}
    </View>
  );
};

const CompanyProfileChild = () => {
  const navigation = useNavigation();
  const { company, deleteCompany } = useCompany();

  const cancelAlert = async () => {
    Alert.alert(
      "Delete Company",
      "Are you certain you want to delete this company?",
      [
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            Alert.alert(
              "Are you sure?",
              "This cannot be undone.",
              [
                {
                  text: "Yes",
                  style: "destructive",
                  onPress: async () => {
                    await deleteCompany
                      ?.mutateAsync({})
                      .then(() => navigation.getParent()!.goBack());
                  },
                },
                {
                  text: "No",
                  style: "cancel",
                },
              ],
              {
                cancelable: true,
              }
            );
          },
        },
        {
          text: "No",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  return (
    <>
      <View style={[main.container]}>
        <Text style={list.headerText}>{company!.name}</Text>
        <Text style={list.itemText}>ID: {company!._id}</Text>
      </View>
      <View style={main.bottomView}>
        <View style={main.buttonContainer}>
          <Button
            title="Delete"
            color="red"
            onPress={async () => {
              await cancelAlert();
            }}
          />
        </View>
      </View>
    </>
  );
};

export default CompanyScreen;
