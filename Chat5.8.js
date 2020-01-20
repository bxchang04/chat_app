//Implement and check everything commented as //WIP. May need to do and review 5.7 first.

import React from 'react'
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { StyleSheet, View, Platform, AsyncStorage, Text, Button, FlatList } from 'react-native'; //is this needed or used??
import KeyboardSpacer from 'react-native-keyboard-spacer'
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

const firebase = require('firebase');
require('firebase/firestore');

class App extends React.Component {

  constructor() {
    super();
    if (!firebase.apps.length) {
      firebase.initializeApp({
        // insert your Firestore database credentials here!
      });
    }

    this.referenceMessagesUser = null;

    this.referenceMessages = firebase.firestore().collection('messages');
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: 'Please wait, you are getting logged in',
      //5.6
      image: null,
      location: null
    };
  }

  //this will put the users name in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name
    };
  };

  /**
   * Updates the state of the message with the input of the text.
   * @function onCollectionUpdate
   * @param {string} _id
   * @param {string} text - text message
   * @param {string} image - uri
   * @param {number} location - geo coordinates
   * @param {string} user
   * @param {date} createdAt - date/time of message creation
   */

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        image: data.image, //WIP
        //image: data.image || '', //may need this syntax as well as for other params
        location: data.location, //WIP
        //location: data.location || '', //may need this syntax as well as for other params
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages,
   });
  }

  /**
   * Adds the message the firebase database
   * @function addMessage
   * @param {number} _id
   * @param {string} text
   * @param {date} createdAt
   * @param {string} user
   * @param {image} image //WIP
   * @param {number} geo - coordinates //WIP
   */

  addMessage() {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text || '',
      createdAt: this.state.messages[0].createdAt,
      user: this.state.user,
      uid: this.state.uid,
    });
  }


  /**
  * saves messages to asyncStorage
  * @async
  * @function saveMessage
  * @return {Promise<AsyncStorage>} message in asyncStorage
  */

  //async functions
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
  * If user goes offline messages are stored in async storage
  * @function getMessages
  * @return messages
  */

  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * deletes messages from asyncStorage. Currently not used but written in case it is needed
   * @async
   * @function deleteMessages
   * @param {none}
   */

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    // listen to authentication events
    this.getMessages(); //5.5

    this.authUnsubscribe = firebase.auth().onAuthStateChanged((async user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });

      // create a reference to the active user's documents (messages)
      this.referenceMessagesUser = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);
      // listen for collection changes for current user
      this.unsubscribeListUser = this.referenceMessagesUser.onSnapshot(this.onCollectionUpdate);



    });

    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        console.log('online');
      } else {
        console.log('offline');
      }
    });

  }

  /**
   * @function onSend
   * @param {*} messages - message can be: {message/image/location}
   * @returns {state} updates state with message
   */
   //for params, when should * be used, and when should it not be used?

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.saveMessages();
    });
  }

  //not sure where this belongs, or if it is deprecated
  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
  }

  /**
   * removes toolbar if internet is not detected
   * @function renderInputToolbar
   * @param {*} props
   * @returns {InputToolbar}
   */

  //Disable sending new messages if user is offline
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }

  //Change chat bubble color
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  /**
   * if currentMessage has location coords then mapview is returned
   * @function renderCustomView
   * @param {*} props
   * @returns {MapView}
   */

  renderCustomView (props) {
     const { currentMessage} = props;
     if (currentMessage.location) {
       return (
           <MapView
             style={{width: 150,
               height: 100,
               borderRadius: 13,
               margin: 3}}
             region={{
               latitude: currentMessage.location.latitude,
               longitude: currentMessage.location.longitude,
               latitudeDelta: 0.0922,
               longitudeDelta: 0.0421,
             }}
           />
       );
     }
     return null;
   }

  render() {
    return (
      <View style={{flex:1, backgroundColor:'green'}}>
        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}

        />
        {Platform.OS === 'android' ? <KeyboardSpacer /> : null }

        //Location features
        <Button
          title="Pick an image from the library"
          onPress={this.pickImage}
        />

        <Button
          title="Take a photo"
          onPress={this.takePhoto}
        />

        {this.state.image &&
          <Image source={{ uri: this.state.image.uri }} style={{ width: 200, height: 200 }} />}

        <Button
          title="Get my location"
          onPress={this.getLocation}
        />

        {this.state.location &&
          <MapView
            style={{ width: 300, height: 200 }}
            region={{
              latitude: this.state.location.coords.latitude,
              longitude: this.state.location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />}
      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    fontSize: 30,
  }
});

export default App;
