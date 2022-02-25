var Web3 = require('web3');
var Contract = require('web3-eth-contract');
var acts;
var abi = require('./osABI.json');
window.abi = abi
// connect to metamask
const ethEnabled = async () => {
    if (window.ethereum !== undefined) {
        acts = await window.ethereum.request({method: 'eth_requestAccounts'});
        window.defaultAccount = acts[0];
        window.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  }

if (ethEnabled) {
    // get friends
    console.log("we have eth!");
    window.ethereum.request({method: 'eth_requestAccounts'}).then(acts => {
        window.defaultAccount = acts[0];
        Contract.setProvider(window.ethereum);
        window.contract = new Contract(abi, '0x588d72503d71eEfd93C88EE182B6Bcb1DE299136');
    });
    
}

