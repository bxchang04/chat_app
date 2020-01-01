import React, { Component } from "react";
import { View, Alert, ScrollView, ImageBackground } from 'react-native';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: '',
      color: ''
    }
  }

 // alert the user input
  alertMyText (input = []) {
   Alert.alert(input.text);
  }

  render() {
   return (
     <ImageBackground source={"../assets/background_image.png"} style={{width: '100%', height: '100%'}}>
       <View style={{flex:1, justifyContent:'center'}}>
         <TextInput
           style={{height: 40, borderColor: 'gray', borderWidth: 1}}
           onChangeText={(text) => this.setState({text})}
           value={this.state.text}
           placeholder='Type here ...'
         />
         <Button
          title="Start Chatting"
          style={styles.button}
          onPress={() => {
             this.alertMyText({text: this.state.text}),
             this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color});
          }}
         />
       </View>
     </ImageBackground>
   );
  }

const styles = StyleSheet.create({
  backImage:{
    flex: 1,
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
});
