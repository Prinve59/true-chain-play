require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
  url: "http://127.0.0.1:8545"
},
    hardhat: {},
    sepolia: {
  url: process.env.SEPOLIA_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: 1000000000,  // 1 gwei
},
  },
};
