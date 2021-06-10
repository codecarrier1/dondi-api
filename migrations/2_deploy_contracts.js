//var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var SmartContractDondi = artifacts.require("./SmartContractDondi.sol");

module.exports = function(deployer) {
  //deployer.deploy(SimpleStorage);
  deployer.deploy(SmartContractDondi);
};
