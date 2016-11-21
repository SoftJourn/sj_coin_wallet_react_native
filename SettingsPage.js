/**
 * SJ Coin Wallet App
 * https://github.com/softjourn/sj_coin_wallet-react_native
 * @acidumirae
 */

'use strict';
 
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
import { Actions } from 'react-native-router-flux';

var STORAGE_KEYS = {
  endpoint_url: 'endpoint_url',
  account_no: 'account_no',
  pub_key: 'pub_key',
  priv_key: 'priv_key',
};
exports.getStorageKeys = function() { return STORAGE_KEYS; }

var MOCKED_ACCOUNT_DATA = {
  endpoint_url: 'http://eris.softjourn.if.ua:1337',
  account_no: '', 
  pub_key: '',
  priv_key: ''
};

class SettingsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      message: '',
      messages: '' 
    };
  }

  componentDidMount() {
    this._loadInitialState().done();
  }

  _loadInitialState = async () => {
    try {
      /*** Account ***/
      var value = await AsyncStorage.getItem(STORAGE_KEYS.account_no);
      if (value !== null){
        this.setState({toAddress: value});
      } else {
        this.setState({toAddress: MOCKED_ACCOUNT_DATA.account_no});
      }
      /*** Endpoint URL ***/
      var value = await AsyncStorage.getItem(STORAGE_KEYS.endpoint_url);
      if (value !== null){
        this.setState({endpoint_url: value});
      } else {
        this.setState({endpoint_url: MOCKED_ACCOUNT_DATA.endpoint_url});
      }
      /*** Public Key ***/
      var value = await AsyncStorage.getItem(STORAGE_KEYS.pub_key);
      if (value !== null){
        this.setState({pub_key: value});
      } else {
        this.setState({pub_key: MOCKED_ACCOUNT_DATA.pub_key});
      }
      /*** Private Key ***/
      var value = await AsyncStorage.getItem(STORAGE_KEYS.priv_key);
      if (value !== null){
        this.setState({priv_key: value});
      } else {
        this.setState({priv_key: MOCKED_ACCOUNT_DATA.priv_key});
      }
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }
  };

  _removeStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.account_no);
      await AsyncStorage.removeItem(STORAGE_KEYS.endpoint_url);
      await AsyncStorage.removeItem(STORAGE_KEYS.pub_key);
      await AsyncStorage.removeItem(STORAGE_KEYS.priv_key);
      this._appendMessage('Configuration removed from disk.');
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }
  };

  _appendMessage = (message) => {
    this.setState({messages: this.state.messages.concat(message)});
  };  

  _executeQuery(query) {
    console.log(query);
    this.setState({ isLoading: true });
    
    fetch(query)  
    .then((response) => response.json())
    .then((responseJson) => this._handleResponse(responseJson.accounts))
    .catch(error => 
      {
        Alert.alert('Error', error+"");
        this.setState({
          isLoading: false,
          message: 'Something bad happened ' + error
        })
      }
    );
  }

  _handleResponse(response) {
    this.setState({ isLoading: false , message: '' });
    if (response!=null && response.length>0) {
      var accounts = [];
      response.forEach(function(item, i, response) {
        if (item.code==null || item.code=='') {
          accounts.push(item);
        }
      });
      Actions.pageAddress({
        accounts: accounts, 
        sending: false, 
        parentPage: this, 
        onUnmount: async(sending) => {
          //this._addressInput.setNativeProps({text: this.state.toAddress});
          this.props.parentPage.setState({account: this.state.toAddress});
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.account_no, this.state.toAddress);
          } catch (error) {
            this._appendMessage('AsyncStorage error: ' + error.message);
          }
        }
      });      
    } else {
      this.setState({ message: 'Accounts not loaded; please try again.'});
    }
  }

  async setAccountText(text) {
    this._addressInput.setNativeProps({text: text});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.account_no, text);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }    
  }

  async onEndpointUrlChanged(event) {
    console.log('onEndpointUrlChanged');
    this.setState({endpoint_url: event.nativeEvent.text });
    this.props.parentPage.setState({endpoint_url: event.nativeEvent.text});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.endpoint_url, event.nativeEvent.text);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }     
    console.log(this.state.endpoint_url);
  }
    
  async onAddressChanged(event) {
    console.log('onAccountChanged');
    this.setState({toAddress: event.nativeEvent.text });
    this.props.parentPage.setState({account: event.nativeEvent.text});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.account_no, event.nativeEvent.text);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }      
    console.log(this.state.account);
  }

  onAccountPressed(event) {
    console.log('onAccountPressed');
    var query = this.state.endpoint_url+'/accounts';
    this._executeQuery(query);
  }

  // https://www.npmjs.com/package/react-native-qrcode-scanner
  onScanAccountPressed(event) {
    console.log('onScanAccountPressed');
    Actions.pageScanner({
      onRead: this.onScanAccountSuccess.bind(this),  
      topContent: <Text style={styles.text}>Scan account address QR code.</Text>      
    });
  }

  async onScanAccountSuccess(e) {
    //alert(e.data);
    this.setState({pub_key: e.data });
    this.props.parentPage.setState({account: e.data});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.account_no, e.data);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    } 
    Actions.pop();
  }

  onScanPublicKeyPressed(event) {
    console.log('onScanPublicKeyPressed');
    Actions.pageScanner({
      onRead: this.onScanPublicKeySuccess.bind(this),  
      topContent: <Text style={styles.text}>Scan public key QR code.</Text>      
    });
  }

  async onScanPublicKeySuccess(e) {
    //alert(e.data);
    this.setState({pub_key: e.data });
    this.props.parentPage.setState({pub_key: e.data});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.pub_key, e.data);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    } 
    Actions.pop();
  }

  onScanPrivateKeyPressed(event) {
    console.log('onScanPrivateKeyPressed');
    Actions.pageScanner({
      onRead: this.onScanPrivateKeySuccess.bind(this),
      topContent: <Text style={styles.text}>Scan private key QR code.</Text>,
    });      
  }

  async onScanPrivateKeySuccess(e) {
    //alert(e.data);
    this.setState({priv_key: e.data });
    this.props.parentPage.setState({priv_key: e.data});
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.priv_key, e.data);
    } catch (error) {
      this._appendMessage('AsyncStorage error: ' + error.message);
    }
    Actions.pop();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          Server endpoint URL:
        </Text>
        <View style={styles.flowRight}>
          <TextInput
            style={styles.textInput}
            value={this.state.endpoint_url}
            onChange={this.onEndpointUrlChanged.bind(this)}
            placeholder='Server URL'/>
        </View>
        <Text style={styles.label}>
          Account address:
        </Text>
        <Text style={styles.text}>
          {this.state.toAddress}
        </Text>
        <View style={styles.flowRight}>
          <TouchableHighlight style={styles.button}
                              onPress={this.onAccountPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}> Select </Text>            
          </TouchableHighlight>
          <TouchableHighlight style={styles.button}
                              onPress={this.onScanAccountPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}> Scan </Text>
          </TouchableHighlight>
        </View>
        <Text style={styles.label}>
          Public key:
        </Text>
        <Text style={styles.text}>
          {this.state.pub_key}
        </Text>
        <View style={styles.flowRight}>
          <TouchableHighlight style={styles.button}
                              onPress={this.onScanPublicKeyPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Scan Public Key</Text>
          </TouchableHighlight>
        </View>
        <Text style={styles.label}>
          Private key:
        </Text>
        <Text style={styles.text}>
          {this.state.priv_key}
        </Text>
        <View style={styles.flowRight}>
          <TouchableHighlight style={styles.button}
                              onPress={this.onScanPrivateKeyPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Scan Private Key</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  label: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 18,
    textAlign: 'center',
    color: '#656565',
    fontWeight: 'bold'
  },  
  text: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 18,
    textAlign: 'center',
    color: '#656565'
  },  
  container: {
    padding: 30,
    marginTop: 40,
    alignItems: 'center'
  },
  flowRight: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'stretch'
},
buttonText: {
  fontSize: 18,
  color: 'white',
  alignSelf: 'center'
},
button: {
  height: 36,
  flex: 1,
  flexDirection: 'row',
  backgroundColor: '#48BBEC',
  borderColor: '#48BBEC',
  borderWidth: 1,
  borderRadius: 8,
  marginBottom: 10,
  alignSelf: 'stretch',
  justifyContent: 'center'
},
textInput: {
  height: 36,
  padding: 4,
  marginRight: 5,
  flex: 4,
  fontSize: 18,
  borderWidth: 1,
  borderColor: '#48BBEC',
  borderRadius: 8,
  color: '#48BBEC'
}
});


module.exports = SettingsPage;

