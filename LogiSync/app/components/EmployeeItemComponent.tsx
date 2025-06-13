import { View, Text, Pressable, Image, Button, Modal, Switch, Alert } from "react-native";
import React, { useEffect, useState } from "react";

import { main, modal, list } from "../style/styles";

import { Employee, useCompany, PermissionsKeys } from "../context/CompanyContext";

interface EmployeeItemProps {
  item: Employee;
}

export default function EmployeeItemComponent({ item }: EmployeeItemProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <View style={[list.itemContainer, { flex: 0.25, flexDirection: "row" }]}>
          <View style={{ flex: 0.8 }}>
            <Text style={list.itemText}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={list.itemText}>{item.email}</Text>
            <Text style={list.itemText}>{item._id}</Text>
            <Text style={list.itemText}>
              {item.permissions.get(PermissionsKeys.owner) ? "Owner" : "Employee"}
            </Text>
          </View>
          <View style={{ flex: 0.2, alignItems: "flex-end" }}>
            <Image
              source={require("../../assets/icon.png")}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 15,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>
      </Pressable>
      <ModalChild
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        item={item}
      />
    </>
  );
}

const ModalChild = ({
  modalVisible,
  setModalVisible,
  item,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  item: Employee;
}) => {
  const [permissions, setPermissions] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    setPermissions(
      new Map(Object.keys(PermissionsKeys).map((key) => [key, item.permissions.get(key)]))
    );
  }, [modalVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={modal.container}>
        <Text style={list.headerText}>Employee Details</Text>
        <Text style={list.itemText}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={list.itemText}>{item.email}</Text>
        <Text style={list.itemText}>
          {item.permissions.get(PermissionsKeys.owner) ? "Owner" : "Employee"} {item._id}
        </Text>
        <Text style={list.headerText}>Permissions</Text>
        <Text style={list.itemText}>Get Employees</Text>
        <Switch
          value={permissions.get(PermissionsKeys.getEmployees)}
          onValueChange={(value) =>
            setPermissions((prev) => {
              const updated = new Map(prev);
              updated.set(PermissionsKeys.getEmployees, value);
              return updated;
            })
          }
          disabled={item.permissions.get(PermissionsKeys.owner)}
        />
        <Text style={list.itemText}>Get All Loads</Text>
        <Switch
          value={permissions.get(PermissionsKeys.getAllLoads)}
          onValueChange={(value) =>
            setPermissions((prev) => {
              const updated = new Map(prev);
              updated.set(PermissionsKeys.getAllLoads, value);
              return updated;
            })
          }
          disabled={item.permissions.get(PermissionsKeys.owner)}
        />
        <Text style={list.itemText}>Edit All Loads</Text>
        <Switch
          value={permissions.get(PermissionsKeys.editAllLoads)}
          onValueChange={(value) =>
            setPermissions((prev) => {
              const updated = new Map(prev);
              updated.set(PermissionsKeys.editAllLoads, value);
              return updated;
            })
          }
          disabled={item.permissions.get(PermissionsKeys.owner)}
        />
      </View>
      <BottomChild
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        item={item}
        updatedPermissions={permissions}
      />
    </Modal>
  );
};

const BottomChild = ({
  modalVisible,
  setModalVisible,
  item,
  updatedPermissions,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  item: Employee;
  updatedPermissions: Map<string, boolean>;
}) => {
  const { company, permissions, removeEmployee, updateEmployee } = useCompany();

  const updateAlert = async () => {
    Alert.alert(
      "Confirm Update",
      "Would you like to update this employee?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await updateEmployee
              ?.mutateAsync({
                companyId: company!._id,
                id: item._id,
                permissions: Object.fromEntries(updatedPermissions),
              })
              .then(() => setModalVisible(!modalVisible));
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

  const deleteAlert = async () => {
    Alert.alert(
      "Remove Employee",
      "Would you like to remove this employee?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await removeEmployee
              ?.mutateAsync({
                companyId: company!._id,
                id: item._id,
              })
              .then(() => setModalVisible(!modalVisible));
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
    <View style={main.bottomView}>
      <View style={main.buttonContainer}>
        {permissions!.data!.get(PermissionsKeys.owner) &&
        item.permissions.get(PermissionsKeys.owner) !== true ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <View
              style={{
                flex: 1,
                marginVertical: "1%",
                marginRight: "1%",
              }}>
              <Button
                title="Update"
                onPress={async () => {
                  await updateAlert();
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                marginVertical: "1%",
                marginLeft: "1%",
              }}>
              <Button
                title="Delete"
                onPress={async () => {
                  await deleteAlert();
                }}
              />
            </View>
          </View>
        ) : null}
        <Button
          title="Close"
          onPress={() => setModalVisible(!modalVisible)}
        />
      </View>
    </View>
  );
};
