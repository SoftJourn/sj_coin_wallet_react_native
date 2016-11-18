import {
  Alert
} from 'react-native';

var sj_coin_contract_address = "C391358CB3BD873A6A6893FEC98BD0453A8B743E";
var sj_coin_endpoint_path = "/rpc";
var sj_coin_balance_format = "37F42841000000000000000000000000{0}";
var sj_coin_send_format = "D0679D34000000000000000000000000{0}00000000000000000000000000000000000000000000000000000000{1}";

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

exports.Send = function(parent, url, toAddress, amount, privateKey) {
  var hexValue = ("00000000" + (amount).toString(16)).substr(-8,8);
  if (hexValue.length > 8) {
  	return "Error: amount is too large for this POC to survive";
  }
  try {
    let res = MakeCall(url, "erisdb.transactAndHold", 
    {
      priv_key: privateKey,
      address: sj_coin_contract_address,
      data: String.format(sj_coin_send_format, toAddress, hexValue),
      gas_limit: 1000000,
      fee: 0
    }).then(x => {
      if (x.result==null && x.error!=null) {
        alert(x.error.message);
      } else {
        //alert(JSON.stringify(x));  
        Alert.alert("Transaction ID",""+JSON.stringify(x.result[1].tx_id)); 
      }
    });
  } catch(error) {
    alert(error);
    console.error(error);
  }
  return "Error";
}

/* 
{
  "jsonrpc":"2.0",
  "method":"erisdb.call",
  "params":{
    "from":"2C76A03ADA83E4F0A9DD9D8FBFC54E5EE4026C3F",
    "address":"C391358CB3BD873A6A6893FEC98BD0453A8B743E",
    "data":"37F428410000000000000000000000002C76A03ADA83E4F0A9DD9D8FBFC54E5EE4026C3F"
  },
  "id":"1"
}
*/
// {"result":{"return":"000000000000000000000000000000000000000000000000000000003b9aca00","gas_used":0},"error":null,"id":"1","jsonrpc":"2.0"}
exports.QueryBalance = function(parent, url, address) {
  try {
    let res = MakeCall(url, "erisdb.call", 
    {
      from: address,
      address: sj_coin_contract_address,
      data: String.format(sj_coin_balance_format, address)
    }).then(x => {
    	parent.setState({balance: parseInt(x, 16)});
    });
  } catch(error) {
  	alert(error);
    console.error(error);
  }
}

/*
 * tcpdump -s 0 -A port 1337
 * WTF? Seriously?
 * https://bugzilla.xamarin.com/show_bug.cgi?id=18278
*/
async function MakeCall(url, method, par): Promise<String> {
  try {
    /* alert(JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: par,
        id: '1'
      })); // */
  	let response = await fetch(url+sj_coin_endpoint_path, 
  	{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: par,
        id: '1'
      })
    });
    let responseJson = await response.json();
    //alert(JSON.stringify(responseJson));
    return method=='erisdb.call' ? responseJson.result.return : responseJson;
  } catch(error) {
    console.error(error);
  }
  return null;
}
