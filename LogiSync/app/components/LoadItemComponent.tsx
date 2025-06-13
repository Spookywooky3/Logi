import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, Button, Alert, TextInput } from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import * as Yup from "yup";

import { main, modal, list } from "../style/styles";

import { useCompany, Load, PermissionsKeys } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";

interface LoadItemComponentProps {
  item: Load;
}

const loadSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  employeeId: Yup.string().required("Employee ID is required"),
  data: Yup.object().shape({
    content: Yup.string().required("Content is required"),
    weight: Yup.number()
      .required("Weight is required")
      .typeError("Weightmust be a valid number"),
    distance: Yup.number()
      .required("Distance is required")
      .typeError("Distance must be a valid number"),
    start: Yup.string().required("Start is required"),
    end: Yup.string().required("End is required"),
    timeCompleted: Yup.date().required("Time Completed is required"),
    registration: Yup.string().required("Registration is required").uppercase(),
  }),
});

export default function LoadItemComponent({ item }: LoadItemComponentProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <View style={list.itemContainer}>
          <Text style={list.itemText}>{item.data.end}</Text>
          <Text style={list.itemText}>{item.data.content}</Text>
          <Text style={list.itemText}>{item.data.registration}</Text>
          <Text style={list.itemText}>
            {new Date(item.data.timeCompleted).toLocaleString()}
          </Text>
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
  item: Load;
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [load, setLoad] = useState(item);

  const updateLoad = async (path: string, value: any) => {
    setLoad((prevLoad) => {
      const updatedLoad = { ...prevLoad };
      const keys = path.split(".");
      let current: any = updatedLoad;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updatedLoad;
    });
  };

  // JANK JANK JANK NOT CLEAN CODE
  const dateChange = (event: DateTimePickerEvent, selectedDate: any) => {
    if (event.type == "dismissed") {
      setShowDatePicker(false);
      setShowTimePicker(false);
    } else {
      const date = load.data.timeCompleted;
      date.setDate(selectedDate.getDate());
      date.setMonth(selectedDate.getMonth());
      date.setFullYear(selectedDate.getFullYear());

      updateLoad("data.timeCompleted", date);

      setShowDatePicker(false);
      setShowTimePicker(true);
    }
  };

  const timeChange = (event: DateTimePickerEvent, selectedTime: any) => {
    if (event.type == "dismissed") {
      setShowDatePicker(false);
      setShowTimePicker(false);
    } else {
      const date = load.data.timeCompleted;
      date.setHours(selectedTime.getHours());
      date.setMinutes(selectedTime.getMinutes());
      date.setSeconds(selectedTime.getSeconds());

      updateLoad("data.timeCompleted", date);

      setShowTimePicker(false);
    }
  };

  useEffect(() => {
    updateLoad("data.timeCompleted", new Date(load.data.timeCompleted));
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={modal.container}>
        {editMode ? (
          <>
            <Text style={list.headerText}>Load Details</Text>
            <TextInput
              style={list.itemText}
              value={load.title}
              placeholder="Title"
              onChangeText={async (text) => {
                await updateLoad("title", text);
              }}
            />

            <TextInput
              style={list.itemText}
              autoCapitalize="words"
              value={load.data.content}
              placeholder="Content"
              onChangeText={async (text) => await updateLoad("data.content", text)}
            />

            <TextInput
              style={list.itemText}
              value={load.data.weight?.toString()}
              placeholder="Weight"
              keyboardType="numeric"
              onChangeText={async (text) => await updateLoad("data.weight", text)}
            />

            <TextInput
              style={list.itemText}
              autoCapitalize="words"
              value={load.data.start}
              placeholder="Start"
              onChangeText={async (text) => await updateLoad("data.start", text)}
            />

            <TextInput
              style={list.itemText}
              autoCapitalize="words"
              value={load.data.end}
              placeholder="End"
              onChangeText={async (text) => await updateLoad("data.end", text)}
            />

            <TextInput
              style={list.itemText}
              value={load.data.distance?.toString()}
              placeholder="Distance"
              keyboardType="numeric"
              onChangeText={async (text) => await updateLoad("data.distance", text)}
            />

            <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
              <Text style={list.itemText}>
                {load.data.timeCompleted.toLocaleString()}
              </Text>
            </Pressable>
            {showTimePicker ? (
              <DateTimePicker
                mode="time"
                is24Hour={true}
                value={load.data.timeCompleted}
                onChange={timeChange}
              />
            ) : null}
            {showDatePicker ? (
              <DateTimePicker
                mode="date"
                value={load.data.timeCompleted}
                onChange={dateChange}
              />
            ) : null}

            <Text style={list.headerText}>Vehicle Details</Text>
            <TextInput
              style={list.itemText}
              autoCapitalize="characters"
              value={load.data.registration}
              onChangeText={async (text) => await updateLoad("data.registration", text)}
              placeholder="Registration"
            />
          </>
        ) : (
          <>
            <Text style={list.headerText}>Load Details</Text>
            <Text
              style={list.itemText}
              key="title">
              Title: {load.title}
            </Text>

            <Text
              style={list.itemText}
              key="content">
              Content: {load.data.content}
            </Text>

            <Text
              style={list.itemText}
              key="weight">
              Weight: {load.data.weight}
            </Text>

            <Text
              style={list.itemText}
              key="start">
              Start: {load.data.start}
            </Text>
            <Text
              style={list.itemText}
              key="end">
              End: {load.data.end}
            </Text>

            <Text
              style={list.itemText}
              key="distance">
              Distance: {load.data.distance}
            </Text>

            <Text
              style={list.itemText}
              key="timeCompleted">
              Completed: {load.data.timeCompleted.toLocaleString()}
            </Text>

            <Text
              style={list.itemText}
              key="id">
              ID: {load._id}
            </Text>

            <Text style={list.headerText}>Vehicle Details</Text>
            <Text
              style={list.itemText}
              key="vehicleRegistration">
              Registration: {load.data.registration}
            </Text>
          </>
        )}
      </View>
      <BottomChild
        editMode={editMode}
        setEditMode={setEditMode}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        load={load}
      />
    </Modal>
  );
};

const BottomChild = ({
  editMode,
  setEditMode,
  modalVisible,
  setModalVisible,
  load,
}: {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  load: Load;
}) => {
  const { deleteLoad, updateLoad, permissions } = useCompany();
  const { user } = useAuth();

  const confirmUpdateAlert = async () => {
    Alert.alert(
      "Confirm Update",
      "Would you like to update this load?",
      [
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateLoad!.mutateAsync(loadSchema.validateSync(load)).then(() => {
                setEditMode(!editMode);
                setModalVisible(!modalVisible);
              });
            } catch (error: any) {
              alert(error.message);
            }
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

  const confirmDeleteAlert = async () => {
    Alert.alert(
      "Confirm Delete",
      "Would you like to delete this load?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await deleteLoad!
              .mutateAsync(load._id!)
              .then(() => setModalVisible(!modalVisible));
          },
          style: "destructive",
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
        {load.employeeId == user?.data!.user._id ||
        permissions?.data?.get(PermissionsKeys.editAllLoads) == true ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View
                style={{
                  flex: 1,
                  marginVertical: "1%",
                  marginRight: "1%",
                }}>
                <Button
                  title={editMode ? "Confirm" : "Update"}
                  onPress={async () =>
                    editMode ? await confirmUpdateAlert() : setEditMode(!editMode)
                  }
                />
              </View>
              <View
                style={{
                  flex: 1,
                  marginVertical: "1%",
                  marginLeft: "1%",
                }}>
                <Button
                  title={editMode ? "Cancel" : "Delete"}
                  onPress={async () =>
                    editMode ? setEditMode(!editMode) : await confirmDeleteAlert()
                  }
                />
              </View>
            </View>
          </>
        ) : null}
        <Button
          title="Close"
          onPress={() => setModalVisible(!modalVisible)}
        />
      </View>
    </View>
  );
};
