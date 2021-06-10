import React, { Component } from "react";
//import SimpleStorageContract from "./contracts/SimpleStorage.json";
import SmartContractDondi from "./contracts/SmartContractDondi.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const { REACT_APP_BUILD_MODE } = process.env;
console.log(REACT_APP_BUILD_MODE);

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(web3.eth);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      // const deployedNetwork = SmartContractDondi.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   SmartContractDondi.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );
      //web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/0185d0196cd94344b3131cf939bc9796'));
      
      var abi;
      var instance;

      if (REACT_APP_BUILD_MODE === "development") {
        abi = JSON.parse('[{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"MissedEthReceive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"place","type":"uint8"}],"name":"NewUserPlace","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"uint256","name":"userId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referrerId","type":"uint256"}],"name":"Registration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"currentReferrer","type":"address"},{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"Reinvest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"SentExtraEthDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"Upgrade","type":"event"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"LAST_LEVEL","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint8","name":"matrix","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"buyNewLevel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"findFreeX3Referrer","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"findFreeX6Referrer","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"idToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isUserExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastUserId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"levelPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"referrerAddress","type":"address"}],"name":"registrationExt","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userIds","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"partnersCount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersActiveX3Levels","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersActiveX6Levels","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersX3Matrix","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersX6Matrix","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]');
        instance  = new web3.eth.Contract(abi, '0x78058881774c393D3C8c41739db0748eECF144e0');
      } else if (REACT_APP_BUILD_MODE === "production") {
        abi = JSON.parse('[{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"MissedEthReceive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"place","type":"uint8"}],"name":"NewUserPlace","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"uint256","name":"userId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referrerId","type":"uint256"}],"name":"Registration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"currentReferrer","type":"address"},{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"Reinvest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"SentExtraEthDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint8","name":"matrix","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"Upgrade","type":"event"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"LAST_LEVEL","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint8","name":"matrix","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"buyNewLevel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"findFreeX3Referrer","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"findFreeX6Referrer","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"idToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isUserExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastUserId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"levelPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"referrerAddress","type":"address"}],"name":"registrationExt","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userIds","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"partnersCount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersActiveX3Levels","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersActiveX6Levels","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersX3Matrix","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"usersX6Matrix","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]');
        instance = new web3.eth.Contract(abi, '0x017A7b7E44b5A99De7e56c0c0faB53F6421fAd93');
      }
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    console.log(accounts);
    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    //const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({
      storageValue: accounts
    });
  };

  render() {
    console.log(this.state.accounts);
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
