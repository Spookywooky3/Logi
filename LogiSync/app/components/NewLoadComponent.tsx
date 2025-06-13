import React, { useState } from "react";
import { View, Text, Button, Alert, TextInput, Pressable } from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import * as Yup from "yup";

import { main, modal, list } from "../style/styles";

import { useCompany, Load } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";

interface NewLoadComponentProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function NewLoadComponent({
  modalVisible,
  setModalVisible,
}: NewLoadComponentProps) {
  const { user } = useAuth();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // JANK JANK JANK NOT CLEAN CODE also make sure later i check to see if they hit cancel lol
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

  const [load, setLoad] = useState<Load>({
    title: "",
    employeeId: user!.data!.user._id!,
    data: {
      registration: "",
      content: "",
      weight: undefined,
      distance: undefined,
      start: "",
      end: "",
      timeCompleted: new Date(Date.now()),
    },
  });

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

  return (
    <>
      <View style={modal.container}>
        <View>
          <Text style={list.headerText}>Load Details</Text>
          <TextInput
            style={list.itemText}
            autoCapitalize="words"
            value={load.title}
            placeholder="Title"
            onChangeText={async (text) => await updateLoad("title", text)}
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
            onChangeText={async (text) =>
              await updateLoad("data.distance", text)
            }
          />
          <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
            <Text style={list.itemText}>{load.data.timeCompleted.toLocaleString()}</Text>
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
        </View>
        <View>
          <Text style={list.headerText}>Vehicle Details</Text>
          <TextInput
            style={list.itemText}
            autoCapitalize="characters"
            value={load.data.registration}
            placeholder="Registration"
            onChangeText={async (text) => await updateLoad("data.registration", text)}
          />
        </View>
      </View>
      <BottomChild
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        load={load}
      />
    </>
  );
}

const BottomChild = ({
  modalVisible,
  setModalVisible,
  load,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  load: Load;
}) => {
  const { createLoad } = useCompany();

  const confirmAlert = async () => {
    Alert.alert(
      "Confirm Create",
      "Would you like to create this load?",
      [
        {
          text: "Yes",
          onPress: async () => {
            try {
              await createLoad!
                .mutateAsync(loadSchema.validateSync(load!))
                .then(() => setModalVisible(!modalVisible));
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

  const cancelAlert = async () => {
    Alert.alert(
      "Cancel Load",
      "Would you like to cancel this load?",
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
