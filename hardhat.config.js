/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");

require('dotenv').config();
const { PRIVATE_KEY, PROJECT_ID, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY],

    },
  },

  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
