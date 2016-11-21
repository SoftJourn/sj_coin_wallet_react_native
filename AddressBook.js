/**
 * SJ Coin Wallet App
 * https://github.com/softjourn/sj_coin_wallet-react_native
 * @acidumirae
 */

'use strict';
 
import React, { Component } from 'react'
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  ListView,
  Text,
  Navigator,
  Alert
} from 'react-native';
import { Actions } from 'react-native-router-flux';

class AddressBook extends Component {

  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource(
      {rowHasChanged: (r1, r2) => r1.address !== r2.address});
    this.state = {
      dataSource: dataSource.cloneWithRows(this.props.accounts),
      sending: this.props.sending
    };
  }

  rowPressed(address) {
    var property = this.props.accounts.filter(prop => prop.address === address)[0];
    this.props.parentPage.setState({toAddress: address});
    Actions.pop();
  }

  componentWillUnmount() {
    this.props.onUnmount(this.state.sending);
  }

  renderRow(rowData, sectionID, rowID) { 
    return (
      <TouchableHighlight onPress={() => this.rowPressed(rowData.address)}
        underlayColor='#dddddd'>
        <View>
          <View style={styles.rowContainer}>
            <View  style={styles.textContainer}>
              <Text style={styles.title}
                  numberOfLines={1}>{rowData.address}</Text>
            </View>
          </View>
          <View style={styles.separator}/>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderRow.bind(this)}/>
    );
  }
 
}

var styles = StyleSheet.create({
  thumb: {
    width: 80,
    height: 80,
    marginRight: 10
  },
  textContainer: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  price: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#48BBEC'
  },
  title: {
    fontSize: 20,
    color: '#656565'
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  }
});

module.exports = AddressBook;

