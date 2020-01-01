import React, { Component } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

//this will put the users name in navigation bar
static navigationOptions = ({ navigation }) => {
  return {
    title: navigation.state.params.name
  };
};

render() {
  /**
  * uses name and background color defined on start screen
  */
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: this.props.navigation.state.params.color
      }}
    >
    </View>
  );
}

/*
Add the different colors the user can choose from when setting the background color of their chat app’s UI.
Use fixed widths and heights to display the colors in your layout.
Use borderRadius to create circles. The borderRadius must be half the width of the element to make it round, so if your circle has a width of 50, its borderRadius must be 50/2.
*/

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#fff",
  alignItems: "center",
  justifyContent: "center",
  width: "100%"
}
});
