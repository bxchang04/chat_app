import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default class CustomActions extends React.Component {

  //Create circle button
  renderCustomActions = (props) => {
     return <CustomActions {...props} />;
  };

  /**
   * requests permission and allows you to pick image from photo library. sends url to uploadImage and onSend
   * @async
   * @function pickImage
   *
   */

  //Location features
  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    try {
      if (status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch(error => console.log(error));

        if (!result.cancelled) {
          this.setState({
            image: result
          });
        }

      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * requests permission to access camera roll and stores the photo as the state and returns uri string. Sends uri string to uploadImage as well as onSend function
   * @async
   * @function takePhoto
   * @returns {Promise<string>} uri - sent to onSend and uploadImage
   */

  takePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync().catch(error => console.log(error));
    try {
      if (!result.cancelled) {
        this.setState({
          image: result
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * requests permission for geo coords
   * @async
   * @function getLocationtoSendtoWeirdos
   * @returns {Promise<number>}
   */

  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    try {
      if (status === 'granted') {
        let result = await Location.getCurrentPositionAsync({}).catch(error => console.log(error));

        if (result) {
          this.setState({
            location: result
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * uploading image as blob to cloud storage
   * @async
   * @function uploadImage
   * @param {string}
   * @returns {string} url
   */

  // upload image to Storage with XMLHttpRequest
   uploadImage = async(uri) => {
     const blob = await new Promise((resolve, reject) => {
       const xhr = new XMLHttpRequest();
       xhr.onload = function() {
         resolve(xhr.response);
       };
       xhr.onerror = function(e) {
         console.log(e);
         reject(new TypeError('Network request failed'));
       };
       xhr.responseType = 'blob';
       xhr.open('GET', uri, true);
       xhr.send(null);
     });

     const ref = firebase
       .storage()
       .ref()
       .child('myimage');

     const snapshot = await ref.put(blob);

     blob.close();

     return await snapshot.ref.getDownloadURL();
   }

   // upload image to Storage with fetch() and blob()
   uploadImageFetch = async(uri) => {
     const response = await fetch(uri);
     const blob = await response.blob();
     const ref = firebase
       .storage()
       .ref()
       .child("my-image");

       const snapshot = await ref.put(blob);

     return await snapshot.ref.getDownloadURL();
   }

  /**
  * When + is pressed actionSheet is called
  * @function onActionPress
  * @returns {actionSheet} - with options to choose from library, take photo, or send location
  */

  onActionsPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('user wants to pick an image');
            return;
          case 1:
            console.log('user wants to take a photo');
            return;
          case 2:
            console.log('user wants to get his location');
          default:
        }
      },
    );
  };


  render() {
    return (
      <TouchableOpacity style={[styles.container]} onPress={this.onActionsPress}>
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
 container: {
   width: 26,
   height: 26,
   marginLeft: 10,
   marginBottom: 10,
 },
 wrapper: {
   borderRadius: 13,
   borderColor: '#b2b2b2',
   borderWidth: 2,
   flex: 1,
 },
 iconText: {
   color: '#b2b2b2',
   fontWeight: 'bold',
   fontSize: 16,
   backgroundColor: 'transparent',
   textAlign: 'center',
 },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
