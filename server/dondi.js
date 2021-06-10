const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require('node-fetch');
const mongoose = require('mongoose');

// web3 add
const Web3 = require("web3");
const cryptoRandomString = require('crypto-random-string');

const app = express();
const port = 5000;

const constants = require("./constant");

var dbname = "";

if (app.get("env") === "development") {
  dbname = "dondi_dev";
} else {
  dbname = "dondi";
}

mongoose.connect("mongodb://localhost:27017/" + dbname, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

// Configuring body parser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

var web3;
var abi;
var SmartContractDondi;
var startBlock;
var apiPrefix;
var contractAddress;

const restApiPref = "/api";

var options = {
  timeout: 30000, //ms

  clientConfig: {
    maxReceivedFrameSize: 100000000,
    maxReceivedMessageSize: 100000000,
  },

  reconnect: {
    auto: true,
    delay: 5000, //ms
    maxAttempts: 5,
    onTimeout: false
  }
};

if (app.get("env") === "development") {

  //Ropsten Test Network
  web3 = new Web3(
    new Web3.providers.WebsocketProvider(constants.DEV_WEB3_WEBSOCKET_PROVIDER, options)
  );

  abi = JSON.parse(constants.DEV_ABI);

  SmartContractDondi = new web3.eth.Contract(
    abi,
    constants.DEV_SMARTCONTRACT_ADDRESS
  );

  startBlock = constants.DEV_CONTRACT_START_BLOCK;
  contractAddress = constants.DEV_SMARTCONTRACT_ADDRESS;
  apiPrefix = "http://api-ropsten.etherscan.io";

} else if (app.get("env") === "production") {
  //Real Network
  web3 = new Web3(
    new Web3.providers.WebsocketProvider(constants.PROD_WEB3_WEBSOCKET_PROVIDER, options)
  );

  abi = JSON.parse(constants.PROD_ABI);

  SmartContractDondi = new web3.eth.Contract(
    abi,
    constants.PROD_SMARTCONTRACT_ADDRESS
  );

  startBlock = constants.PROD_CONTRACT_START_BLOCK;
  contractAddress = constants.PROD_SMARTCONTRACT_ADDRESS;
  apiPrefix = "http://api.etherscan.io";
}

const Schema = mongoose.Schema;
const linkSchema = new Schema({
  id: String,
  uid: String,
  personal_link: String,
  group_link: String,
  custom_link: String,
});

const Link = mongoose.model('Link', linkSchema);


app.get(restApiPref + "/test", (req, res) => {
  SmartContractDondi.getPastEvents("NewUserPlace", {
    filter: {
      referrer: "0x29Ec397e7C6F89a13aA8007ba25adEc88280d34B"
    },
    fromBlock: startBlock,
    toBlock: 'latest'
  }, function (error, events) { console.log(events); })
    .then(function (events) {
      console.log(events);
      res.send({
        express: "Test API Express",
        value: events
      });
    });

  // SmartContractDondi.methods
  //   .LAST_LEVEL()
  //   .call()
  //   .then(function (result) {
  //     res.send({
  //       express: "Test API Express",
  //       lastLevel: result,
  //     });
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //     lastLevel = -1;
  //     res.send({
  //       express: "Test API Express",
  //       lastLevel: error,
  //     });
  //   });
});

app.get("/", (req, res) => {
  res.send("Welcome Dondi from express");
});

/**
 * Requests a registration information, returning transaction status
 *
 * @param {ether} payableAmount        Ethereum amount (0.05)
 * @param {address} referrerAddress    Referrer's user address
 * @param {address} fromAddress        Register user's ethereum account address
 * @param {Hex} privateKey             Private key (only test mode available)
 *
 * @return {transaction}               transaction status of registeration
 */
app.post(restApiPref + "/registrationext", (req, res) => {
  var payableAmount = req.body.payableAmount;
  var referrerAddress = req.body.referrerAddress;
  var fromAddress = req.body.fromAddress;
  var privateKey = req.body.privateKey;

  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  SmartContractDondi.methods
    .registrationExt(referrerAddress)
    .send({
      from: fromAddress,
      value: web3.utils.toWei(payableAmount, "ether"),
      gas: 3000000,
    })
    .then(function (receipt) {
      console.log(receipt);
      res.send({
        code: "200",
        text: "Success",
        value: receipt,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a buylevel of x3/x6 matrix, returning transaction status
 *
 * @param {ether} payableAmount        Ethereum amount
 * @param {uint8} matrix               1: x3 matrix    2: x6 matrix
 * @param {uint8} level                matrix level
 * @param {address} fromAddress        user's ethereum account address
 * @param {Hex} privateKey             Private key (only test mode available)
 *
 * @return {transaction}               transaction status of buynewlevel
 */
app.post(restApiPref + "/buynewlevel", (req, res) => {
  var payableAmount = req.body.payableAmount;
  var matrix = req.body.matrix;
  var level = req.body.level;
  var fromAddress = req.body.fromAddress;
  var privateKey = req.body.privateKey;

  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  SmartContractDondi.methods
    .buyNewLevel(matrix, level)
    .send({
      from: fromAddress,
      value: web3.utils.toWei(payableAmount, "ether"),
      gas: 3000000,
    })
    .then(function (receipt) {
      console.log(receipt);
      res.send({
        code: "200",
        text: "Success",
        value: receipt,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * No requests, returning last level of the matrix
 *
 * @return {uint8}         The response last level number of matrix
 */
app.get(restApiPref + "/getlastlevel", (req, res) => {
  SmartContractDondi.methods
    .LAST_LEVEL()
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the Last Level successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address, returning user balance
 *
 * @param {address} address        The address of ethereum user account
 *
 * @return {uint256}               The response user data
 */
app.get(restApiPref + "/getbalances", (req, res) => {
  var address = req.query.address;

  SmartContractDondi.methods
    .balances(address)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get balances successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and level of x3 matrix, returning user address of referrer
 *
 * @param {address} address        The address of ethereum user account
 * @param {unit8}   level          The level of x3 matirx
 *
 * @return {address}               The response user address of referrer
 */
app.get(restApiPref + "/findfreex3referrer", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .findFreeX3Referrer(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Find the free X3 referrer address successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and level of x6 matrix, returning user address of referrer
 *
 * @param {address} address        The address of ethereum user account
 * @param {unit8}   level          The level of x6 matirx
 *
 * @return {address}               The response user address of referrer
 */
app.get(restApiPref + "/findfreex6referrer", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .findFreeX6Referrer(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Find the free X6 referrer address successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user id, returning user address of this id
 *
 * @param {uint256} id        The user id of dondi
 *
 * @return {address}          The response user address of the user id
 */
app.get(restApiPref + "/idtoaddress", (req, res) => {
  var id = req.query.id;

  SmartContractDondi.methods
    .idToAddress(id)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the address from id successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address, returning is user exists(true of false)
 *
 * @param {address} address      The user address
 *
 * @return {bool}                User existing status
 */
app.get(restApiPref + "/isuserexists", (req, res) => {
  var address = req.query.address;

  SmartContractDondi.methods
    .isUserExists(address)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the user existing status successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * No requests, returning available user id to create
 *
 * @return {uint256}                Last available user id to create
 */
app.get(restApiPref + "/lastuserid", (req, res) => {
  SmartContractDondi.methods
    .lastUserId()
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the last user id successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a level of matrix, returning the price of matrix level
 *
 * @param {uint8} level             The level of matrix
 *
 * @return {uint256}                The price of matrix level price (wei)
 */
app.get(restApiPref + "/levelprice", (req, res) => {
  var level = req.query.level;

  SmartContractDondi.methods
    .levelPrice(level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the current level price successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * No requests, returning the owner address (same as id 1)
 *
 * @return {address}                Owner address
 */
app.get(restApiPref + "/owneraddress", (req, res) => {
  SmartContractDondi.methods
    .owner()
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get owner address successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user id, returning user address of this id
 *
 * @param {uint256} id        The user id of dondi
 *
 * @return {address}          The response user address of the user id
 */
app.get(restApiPref + "/userids", (req, res) => {
  var id = req.query.id;

  SmartContractDondi.methods
    .userIds(id)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the address from id successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address, returning user object
 *
 * @param {address} address         The user address
 *
 * @return {object}                 The response user objects {id uint256, referrer address, partnersCount uint256}
 */
app.get(restApiPref + "/users", (req, res) => {
  var address = req.query.address;

  SmartContractDondi.methods
    .users(address)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the user information successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and x3level, returning user's active level status (tru or false)
 *
 * @param {address} address         The user address
 * @param {uint8} level             x3 level number
 *
 * @return {bool}                   The response level is active or not (true/false)
 */
app.get(restApiPref + "/useractivex3levels", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .usersActiveX3Levels(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the user active X3 levels successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and x6level, returning user's active level status (tru or false)
 *
 * @param {address} address         The user address
 * @param {uint8} level             x6 level number
 *
 * @return {bool}                   The response level is active or not (true/false)
 */
app.get(restApiPref + "/useractivex6levels", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .usersActiveX6Levels(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the user active X6 levels successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and x3level, returning user's matrix of this level
 *
 * @param {address} address         The user address
 * @param {uint8} level             x3 level number
 *
 * @return {object}                 The response x3 matrix of this user's level
 */
app.get(restApiPref + "/getx3matrix", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .usersX3Matrix(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the X3 matrix successfully",
        value: result,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

/**
 * Requests a user address and x6level, returning user's matrix of this level
 *
 * @param {address} address         The user address
 * @param {uint8} level             x6 level number
 *
 * @return {object}                 The response x6 matrix of this user's level
 */
app.get(restApiPref + "/getx6matrix", (req, res) => {
  var address = req.query.address;
  var level = req.query.level;

  SmartContractDondi.methods
    .usersX6Matrix(address, level)
    .call()
    .then(function (result) {
      console.log(result);
      res.send({
        code: "200",
        text: "Get the X6 matrix successfully",
        value: result,
      });
    })
    .catch(function (error) {
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

app.get(restApiPref + "/getreinvestpartnerscnt", (req, res) => {
  var address = req.query.address;
  var matrix = req.query.matrix;
  var level = req.query.level;

// function getReinvestPartnersCountFromAddress(address, matrix, level) {
  var retValue = {
    partners: [],
    partnersCount: 0,
    reinvestCount: 0
  };

  SmartContractDondi.getPastEvents("Reinvest", {
      filter: {
        user: address
      },
      fromBlock: startBlock,
      toBlock: 'latest'
    }, function (error, events) {
      // console.log(events);
    })
    .then(function (events) {
      events.forEach((item) => {
        if (item.returnValues.matrix == matrix && item.returnValues.level == level) {
          retValue.reinvestCount++;
        }
      });

      SmartContractDondi.getPastEvents("NewUserPlace", {
        filter: {
          referrer: address
        },
        fromBlock: startBlock,
        toBlock: 'latest'
      }, function (error, events) {

      })
      .then(function (events1) {
        var promisesAll = [];
        //events1.forEach((item) => {
        for (let i = 0; i < events1.length; i++) {
          const item = events1[i];
          if (item.returnValues.matrix == matrix && item.returnValues.level == level) {
            const promiseB = new Promise((resolve, reject) => {
              web3.eth.getTransaction(item.transactionHash, function (err, transaction) {
                web3.eth.getBlock(transaction.blockNumber, function (err, block) {

                  SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                    
                    if (item.returnValues.matrix == matrix && userInfo.referrer.toLowerCase() == address.toLowerCase()) {
                      if (retValue.partners.indexOf(item.returnValues.user.toLowerCase()) == -1) {
                        retValue.partners.push(item.returnValues.user.toLowerCase());
                        retValue.partnersCount++;
                      }
                    }
                    resolve(matrix);
                  });

                });
              });
            });
            promisesAll.push(promiseB);
          }
        }

        Promise.all(promisesAll).then(function () {
          res.send({
            code: "200",
            text: "Get the X6 matrix successfully",
            value: retValue,
          });
        });
      });
    });
});

app.get(restApiPref + "/slotdetail", (req, res) => {
  var address = req.query.address;
  var matrix = req.query.matrix;
  var level = req.query.level;

  var retValue = {
    rootInfo: {
      id: "",
      referrer: {
        id: "",
        address: ""
      }
    },
    partners: [],
    partnersInfo: [],
    partnersCount: 0,
    reinvestCount: 0,
    balance: 0,
    history: [],
    transactions: {
      totalCount: 0,
      data: []
    }
  };

  SmartContractDondi.methods
    .users(address)
    .call()
    .then(function (result) {
      retValue.rootInfo.id = result.id;

      var lockedState = false;

      const promiseA = new Promise((resolve, reject) => {
        if (matrix == 1) {
          SmartContractDondi.methods
            .usersX3Matrix(address, level)
            .call()
            .then(function (result1) {
              console.log(result1);
              
              retValue.rootInfo.referrer.address = result1[0];
              lockedState = result1[2];
              
              SmartContractDondi.methods
                .users(result1[0])
                .call()
                .then(function (result2) {
                  retValue.rootInfo.referrer.id = result2.id;
                  retValue.history.push({
                    reinvestCount: 0,
                    pos1: {},
                    pos2: {},
                    pos3: {}
                  });
                  resolve(result2);
                });
            });
        } else if (matrix == 2) {
          SmartContractDondi.methods
            .usersX6Matrix(address, level)
            .call()
            .then(function (result1) {
              retValue.rootInfo.referrer.address = result1[0];
              SmartContractDondi.methods
                .users(result1[0])
                .call()
                .then(function (result2) {
                  retValue.rootInfo.referrer.id = result2.id;
                  retValue.history.push({
                    reinvestCount: 0,
                    pos1: {},
                    pos2: {},
                    pos3: {},
                    pos4: {},
                    pos5: {},
                    pos6: {}
                  });
                  resolve(result2);
                });
            });
        }
      });

      promiseA.then(function () {
        SmartContractDondi.getPastEvents("Reinvest", {
            filter: {
              user: address
            },
            fromBlock: startBlock,
            toBlock: 'latest'
          }, function (error, events) {
            // console.log(events);
          })
          .then(function (events) {
            events.forEach((item) => {
              console.log(item);
              
              if (item.returnValues.matrix == matrix && item.returnValues.level == level) {
                retValue.reinvestCount++;
                if (matrix == 1)
                  retValue.history.push({
                    reinvestCount: retValue.reinvestCount,
                    pos1: {},
                    pos2: {},
                    pos3: {}
                  });
                else if (matrix == 2)
                  retValue.history.push({
                    reinvestCount: retValue.reinvestCount,
                    pos1: {},
                    pos2: {},
                    pos3: {},
                    pos4: {},
                    pos5: {},
                    pos6: {}
                  });
              }
            });

            SmartContractDondi.getPastEvents("NewUserPlace", {
                filter: {
                  referrer: address
                },
                fromBlock: startBlock,
                toBlock: 'latest'
              }, function (error, events) {

              })
              .then(function (events1) {
                let currentInvest = 0;
                let currentPos1 = false;
                let currentPos2 = false;
                let currentPos3 = false;
                let currentPos4 = false;
                let currentPos5 = false;
                let currentPos6 = false;

                var promisesAll = [];
                //events1.forEach((item) => {
                for (let i = 0; i < events1.length; i++) {
                  const item = events1[i];
                  if (item.returnValues.matrix == matrix && matrix == 1 && item.returnValues.level == level) {
                    const promiseB = new Promise((resolve, reject) => {
                      web3.eth.getTransactionReceipt(item.transactionHash, function (err, transaction) {
                        let logs = transaction.logs;
                        let stateMiss = false;

                        for (let a = 0; a < logs.length; a++) {
                          console.log(logs[a].topics[0]);
                          if (logs[a].topics[0]=="0xfc0cb63f8dbd6b20ceb84a3c5358a41576a1479e6ecd040b4b985525dc09a709") {
                            stateMiss = true;
                          }
                        }
                        // if (err) {

                        //   return false;
                        // }
                        // if (!transaction) {

                        //   return false;
                        // }
                        //console.log(transaction);
                        web3.eth.getBlock(transaction.blockNumber, function (err, block) {
                          // if (err) {

                          //   return false;
                          // }

                          SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                            retValue.transactions.data.push({
                              type: item.returnValues.place == 3 ? "reinvest" : (stateMiss ? "lost" : "partner"),
                              date: block.timestamp,
                              id: userInfo.id,
                              address: item.returnValues.user,
                              transactionHash: item.transactionHash,
                              eth: 0.025 * Math.pow(2, (level - 1))
                            });

                            if (item.returnValues.place == 1) {
                              retValue.history[currentInvest].pos1.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // console.log(1);
                              // retValue.history[currentInvest].pos1.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos1.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos1 = true;
                            } else if (item.returnValues.place == 2) {
                              retValue.history[currentInvest].pos2.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // console.log(2);
                              // retValue.history[currentInvest].pos2.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos2.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos2 = true;
                            } else if (item.returnValues.place == 3) {
                              retValue.history[currentInvest].pos3.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // console.log(3);
                              // retValue.history[currentInvest].pos3.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos3.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos3 = true;
                            }

                            if (currentPos1 == true && currentPos2 == true && currentPos3 == true) {
                              currentInvest++;
                              currentPos1 = false;
                              currentPos2 = false;
                              currentPos3 = false;
                            }

                            if (item.returnValues.place < 3)
                              retValue.balance = retValue.balance + 0.025 * Math.pow(2, (level - 1));

                            if (item.returnValues.matrix == matrix && userInfo.referrer.toLowerCase() == address.toLowerCase()) {
                              if (retValue.partners.indexOf(item.returnValues.user.toLowerCase()) == -1) {
                                retValue.partners.push(item.returnValues.user.toLowerCase());
                                retValue.partnersCount++;
                              }
                            }
                            resolve(matrix);
                          });

                        });
                      });
                    });
                    promisesAll.push(promiseB);
                  } else if (item.returnValues.matrix == matrix && matrix == 2 && item.returnValues.level == level) {
                    const promiseB = new Promise((resolve, reject) => {
                      web3.eth.getTransactionReceipt(item.transactionHash, function (err, transaction) {
                        let logs = transaction.logs;
                        let stateMiss = false;

                        for (let a = 0; a < logs.length; a++) {
                          console.log(logs[a].topics[0]);
                          if (logs[a].topics[0]=="0xfc0cb63f8dbd6b20ceb84a3c5358a41576a1479e6ecd040b4b985525dc09a709") {
                            stateMiss = true;
                          }
                        }
                        // if (err) {

                        //   return false;
                        // }
                        // if (!transaction) {

                        //   return false;
                        // }
                        //console.log(transaction);
                        web3.eth.getBlock(transaction.blockNumber, function (err, block) {
                          // if (err) {

                          //   return false;
                          // }
                          SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                            retValue.transactions.data.push({
                              type: item.returnValues.place == 6 ? "reinvest" : "partner",
                              date: block.timestamp,
                              id: userInfo.id,
                              address: item.returnValues.user,
                              transactionHash: item.transactionHash,
                              eth: 0.025 * Math.pow(2, (level - 1))
                            });

                            if (item.returnValues.place == 1) {
                              retValue.history[currentInvest].pos1.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos1.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos1.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos1 = true;
                            } else if (item.returnValues.place == 2) {
                              retValue.history[currentInvest].pos2.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos2.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos2.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos2 = true;
                            } else if (item.returnValues.place == 3) {
                              retValue.history[currentInvest].pos3.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos3.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos3.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos3 = true;
                            } else if (item.returnValues.place == 4) {
                              retValue.history[currentInvest].pos4.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos4.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos4.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos4 = true;
                            } else if (item.returnValues.place == 5) {
                              retValue.history[currentInvest].pos5.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos5.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos5.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos5 = true;
                            } else if (item.returnValues.place == 6) {
                              retValue.history[currentInvest].pos6.address = item.returnValues.user;
                              // let retValPartnerReinvest = getReinvestPartnersCountFromAddress(item.returnValues.user, matrix, level);
                              // retValue.history[currentInvest].pos6.reinvestCount = retValPartnerReinvest.reinvestCount;
                              // retValue.history[currentInvest].pos6.partnersCount = retValPartnerReinvest.partnersCount;
                              currentPos6 = true;
                            }

                            if (currentPos1 == true && currentPos2 == true && currentPos3 == true && currentPos4 == true && currentPos5 == true && currentPos6 == true) {
                              currentInvest++;
                              currentPos1 = false;
                              currentPos2 = false;
                              currentPos3 = false;
                              currentPos4 = false;
                              currentPos5 = false;
                              currentPos6 = false;
                            }

                            if (item.returnValues.place > 2 && item.returnValues.place < 6)
                              retValue.balance = retValue.balance + 0.025 * Math.pow(2, (level - 1));

                            if (item.returnValues.matrix == matrix && userInfo.referrer.toLowerCase() == address.toLowerCase()) {
                              if (retValue.partners.indexOf(item.returnValues.user.toLowerCase()) == -1) {
                                retValue.partners.push(item.returnValues.user.toLowerCase());
                                retValue.partnersCount++;
                              }
                            }
                            resolve(matrix);
                          });

                        });
                      });
                    });

                    promisesAll.push(promiseB);
                  }
                }

                Promise.all(promisesAll).then(function () {
                  retValue.balance = retValue.balance.toFixed(3);
                  retValue.transactions.totalCount = retValue.transactions.data.length;

                  res.send({
                    code: "200",
                    text: "Get the slot details successfully",
                    value: retValue
                  });
                });

              });


          });
      });
    });
});

app.get(restApiPref + "/profile", (req, res) => {
  var address = req.query.address;

  let profile = {
    id: '',
    address: address,
    referrerAddress: '',
    partnersCount: '',
    x3Balance: 0,
    x6Balance: 0,
    affiliateLink: "",
    x3Matrix: {},
    x6Matrix: {},
    activeX3Levels: {},
    activeX6Levels: {},
  };

  let slotStatus = 
  SmartContractDondi.methods
    .users(address)
    .call()
    .then(function (result) {
      profile.id = result.id;
      console.log(profile.id);
      Link.findOne({
        uid: result.id
      }, (err, data) => {
        if (err) {
          
        } else {
          console.log(data);
          profile.affiliateLink = data.personal_link;
        }
      });

      profile.referrerAddress = result.referrer;
      profile.partnersCount = result.partnersCount;

      var promises1 = [];

      for (let i = 1; i <= 12; i++) {
        const promiseA = new Promise((resolve, reject) => {
          SmartContractDondi.methods
            .usersActiveX3Levels(address, i)
            .call()
            .then(function (result3) {
              profile.activeX3Levels["lv" + i] = result3;
              resolve(result3);
            });
        });

        promises1.push(promiseA);
      }

      var promises2 = [];
      Promise.all(promises1).then(function () {
        for (let i = 1; i <= 12; i++) {
          const promiseB = new Promise((resolve, reject) => {

            SmartContractDondi.methods
              .usersActiveX6Levels(address, i)
              .call()
              .then(function (result4) {
                profile.activeX6Levels["lv" + i] = result4;
                resolve(result4);
              });
          });

          promises2.push(promiseB);
        }

        var promises3 = [];
        Promise.all(promises2).then(function () {
          for (let i = 1; i <= 12; i++) {
            //if (profile.activeX3Levels["lv" + i] === true) {
            const promiseC = new Promise((resolve, reject) => {

              SmartContractDondi.methods
                .usersX3Matrix(address, i)
                .call()
                .then(function (result1) {
                  profile.x3Matrix["lv" + i] = result1;
                  profile.x3Matrix["lv" + i].slotNumber = i;
                  profile.x3Matrix["lv" + i].slotStatus = {status: false, text: ""};
                  if (result1[2] == true) {
                    profile.x3Matrix["lv" + i].slotStatus = {status: true, text: "You need to buy the " + parseInt(i+1) + " slot."};
                  }

                  if (i == 1)
                    profile.x3Matrix["lv" + i].slotBuyPrice = 0.025;
                  else {
                    const j = i - 1;
                    profile.x3Matrix["lv" + i].slotBuyPrice = profile.x3Matrix["lv" + j].slotBuyPrice * 2;
                  }
                  if (profile.activeX3Levels["lv" + i] === true) {
                    profile.x3Matrix["lv" + i].referrerAddress = profile.x3Matrix["lv" + i][0];
                  } else {
                    profile.x3Matrix["lv" + i].referrerAddress = profile.referrerAddress;
                  }

                  profile.x3Matrix["lv" + i].isActive = profile.activeX3Levels["lv" + i];
                  //profile.x3Matrix["lv" + i].childItems = profile.x3Matrix["lv" + i][1];
                  //console.log(profile.x3Matrix["lv" + i][1][0], profile.x3Matrix["lv" + i][1][1], profile.x3Matrix["lv" + i][1][2]);

                  // temporary fix the status

                  profile.x3Matrix["lv" + i].childItems = [{
                      id: "",
                      address: profile.x3Matrix["lv" + i][1][0] === undefined ? "" : profile.x3Matrix["lv" + i][1][0],
                      status: ""
                    },
                    {
                      id: "",
                      address: profile.x3Matrix["lv" + i][1][1] === undefined ? "" : profile.x3Matrix["lv" + i][1][1],
                      status: ""
                    },
                    {
                      id: "",
                      address: profile.x3Matrix["lv" + i][1][2] === undefined ? "" : profile.x3Matrix["lv" + i][1][2],
                      status: ""
                    }
                  ];

                  if (profile.x3Matrix["lv" + i][1][0] !== undefined) {
                    SmartContractDondi.methods
                      .users(profile.x3Matrix["lv" + i][1][0])
                      .call()
                      .then(function (rest0) {
                        console.log("rest", rest0);
                        profile.x3Matrix["lv" + i].childItems[0].id = rest0.id;
                        console.log(rest0.referrer, profile.address);
                        if (rest0.referrer.toLowerCase() != profile.address.toLowerCase())
                          profile.x3Matrix["lv" + i].childItems[0].status = constants.PARTNER_AHEAD_OF_HIS_INVITER;
                        else
                          profile.x3Matrix["lv" + i].childItems[0].status = constants.PARTNER_INVITED_BY_YOU;
                      });
                  }

                  if (profile.x3Matrix["lv" + i][1][1] !== undefined) {
                    SmartContractDondi.methods
                      .users(profile.x3Matrix["lv" + i][1][1])
                      .call()
                      .then(function (rest1) {
                        console.log("rest", rest1);
                        profile.x3Matrix["lv" + i].childItems[1].id = rest1.id;
                        console.log(rest1.referrer, profile.address);
                        if (rest1.referrer.toLowerCase() != profile.address.toLowerCase())
                          profile.x3Matrix["lv" + i].childItems[1].status = constants.PARTNER_AHEAD_OF_HIS_INVITER;
                        else
                          profile.x3Matrix["lv" + i].childItems[1].status = constants.PARTNER_INVITED_BY_YOU;
                      });
                  }

                  if (profile.x3Matrix["lv" + i][1][2] !== undefined) {
                    SmartContractDondi.methods
                      .users(profile.x3Matrix["lv" + i][1][2])
                      .call()
                      .then(function (rest2) {
                        console.log("rest", rest2);
                        profile.x3Matrix["lv" + i].childItems[2].id = rest2.id;
                        console.log(rest2.referrer, profile.address);
                        if (rest2.referrer.toLowerCase() != profile.address.toLowerCase())
                          profile.x3Matrix["lv" + i].childItems[2].status = constants.PARTNER_AHEAD_OF_HIS_INVITER;
                        else
                          profile.x3Matrix["lv" + i].childItems[2].status = constants.PARTNER_INVITED_BY_YOU;
                      });
                  }

                  if (i == 1) {
                    profile.x3Matrix["lv" + i].partners = [];
                    profile.x3Matrix["lv" + i].partnersCount = profile.partnersCount;
                  } else {
                    profile.x3Matrix["lv" + i].partners = [];
                    profile.x3Matrix["lv" + i].partnersCount = 0;
                  }

                  profile.x3Matrix["lv" + i].reinvestCount = 0;
                  profile.x3Matrix["lv" + i].missedAmount = 0;
                  profile.x3Matrix["lv" + i].profitAmount = 0;

                  if (i == 1) {
                    const prevId = 12;
                    const nextId = i + 1;
                    profile.x3Matrix["lv" + i].prevSlot = "lv" + prevId;
                    profile.x3Matrix["lv" + i].nextSlot = "lv" + nextId;
                  } else if (i > 1 && i < 12) {
                    const prevId = i - 1;
                    const nextId = i + 1;
                    profile.x3Matrix["lv" + i].prevSlot = "lv" + prevId;
                    profile.x3Matrix["lv" + i].nextSlot = "lv" + nextId;
                  } else if (i == 12) {
                    const prevId = i - 1;
                    const nextId = 1;
                    profile.x3Matrix["lv" + i].prevSlot = "lv" + prevId;
                    profile.x3Matrix["lv" + i].nextSlot = "lv" + nextId;
                  }

                  resolve(result1);
                });
            });

            promises3.push(promiseC);
            //}
          }

          var promises4 = [];
          Promise.all(promises3).then(function () {
            for (let i = 1; i <= 12; i++) {
              //if (profile.activeX6Levels["lv" + i] === true) {
              const promiseD = new Promise((resolve, reject) => {

                SmartContractDondi.methods
                  .usersX6Matrix(address, i)
                  .call()
                  .then(function (result2) {
                    profile.x6Matrix["lv" + i] = result2;
                    profile.x6Matrix["lv" + i].slotNumber = i;
                    profile.x6Matrix["lv" + i].slotStatus = {status: false, text: ""};
                    if (result2[2] == true) {
                      profile.x6Matrix["lv" + i].slotStatus = {status: true, text: "You need to buy the " + parseInt(i+1) + " slot."};
                    }

                    if (i == 1)
                      profile.x6Matrix["lv" + i].slotBuyPrice = 0.025;
                    else {
                      const j = i - 1;
                      profile.x6Matrix["lv" + i].slotBuyPrice = profile.x6Matrix["lv" + j].slotBuyPrice * 2;
                    }
                    if (profile.x6Matrix["lv" + i] === true) {
                      profile.x6Matrix["lv" + i].referrerAddress = profile.x6Matrix["lv" + i][0];
                    } else {
                      profile.x6Matrix["lv" + i].referrerAddress = profile.referrerAddress;
                    }

                    profile.x6Matrix["lv" + i].isActive = profile.activeX6Levels["lv" + i];
                    profile.x6Matrix["lv" + i].childItems = {
                      left: [{
                          id: "",
                          address: profile.x6Matrix["lv" + i][1][0] === undefined ? "" : profile.x6Matrix["lv" + i][1][0],
                          status: ""
                        },
                        {
                          id: "",
                          address: profile.x6Matrix["lv" + i][2][0] === undefined ? "" : profile.x6Matrix["lv" + i][2][0],
                          status: ""
                        },
                        {
                          id: "",
                          address: profile.x6Matrix["lv" + i][2][2] === undefined ? "" : profile.x6Matrix["lv" + i][2][2],
                          status: ""
                        }
                      ],
                      right: [{
                          id: "",
                          address: profile.x6Matrix["lv" + i][1][1] === undefined ? "" : profile.x6Matrix["lv" + i][1][1],
                          status: ""
                        },
                        {
                          id: "",
                          address: profile.x6Matrix["lv" + i][2][1] === undefined ? "" : profile.x6Matrix["lv" + i][2][1],
                          status: ""
                        },
                        {
                          id: "",
                          address: profile.x6Matrix["lv" + i][2][3] === undefined ? "" : profile.x6Matrix["lv" + i][2][3],
                          status: ""
                        }
                      ]
                    };

                    if (profile.x6Matrix["lv" + i][1][0] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][1][0])
                        .call()
                        .then(function (rest0) {
                          profile.x6Matrix["lv" + i].childItems.left[0].id = rest0.id;

                          if (rest0.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.left[0].status = constants.PARTNER_INVITED_BY_YOU;
                          else if (rest0.referrer.toLowerCase() == profile.x6Matrix["lv" + i].referrerAddress.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.left[0].status = constants.OVERFLOW_FROM_UP;
                          else
                            profile.x6Matrix["lv" + i].childItems.left[0].status = constants.PARTNER_AHEAD_OF_HIS_INVITER;
                        });
                    }

                    if (profile.x6Matrix["lv" + i][1][1] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][1][1])
                        .call()
                        .then(function (rest1) {
                          profile.x6Matrix["lv" + i].childItems.right[0].id = rest1.id;

                          if (rest1.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.right[0].status = constants.PARTNER_INVITED_BY_YOU;
                          else if (rest1.referrer.toLowerCase() == profile.x6Matrix["lv" + i].referrerAddress.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.right[0].status = constants.OVERFLOW_FROM_UP;
                          else
                            profile.x6Matrix["lv" + i].childItems.right[0].status = constants.PARTNER_AHEAD_OF_HIS_INVITER;
                        });
                    }

                    if (profile.x6Matrix["lv" + i][2][0] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][2][0])
                        .call()
                        .then(function (rest2) {
                          profile.x6Matrix["lv" + i].childItems.left[1].id = rest2.id;

                          if (rest2.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.left[1].status = constants.PARTNER_INVITED_BY_YOU;
                          else
                            profile.x6Matrix["lv" + i].childItems.left[1].status = constants.BOTTOM_OVERFLOW;
                        });
                    }

                    if (profile.x6Matrix["lv" + i][2][1] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][2][1])
                        .call()
                        .then(function (rest3) {
                          profile.x6Matrix["lv" + i].childItems.right[1].id = rest3.id;

                          if (rest3.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.right[1].status = constants.PARTNER_INVITED_BY_YOU;
                          else
                            profile.x6Matrix["lv" + i].childItems.right[1].status = constants.BOTTOM_OVERFLOW;
                        });
                    }

                    if (profile.x6Matrix["lv" + i][2][2] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][2][2])
                        .call()
                        .then(function (rest4) {
                          profile.x6Matrix["lv" + i].childItems.left[2].id = rest4.id;

                          if (rest4.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.left[2].status = constants.PARTNER_INVITED_BY_YOU;
                          else
                            profile.x6Matrix["lv" + i].childItems.left[2].status = constants.BOTTOM_OVERFLOW;
                        });
                    }

                    if (profile.x6Matrix["lv" + i][2][3] !== undefined) {
                      SmartContractDondi.methods
                        .users(profile.x6Matrix["lv" + i][2][3])
                        .call()
                        .then(function (rest5) {
                          profile.x6Matrix["lv" + i].childItems.right[2].id = rest5.id;

                          if (rest5.referrer.toLowerCase() == profile.address.toLowerCase())
                            profile.x6Matrix["lv" + i].childItems.right[2].status = constants.PARTNER_INVITED_BY_YOU;
                          else
                            profile.x6Matrix["lv" + i].childItems.right[2].status = constants.BOTTOM_OVERFLOW;
                        });
                    }

                    if (i == 1) {
                      profile.x6Matrix["lv" + i].partners = [];
                      profile.x6Matrix["lv" + i].partnersCount = profile.partnersCount;
                    } else {
                      profile.x6Matrix["lv" + i].partners = [];
                      profile.x6Matrix["lv" + i].partnersCount = 0;
                    }
                    profile.x6Matrix["lv" + i].reinvestCount = 0;
                    profile.x6Matrix["lv" + i].missedAmount = 0;
                    profile.x6Matrix["lv" + i].profitAmount = 0;

                    if (i == 1) {
                      const prevId = 12;
                      const nextId = i + 1;

                      profile.x6Matrix["lv" + i].prevSlot = "lv" + prevId;
                      profile.x6Matrix["lv" + i].nextSlot = "lv" + nextId;
                    } else if (i > 1 && i < 12) {
                      const prevId = i - 1;
                      const nextId = i + 1;

                      profile.x6Matrix["lv" + i].prevSlot = "lv" + prevId;
                      profile.x6Matrix["lv" + i].nextSlot = "lv" + nextId;
                    } else if (i == 12) {
                      const prevId = i - 1;
                      const nextId = 1;

                      profile.x6Matrix["lv" + i].prevSlot = "lv" + prevId;
                      profile.x6Matrix["lv" + i].nextSlot = "lv" + nextId;
                    }

                    resolve(result2);
                  });
              });

              promises4.push(promiseD);
              //}
            }

            Promise.all(promises4).then(function () {
              SmartContractDondi.getPastEvents("Reinvest", {
                  filter: {
                    user: address
                  },
                  fromBlock: startBlock,
                  toBlock: 'latest'
                }, function (error, events) {
                  // console.log(events);
                })
                .then(function (events2) {
                  events2.forEach((item) => {
                    // console.log(item.returnValues.userId);
                    if (item.returnValues.matrix == 1) {
                      profile.x3Matrix["lv" + item.returnValues.level].reinvestCount++;
                    } else if (item.returnValues.matrix == 2) {
                      profile.x6Matrix["lv" + item.returnValues.level].reinvestCount++;
                    }
                  });

                  SmartContractDondi.getPastEvents("NewUserPlace", {
                      filter: {
                        referrer: address
                      },
                      fromBlock: startBlock,
                      toBlock: 'latest'
                    }, function (error, events) {

                    })
                    .then(function (events3) {
                      events3.forEach((item) => {

                        SmartContractDondi.methods
                          .users(item.returnValues.user)
                          .call()
                          .then(function (rett) {
                            if (item.returnValues.matrix == 1 && rett.referrer.toLowerCase() == profile.address.toLowerCase()) {
                              console.log(rett.referrer);
                              if (profile.x3Matrix["lv" + item.returnValues.level].partners.indexOf(item.returnValues.user.toLowerCase()) == -1) {
                                profile.x3Matrix["lv" + item.returnValues.level].partners.push(item.returnValues.user.toLowerCase());
                                if (item.returnValues.level > 1)
                                  profile.x3Matrix["lv" + item.returnValues.level].partnersCount++;
                              }
                              // profile.x3Matrix["lv" + item.returnValues.level].partnersCount++;
                            } else if (item.returnValues.matrix == 2 && rett.referrer.toLowerCase() == profile.address.toLowerCase()) {
                              if (profile.x6Matrix["lv" + item.returnValues.level].partners.indexOf(item.returnValues.user.toLowerCase()) == -1) {
                                profile.x6Matrix["lv" + item.returnValues.level].partners.push(item.returnValues.user.toLowerCase());
                                if (item.returnValues.level > 1)
                                  profile.x6Matrix["lv" + item.returnValues.level].partnersCount++;
                              }
                              // profile.x6Matrix["lv" + item.returnValues.level].partnersCount++;
                            }

                            if (item.returnValues.matrix == 1 && item.returnValues.place < 3) {
                              profile.x3Balance = profile.x3Balance + profile.x3Matrix["lv" + item.returnValues.level].slotBuyPrice;
                            } else if (item.returnValues.matrix == 2 && item.returnValues.place > 2 && item.returnValues.place < 6) {
                              profile.x6Balance = profile.x6Balance + profile.x6Matrix["lv" + item.returnValues.level].slotBuyPrice;
                            }

                          });
                      });

                      SmartContractDondi.getPastEvents("SentExtraEthDividends", {
                          filter: {
                            receiver: address
                          },
                          fromBlock: startBlock,
                          toBlock: 'latest'
                        }, function (error, events) {

                        })
                        .then(function (events4) {
                          events4.forEach((item) => {
                            if (item.returnValues.matrix == 1) {

                              profile.x3Balance = profile.x3Balance + profile.x3Matrix["lv" + item.returnValues.level].slotBuyPrice;
                              profile.x3Matrix["lv" + item.returnValues.level].profitAmount = profile.x3Matrix["lv" + item.returnValues.level].profitAmount + profile.x3Matrix["lv" + item.returnValues.level].slotBuyPrice;
                            } else if (item.returnValues.matrix == 2) {
                              profile.x6Balance = profile.x6Balance + profile.x6Matrix["lv" + item.returnValues.level].slotBuyPrice;
                              profile.x6Matrix["lv" + item.returnValues.level].profitAmount = profile.x6Matrix["lv" + item.returnValues.level].profitAmount + profile.x6Matrix["lv" + item.returnValues.level].slotBuyPrice;
                            }
                          });

                          SmartContractDondi.getPastEvents("MissedEthReceive", {
                            filter: {
                              receiver: address
                            },
                            fromBlock: startBlock,
                            toBlock: 'latest'
                          }, function (error, events) {

                          })
                          .then(function (events5) {

                            events5.forEach((item) => {
                              if (item.returnValues.matrix == 1) {
  
                                //profile.x3Balance = profile.x3Balance - profile.x3Matrix["lv" + item.returnValues.level].slotBuyPrice;
                                profile.x3Matrix["lv" + item.returnValues.level].missedAmount = profile.x3Matrix["lv" + item.returnValues.level].missedAmount + profile.x3Matrix["lv" + item.returnValues.level].slotBuyPrice;
                              } else if (item.returnValues.matrix == 2) {
                                //profile.x6Balance = profile.x6Balance - profile.x6Matrix["lv" + item.returnValues.level].slotBuyPrice;
                                profile.x6Matrix["lv" + item.returnValues.level].missedAmount = profile.x6Matrix["lv" + item.returnValues.level].missedAmount + profile.x6Matrix["lv" + item.returnValues.level].slotBuyPrice;
                              }
                            });

                            // for (let j=1; j<=12; j++) {
                            //   for (let i=0; i<profile.x3Matrix["lv1"].partners.length; i++) {
                            //     if (profile.x3Matrix["lv" + j].isActive == false) {
                            //       SmartContractDondi.methods
                            //       .usersActiveX3Levels(profile.x3Matrix["lv1"].partners[i], j)
                            //       .call()
                            //       .then(function (result3) {
                            //         if (result3 == true) {
                            //           profile.x3Matrix["lv" + j].slotStatus = {status: true, text: "Your partner is ahead of you on this site."};
                            //           break;
                            //         }
                            //       });
                            //     }  
                            //   }

                            //   for (let k=0; k<profile.x6Matrix["lv1"].partners.length; k++) {
                            //     if (profile.x6Matrix["lv" + j].isActive == false) {
                            //       SmartContractDondi.methods
                            //       .usersActiveX6Levels(profile.x6Matrix["lv1"].partners[k], j)
                            //       .call()
                            //       .then(function (result3) {
                            //         if (result3 == true) {
                            //           profile.x6Matrix["lv" + j].slotStatus = {status: true, text: "Your partner is ahead of you on this site."};
                            //           break;
                            //         }
                            //       });
                            //     }  
                            //   }
                            // }

                            profile.x3Balance = profile.x3Balance.toFixed(3);
                            profile.x6Balance = profile.x6Balance.toFixed(3);

                            res.send({
                              code: "200",
                              text: "Get the User profile information successfully",
                              value: profile
                            });
                          });
                        });
                    });
                });
            });
          });
        });
      });
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

app.get(restApiPref + '/dondiinfo', (req, res) => {
  let retData = {
    totalParticipants: 0,
    joinedInDay: 0,
    earnedAmount: 0,
    earnedAmountInToday: 0
  }

  var currentDate = new Date();
  var timestamp = currentDate.getTime();

  web3.eth.getBlockNumber().then(
    (result) => {
      let apiLink = apiPrefix + "/api?module=account&action=txlist&address=" + contractAddress + "&startblock=" + startBlock + "&endblock=latest&sort=desc&apikey=" + constants.API_KEY;

      fetch(apiLink)
        .then(response => response.json())
        .then(data => {

          data.result.forEach((item) => {
            if (item.isError == 0 && item.value > 0) {
              console.log(item);
              retData.earnedAmount += item.value / 1000000000000000000;

              //param.toString().indexOf("0x", 0) === -1
              if (item.input.indexOf(constants.REGISTER_METHOD, 0) >= 0) {
                retData.totalParticipants++;

                if (timestamp - parseInt(item.timeStamp) * 1000 <= constants.ONE_DAY_TIMESTAMP) {
                  retData.joinedInDay++;
                  retData.earnedAmountInToday += item.value / 1000000000000000000;
                }
              }
            }
          });

          retData.earnedAmount = retData.earnedAmount.toFixed(3);
          retData.earnedAmountInToday = retData.earnedAmountInToday.toFixed(3);
          
          res.send({
            code: "200",
            text: "Get the dondi information successfully",
            value: retData
          });
        })
        .catch(function (error) {
          res.send({
            code: "503",
            text: "Failed getting data",
            value: retData
          });
        });
    }
  )
    .catch(function (error) {
      console.log(error);
      res.send({
        code: "503",
        text: "Service Unavailable",
        value: error,
      });
    });
});

app.get(restApiPref + '/statistics', (req, res) => {
  var address = req.query.address;
  var matrix = req.query.matrix;
  var level = req.query.level;
  var direction = req.query.direction;
  var type = req.query.type;
  var tx = req.query.tx;
  var page = req.query.page;
  const cntPerPage = 50;

  if (address == undefined || address == "")
    res.send({
      code: "503",
      text: "address required",
      value: {}
    });

  if (matrix == undefined)
    matrix = "";

  if (level == undefined)
    level = "";

  if (direction == undefined)
    direction = "";

  if (type == undefined)
    type = "";

  if (page == undefined)
    page = 1;

  if (tx == undefined)
    tx = "";

  var soldPlacesLst = [];
  var upgradesLst = [];
  var reopenLst = [];
  var missedProfitLst = [];
  var overtakingLst = [];
  var gitLst = [];

  var retData = [];

  SmartContractDondi.getPastEvents("NewUserPlace", {
      filter: {
        referrer: address,
      },
      fromBlock: startBlock,
      toBlock: 'latest'
    }, function (err, events) {

    })
    .then(function (events) {
      var promises1 = [];
      for (let i = 0; i < events.length; i++) {
        const item = events[i];
        //const promiseA = new Promise((resolve, reject) => {
          web3.eth.getTransaction(item.transactionHash, function (err, transaction) {

            web3.eth.getBlock(transaction.blockNumber, function (err, block) {

              SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                if (item.returnValues.matrix == 2 && item.returnValues.place <= 2)
                  retData.push({
                    type: "Transit [Sold places]",
                    method: "income",
                    id: userInfo.id,
                    timestamp: block.timestamp,
                    matrix: item.returnValues.matrix,
                    level: item.returnValues.level,
                    eth: 0.025 * Math.pow(2, item.returnValues.level - 1),
                    transactionHash: item.transactionHash
                  });
                else if ((item.returnValues.matrix == 2 && item.returnValues.place > 2 && item.returnValues.place < 6) || (item.returnValues.matrix == 1 && item.returnValues.place < 3))
                  retData.push({
                    type: "Part [Sold places]",
                    method: "income",
                    id: userInfo.id,
                    timestamp: block.timestamp,
                    matrix: item.returnValues.matrix,
                    level: item.returnValues.level,
                    eth: 0.025 * Math.pow(2, item.returnValues.level - 1),
                    transactionHash: item.transactionHash
                  });

                //resolve(1);
              });
            });
          });
        //});

        //promises1.push(promiseA);
      }

      Promise.all(promises1).then(() => {
          SmartContractDondi.getPastEvents("Upgrade", {
            filter: {
              user: address,
            },
            fromBlock: startBlock,
            toBlock: 'latest'
          }, function (err, events2) {

          })
          .then(function (events2) {
            var promises3 = [];
            for (let i = 0; i < events2.length; i++) {
              const item = events2[i];
              const promiseC = new Promise((resolve, reject) => {
                web3.eth.getTransaction(item.transactionHash, function (err, transaction) {
                  web3.eth.getBlock(transaction.blockNumber, function (err, block) {
                    SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                      retData.push({
                        type: "Outbound [Upgrades]",
                        method: "outcome",
                        id: userInfo.id,
                        timestamp: block.timestamp,
                        matrix: item.returnValues.matrix,
                        level: item.returnValues.level,
                        eth: -0.025 * Math.pow(2, item.returnValues.level - 1),
                        transactionHash: item.transactionHash
                      });

                      resolve(3);
                    });
                  });
                });
              });

              promises3.push(promiseC);
            }

            Promise.all(promises3).then(() => {

              SmartContractDondi.getPastEvents("Reinvest", {
                  filter: {
                    user: address,
                  },
                  fromBlock: startBlock,
                  toBlock: 'latest'
                }, function (err, events3) {

                })
                .then(function (events3) {

                  var promises4 = [];
                  for (let i = 0; i < events3.length; i++) {
                    const item = events3[i];
                    //const promiseD = new Promise((resolve, reject) => {
                      web3.eth.getTransaction(item.transactionHash, function (err, transaction) {
                        web3.eth.getBlock(transaction.blockNumber, function (err, block) {
                          SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {
                            retData.push({
                              type: "Reopen",
                              method: "outcome",
                              id: userInfo.id,
                              timestamp: block.timestamp,
                              matrix: item.returnValues.matrix,
                              level: item.returnValues.level,
                              eth: -0.025 * Math.pow(2, item.returnValues.level - 1),
                              transactionHash: item.transactionHash
                            });

                            //resolve(4);
                          });
                        });
                      });
                    //});

                    //promises4.push(promiseD);
                  }

                  Promise.all(promises4).then(() => {
                    SmartContractDondi.getPastEvents("SentExtraEthDividends", {
                        filter: {
                          receiver: address,
                        },
                        fromBlock: startBlock,
                        toBlock: 'latest'
                      }, function (err, events4) {

                      })
                      .then(function (events4) {
                        var promises5 = [];

                        for (let i = 0; i < events4.length; i++) {
                          const item = events4[i];
                          console.log(item);
                          const promiseE = new Promise((resolve, reject) => {
                            
                          web3.eth.getTransaction(item.transactionHash, function (err, transaction) {
                              web3.eth.getBlock(transaction.blockNumber, function (err, block) {
                                SmartContractDondi.methods.users(item.returnValues.receiver).call().then((userInfo) => {
                                  retData.push({
                                    type: "Gifts",
                                    method: "income",
                                    id: userInfo.id,
                                    timestamp: block.timestamp,
                                    matrix: item.returnValues.matrix,
                                    level: item.returnValues.level,
                                    eth: 0.025 * Math.pow(2, item.returnValues.level - 1),
                                    transactionHash: item.transactionHash
                                  });

                                  resolve(5);
                                });
                              });
                            });

                          });
                          promises5.push(promiseE);
                        }

                        Promise.all(promises5).then(() => {

                          var retValue = retData;

                          if (matrix != "") {
                            retValue = retValue.filter((item) => {
                              return item.matrix == matrix;
                            });
                          }

                          if (level != "") {
                            retValue = retValue.filter((item) => {
                              return item.level == level;
                            });
                          }

                          if (direction != "") {
                            retValue = retValue.filter((item) => {
                              if (direction == 0)
                                return item.method == "income";
                              else if (direction == 1)
                                return item.method == "outcome";
                            });
                          }

                          if (type != "") {
                            retValue = retValue.filter((item) => {
                              if (type == "newUserPlaceEvent")
                                return item.type == "Transit [Sold places]" || item.type == "Part [Sold places]";
                              else if (type == "upgrageEvent")
                                return item.type == "Outbound [Upgrades]";
                              else if (type == "reinvestEvent")
                                return item.type == "Reopen";
                              else if (type == "missedEthReceive")
                                return item.type == "Lost profits";
                              else if (type == "leadingPartnerToUpline")
                                return item.type == "Overtaking";
                              else if (type == "sentExtraEthDividend")
                                return item.type == "Gifts";
                            });
                          }

                          if (tx != "") {
                            retValue = retValue.filter((item) => {
                              return item.transactionHash.toLowerCase() = tx.toLowerCase;
                            });
                          }

                          retValue.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);

                          let retAryData = retValue.slice((page - 1) * 50, page * 50);

                          res.send({
                            code: "200",
                            text: "Get the statistics infos successfully",
                            value: {
                              totalPage: Math.ceil(retValue.length / 50),
                              total: retValue.length,
                              data: retAryData
                            }
                          });
                        });
                      });
                  });
                });
            });
          });
       })
        .catch((e) => {
          res.send({
            code: "503",
            text: "address required",
            value: {}
          });
        });
    });
});

app.get(restApiPref + '/partners', (req, res) => {
  var address = req.query.address;
  var matrix = req.query.matrix;
  var level = req.query.level;
  var search = req.query.search;
  var page = req.query.page;
  const cntPerPage = 25;

  if (address == undefined || address == "")
    res.send({
      code: "503",
      text: "address required",
      value: {}
    });

  if (matrix == undefined)
    matrix = "";

  if (level == undefined)
    level = "";

  if (search == undefined)
    search = "";

  if (page == undefined)
    page = 1;

  let retData = [];

  // let retData = [{
  //   id: 0,
  //   registrationDate: "",
  //   wallet: "",
  //   x3: 1,
  //   x6: 1,
  //   profit: "0.000",
  //   partners: 0
  // }];

  SmartContractDondi.getPastEvents("Registration", {
      filter: {
        referrer: address
      },
      fromBlock: startBlock,
      toBlock: 'latest'
    }, function (error, events) {

    })
    .then(function (events) {
      var promises1 = [];
      for (let i = 0; i < events.length; i++) {
        const item = events[i];

        const promiseA = new Promise((resolve, reject) => {
          web3.eth.getTransaction(item.transactionHash, function (err, transaction) {
            web3.eth.getBlock(transaction.blockNumber, function (err, block) {
              SmartContractDondi.methods.users(item.returnValues.user).call().then((userInfo) => {

                retData.push({
                  id: userInfo.id,
                  timestamp: block.timestamp,
                  wallet: item.returnValues.user,
                  x3: 1,
                  x6: 1,
                  profit: "0.000",
                  partners: userInfo.partnersCount
                });

                resolve(1);
              });
            });
          });
        });

        promises1.push(promiseA);
      }


      Promise.all(promises1).then(() => {



        var promises2 = [];
        for (let j = 0; j < retData.length; j++) {
          for (let i = 1; i <= 12; i++) {
            const promiseA = new Promise((resolve, reject) => {
              SmartContractDondi.methods
                .usersActiveX3Levels(retData[j].wallet, i)
                .call()
                .then(function (result3) {
                  if (result3 == true) {

                    retData[j].x3 = i;
                    resolve(result3);
                  } else {
                    resolve(result3);
                  }
                });
            });

            promises2.push(promiseA);
          }
        }
        // console.log("legnth", promises2.length);


        Promise.all(promises2).then(function () {
          var promises3 = [];

          for (let j = 0; j < retData.length; j++) {
            for (let i = 1; i <= 12; i++) {
              const promiseB = new Promise((resolve, reject) => {

                SmartContractDondi.methods
                  .usersActiveX6Levels(retData[j].wallet, i)
                  .call()
                  .then(function (result4) {
                    if (result4 == true) {

                      retData[j].x6 = i;
                      resolve(result4);
                    } else {
                      resolve(result4);
                    }

                  });
              });

              promises3.push(promiseB);
            }
          }

          // console.log("legnth", promises3.length);

          Promise.all(promises3).then(function () {
            var returnValue = retData;

            if (search != "" && search != undefined) {
              returnValue = returnValue.filter((item) => {
                return item.id == search || item.wallet.toLowerCase() == search.toLowerCase();
              });
            }

            if (matrix != "" && level != "" && matrix != undefined && level != undefined) {
              returnValue = returnValue.filter((item) => {
                if (matrix == 1) {
                  return item.x3 >= level;
                } else if (matrix == 2) {
                  return item.x6 >= level;
                }
              });
            }

            returnValue.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);

            retAryData = returnValue.slice((page - 1) * 25, page * 25);

            res.send({
              code: "200",
              text: "Get the partners infos successfully",
              value: {
                totalPage: Math.ceil(returnValue.length / 25),
                total: returnValue.length,
                data: retAryData
              }
            });
          });
        });
      });
    });
});


app.post(restApiPref + '/generatelink', (req, res) => {
  console.log(req.body);
  const uid = req.body.uid;
  if (uid) {
    Link.findOne({ uid: uid }, (err, data) => {
      if (err) {
        res.send({
          code: "503",
          text: "Service Unavailable",
          error: err
        })
      } else {
        if (!data) {
          const randId = cryptoRandomString({ length: 13, type: 'numeric' });
          const randLinkId = cryptoRandomString({ length: 6 });

          const newLink = {
            id: "dondi-" + randId,
            uid,
            personal_link: `https://dondi.io/i/${randLinkId}/`,
            custom_link: `https://dondi.io/r/${randLinkId}/`,
            group_link: '',
          }

          const link = new Link(newLink);
          link.save()
            .then(() => res.send({
              code: "200",
              text: "Success",
              value: newLink,
            }))
            .catch(error => res.send({
              code: "503",
              text: "Service Unavailable",
              error: error
            }))
        } else {
          res.send({
            code: "1001",
            text: "Already exist",
            value: uid,
          })
        }
      }
    });
  } else {
    res.send({
      code: 500,
      text: "Service Unavailable",
      error: "Please input uid",
    })
  }
});

app.post(restApiPref + '/getidfromlink', (req, res) => {
  const link = req.body.link;
  Link.findOne({ $or: [{ personal_link: link }, { group_link: link }, { custom_link: link }] },
    (err, data) => {
      if (err) {
        res.send({
          code: "503",
          text: "Service Unavailable",
          error: err
        })
      } else {
        if (!data) {
          res.send({
            code: "200",
            text: "Not exists",
            value: 0
          })
        } else {
          res.send({
            code: "200",
            text: "Success",
            value: data.uid
          })
        }
      }
    });
});

function getInfoByTransaction(tx) {

  let defaultData = {
    block: null,
    blockNumber: 0,
    transaction: null,
    countConfirmation: 0
  };

  web3.eth.getBlockNumber(function (err, blockNumber) {
    if (err) {

      return false;
    }

    web3.eth.getTransaction(tx, function (err, transaction) {
      if (err) {

        return false;
      }
      if (!transaction) {

        return false;
      }

      web3.eth.getBlock(transaction.blockNumber, function (err, block) {
        if (err) {

          return false;
        }
        let countConfirmation = transaction.blockNumber === null ? 0 : blockNumber - transaction.blockNumber;
        console.log('block', block);
        console.log('blockNumber', blockNumber);
        console.log('transaction', transaction);
        console.log('countConfirmation', countConfirmation);

        defaultData = {
          block: block,
          blockNumber: blockNumber,
          transaction: transaction,
          countConfirmation: countConfirmation
        };
        return defaultData;
      });
    });
  });
}

app.listen(port, () =>
  console.log(`Dondi REST API listening on port ${port}!`)
);
