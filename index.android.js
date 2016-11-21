/**
 * SJ Coin Wallet App
 * https://github.com/softjourn/sj_coin_wallet-react_native
 * @acidumirae
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  Alert,
  TouchableHighlight,
  ActivityIndicator,
  View,
  AsyncStorage
} from 'react-native';
import {Actions, Scene, Router} from 'react-native-router-flux';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Prompt from 'react-native-prompt';

var ReactNative = require('react-native');
var SettingsPage = require('./SettingsPage');
var AddressBook = require('./AddressBook');
var SJCoinContract = require('./SJCoinContract');

var STORAGE_KEYS = {
  account_no: 'account_no',
  pub_key: 'pub_key',
  priv_key: 'priv_key',
  endpoint_url: 'endpoint_url'
};

class SJCoinWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      message: '',
      toAddress: '',
      promptVisible: false
    };

    AsyncStorage.getItem(STORAGE_KEYS.account_no).then((value) => {
      this.setState({"account": value});
    }).done();

    AsyncStorage.getItem(STORAGE_KEYS.endpoint_url).then((value) => {
      this.setState({"endpoint_url": value});
    }).done();

    AsyncStorage.getItem(STORAGE_KEYS.pub_key).then((value) => {
      this.setState({"pub_key": value});
    }).done();

    AsyncStorage.getItem(STORAGE_KEYS.priv_key).then((value) => {
      this.setState({"priv_key": value});
    }).done();    

  }

// https://facebook.github.io/react-native/docs/network.html
  _executeQuery(query,sending) {
    console.log(query);
    this.setState({ isLoading: true });
    
    fetch(query)  
    .then((response) => response.json())
    .then((responseJson) => this._handleResponse(responseJson.accounts,sending))
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
 
  _handleResponse(response,sending) {
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
        sending: sending, 
        parentPage: this,
        onUnmount: async(sending) => {
          if (sending) {
            this.setState({promptVisible: true});
          }
        } 
      });   
    } else {
      this.setState({ message: 'Accounts not loaded; please try again.'});
    }
  }

  _sendCoins(address, amount) {
    var myString = SJCoinContract.Send(this, this.state.endpoint_url, address, amount, this.state.priv_key);
  }

  sendCoins(address, text) {
    this.setState({ promptVisible: false, message: `You said "${text}"` })
    var amount = parseInt(text);
    if (amount>0) {
      this._sendCoins(address, amount);  
    } else {
      Alert.alert('Error', "Invalid amount entered");
    }
  }

  onRefreshPressed() {
    var myString = SJCoinContract.QueryBalance(this, this.state.endpoint_url, this.state.account);
  }

  onSettingsPressed() {
      Actions.pageSettings({
        parentPage: this
      });
  }

  onAddressBookPressed() {
    var query = this.state.endpoint_url+'/accounts';
    this._executeQuery(query,false);
  }

  onSendCoinsPressed() {
    var query = this.state.endpoint_url+'/accounts';
    this._executeQuery(query,true);
  }

  render() {
    var spinner = this.state.isLoading ?
      ( <ActivityIndicator
          size='large'/> ) :
      ( <View/>);    
    return (
      <View style={styles.container}>
        <Text style={styles.account}>
          {this.state.account}
        </Text>
        <View style={styles.flowRight}>     
          <Image source={require('./Resources/sj_coin_transparent.png')} style={styles.image} />
          <Image source={{uri: 'https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl='+this.state.account}} style={styles.image} />
        </View>
        <View style={styles.flowRight}>
          <Text style={styles.balance}>
            Your balance:
          </Text>
          <Text style={styles.balance}>
            {this.state.balance}
          </Text>
        </View>
        <View style={styles.flowRight}>
          <TouchableHighlight style={styles.button}
                              onPress={this.onRefreshPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button}
                              onPress={this.onSendCoinsPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Send Coins</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.flowRight}>
          <TouchableHighlight style={styles.button}
                              onPress={this.onAddressBookPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Address Book</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button}
                              onPress={this.onSettingsPressed.bind(this)}
                              underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableHighlight>
        </View>
        {spinner}
        <Prompt
            title="Enter amount to send"
            placeholder=""
            defaultValue=""
            visible={this.state.promptVisible}
            onCancel={() => this.setState({ promptVisible: false, message: "You cancelled" })}
            onSubmit={(value) => this.sendCoins(this.state.toAddress, value)}/>        
      </View>
    );
  }
}

export default class SJCoinWalletApp extends Component {
  render() {
    return <Router>
      <Scene key="root">
        <Scene key="pageMain" component={SJCoinWallet} title="SJ Coin Wallet" initial={true} />
        <Scene key="pageSettings" component={SettingsPage} title="Settings" />
        <Scene key="pageAddress" component={AddressBook} title="Address Book" />
        <Scene key="pageScanner" component={QRCodeScanner} title="Scan QR Code" />
      </Scene>
    </Router>
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  },
  container: {
    flex: 1
  },
  flowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  balance: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
  },
  account: {
    textAlign: 'center',
    justifyContent: 'flex-end',
    color: 'black',
    marginBottom: 5,
    marginTop: 70,
    fontSize: 14,
  },
  image: {
    width: 190,
    height: 190
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
    backgroundColor: '#000000',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  searchInput: {
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

AppRegistry.registerComponent('SJCoinWallet', () => SJCoinWalletApp);
