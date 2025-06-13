import { View, Button, StyleSheet, Alert, TextInput, Text, Switch } from "react-native";
import React, { useState } from "react";

import { main, modal, list } from "../style/styles";

import { useCompany, PermissionsKeys } from "../context/CompanyContext";

interface NewLoadComponentProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewEmployeeComponent({
  modalVisible,
  setModalVisible,
}: NewLoadComponentProps) {
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Map<string, boolean>>(
    new Map(Object.keys(PermissionsKeys).map((key) => [key, false]))
  );

  return (
    <>
      <View style={modal.container}>
        <Text style={list.headerText}>Email</Text>
        <TextInput
          placeholder="Email"
          style={list.itemText}
          value={email}
          onChangeText={setEmail}
        />
        <Text style={list.headerText}>Permissions</Text>
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
        />
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
        />
      </View>
      <BottomChild
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        email={email}
        permissions={permissions}
      />
    </>
  );
}

const BottomChild = ({
  modalVisible,
  setModalVisible,
  email, 
  permissions,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  permissions: Map<string, boolean>;
}) => {
  const { addEmployee, company } = useCompany();

  const confirmAlert = async () => {
    Alert.alert(
      "Confirm Invite",
      "Would you like to invite this employee?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await addEmployee?.mutateAsync({
              companyId: company!._id,
              email: email,
              permissions: Object.fromEntries(permissions),
            }).then(() => setModalVisible(!modalVisible));
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

  const cancelAlert = async () => {
    Alert.alert(
      "Cancel Invite",
      "Would you like to cancel inviting this employee?",
      [
        {
          text: "Yes",
          onPress: async () => {
            setModalVisible(!modalVisible);
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
        <Button
          title="Confirm"
          onPress={async () => confirmAlert()}></Button>
      </View>
      <View style={main.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => cancelAlert()}></Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
});
