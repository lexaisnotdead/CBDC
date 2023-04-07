const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying CBDC contract with the account:", deployer.address);

  const CBDC = await ethers.getContractFactory("CBDC");
  const cbdc = await CBDC.deploy(deployer.address, 10000000);

  console.log("CBDC deployed to:", cbdc.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });