import { StyleSheet, Platform, StatusBar } from "react-native";

export const header = StyleSheet.create({
  headerButtonContainer: {
    marginRight: "3%",
  },
});

export const main = StyleSheet.create({
  safeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: "3%",
    alignItems: "center",
  },
  bottomView: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  buttonContainer: {
    bottom: 15,
    width: "85%",
    marginTop: "1%",
    margin: "auto",
  },
});

export const modal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: "3%",
  },
});

export const list = StyleSheet.create({
  container: {
    padding: "3%",
    flex: 1,
  },
  titleText: {
    marginTop: "3%",
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  headerContainer: {
    borderColor: "#dcdcdc",
    backgroundColor: "#e6e6e6",

    width: "100%",

    borderWidth: 1,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
  },
  headerText: {
    margin: "2%",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 25,
  },
  itemContainer: {
    borderColor: "#dcdcdc",
    backgroundColor: "#e6e6e6",

    width: "100%",
    padding: "2%",

    borderWidth: 1,
    borderRadius: 15,
    borderTopStartRadius: 0,
    borderTopEndRadius: 0,
  },
  itemText: {
    fontSize: 15,
    fontWeight: 500,
  },
});

export const login = StyleSheet.create({
  form: {
    gap: 10,
    width: "70%",
    verticalAlign: "middle",
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 5,
  },
});
