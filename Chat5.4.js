import React from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';

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
    };
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages,
   });
  }

  addMessage() {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text || '',
      createdAt: this.state.messages[0].createdAt,
      user: this.state.user,
      uid: this.state.uid,
    });
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        this.addMessage();
        //this.saveMessages();
      }
    );
  }

  render() {

    return (
      <View style={styles.container}>

        <Text>{this.state.loggedInText}</Text>

        <Text style={styles.text}>All Messages</Text>
        <FlatList
            data={this.state.messages}
            renderItem={({ item }) =>
              <Text style={styles.item}>{item.name}: {item.items}</Text>}
          />

        <Button
          onPress={() => {
            this.addMessage();
          }}
          title = "Say something"
        />
      </View>
    );
  }

  componentDidMount() {
    // listen to authentication events
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
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
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
