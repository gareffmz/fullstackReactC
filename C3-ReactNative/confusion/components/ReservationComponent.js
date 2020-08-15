import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Picker,
  Switch,
  Button,
  Modal,
  Alert,
} from "react-native";
import { Card } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import * as Animatable from "react-native-animatable";
import * as Permissions from "expo-permissions";
import { Notifications } from "expo";
import * as Calendar from "expo-calendar";

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guests: 1,
      smoking: false,
      date: "",
    };
  }

  static navigationOptions = {
    title: "Reserve Table",
  };

  handleReservation = () => {
    Alert.alert(
      "Your Reservation OK?",
      "Number of Guests: " +
        this.state.guests +
        "\nSmoking? " +
        this.state.smoking.toString() +
        "\nDate and Time: " +
        this.state.date,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Reservation Alert Cancelled");
            this.resetForm();
          },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            this.presentLocalNotification(this.state.date);
            this.addReservationToCalendar(this.state.date);
            this.resetForm();
          },
        },
      ],
      { cancelable: false }
    );
    console.log(JSON.stringify(this.state));
  };

  resetForm = () => {
    this.setState({
      guests: 1,
      smoking: false,
      date: "",
    });
  };

  async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(
      Permissions.USER_FACING_NOTIFICATIONS
    );
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(
        Permissions.USER_FACING_NOTIFICATIONS
      );
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted to show notifications");
      }
    }
    return permission;
  }

  async obtainCalendarPermission() {
    let permission = await Calendar.requestCalendarPermissionsAsync();
    if (permission.status !== "granted") {
      permission = await Permissions.getAsync(Permissions.CALENDAR);
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted to access Calendar");
      }
    }
  }

  async addReservationToCalendar(date) {
    await this.obtainCalendarPermission();
    const calendars = await Calendar.getCalendarsAsync();
    const defaultCalendar = calendars.filter(
      (calendar) => calendar.allowsModifications
    )[0];
    await Calendar.createEventAsync(defaultCalendar.id.toString(), {
      title: "Con Fusion Table Reservation",
      startDate: new Date(Date.parse(date)),
      endDate: new Date(2 * 60 * 60 * 1000 + Date.parse(date)),
      timeZone: "Asia/Hong_Kong",
      location:
        "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong",
    });
  }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
      title: "Your Reservation",
      body: "Reservation for " + date + " requested",
      ios: {
        sound: true,
      },
      android: {
        sound: true,
        vibrate: true,
        color: "#512DA8",
      },
    });
  }

  render() {
    return (
      <Animatable.View animation="zoomIn" duration={2000}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Number of Guests</Text>
          <Picker
            style={styles.formItem}
            selectedValue={this.state.guests}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({ guests: itemValue })
            }
          >
            <Picker.Item label="1" value="1" />
            <Picker.Item label="2" value="2" />
            <Picker.Item label="3" value="3" />
            <Picker.Item label="4" value="4" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="6" value="6" />
          </Picker>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
          <Switch
            style={styles.formItem}
            value={this.state.smoking}
            onTintColor="#512DA8"
            onValueChange={(value) => this.setState({ smoking: value })}
          ></Switch>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Date and Time</Text>
          <DatePicker
            style={{ flex: 2, marginRight: 20 }}
            date={this.state.date}
            format=""
            mode="datetime"
            placeholder="Select Date and Time"
            minDate="2020-06-01"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                marginLeft: 36,
              },
            }}
            onDateChange={(date) => this.setState({ date: date })}
          />
        </View>
        <View style={styles.formRow}>
          <Button
            title="Reserve"
            color="#512DA8"
            onPress={() => this.handleReservation()}
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
});

export default Reservation;
