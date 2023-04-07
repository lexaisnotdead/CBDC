# CBDC - Central Bank Digital Currency
This is a smart contract for a central bank digital currency (CBDC). It is based on the ERC20 token standard.

## Features
* ```updateControllingParty```: Allows the current controlling party to transfer control to a new party.
* ```updateInterestRate```: Allows the controlling party to update the interest rate.
* ```increaseTokenSupply```: Allows the controlling party to increase the token supply.
* ```updateBlacklist```: Allows the controlling party to blacklist an address, preventing it from sending or receiving tokens.
* ```stakeTreasuryBonds```: Allows users to stake CBDC to earn interest. The longer they stake, the higher their reward.
* ```unstakeTreasuryBonds```: Allows users to withdraw their staked CBDC.
* ```claimTreasuryBonds```: Allows users to claim the interest earned on their staked CBDC.
* ```stakedAmountOf```: Returns the amount of tokens staked by user.

## Setup
1. Clone this repository to your local machine:
```
git clone https://github.com/lexaisnotdead/CBDC.git
```
2. Install the project dependencies:
```
cd ./CBDC
npm install
```

3. Create a new ```.env``` file in the project directory with the following variables:
```
PRIVATE_KEY = <your_ethereum_private_key>
PROJECT_ID = <your_infura_project_id>
ETHERSCAN_API_KEY = <your_etherscan_api_key>
```

## Usage
To run the tests, simply execute the following command:
```
npx hardhat test
```

To deploy the contract to a local network, execute the following command:
```
npx hardhat run scripts/cbdc-deploy.js --network hardhat
```
Replace ```hardhat``` with the name of the network you want to deploy to (e.g. goerli, mainnet, etc.) and make sure you have the corresponding configuration in the `hardhat.config.js` file.

## Goerli
[Link](https://goerli.etherscan.io/address/0x16FD77B210B93024C9D20EFB1650Bc6C187fF523#code) to the verified contract in the Goerli network.