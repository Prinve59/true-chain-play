const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy NFT contract
  const NFT = await hre.ethers.getContractFactory("BattlePetNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("BattlePetNFT deployed to:", await nft.getAddress());

  // Deploy Marketplace (pass NFT address)
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(await nft.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Mint test pet
  const mintTx0 = await nft.mint(deployer.address); // tokenId 0
  await mintTx0.wait();
  console.log("Minted tokenId 0 to deployer, tx:", mintTx0.hash);

  // List tokenId 0 for sale (0.01 ETH)
  const marketplaceAddr = await marketplace.getAddress();
  await nft.connect(deployer).approveForMarket(marketplaceAddr, 0);
  const listTx = await marketplace.connect(deployer).listForSale(0, hre.ethers.parseEther("0.01"));
  await listTx.wait();
  console.log("Listed tokenId 0 for 0.01 ETH, tx:", listTx.hash);

  // Buy tokenId 0 (self-buy; in prod, use another wallet)
  const buyTx = await marketplace.connect(deployer).buyItem(0, { value: hre.ethers.parseEther("0.01") });
  await buyTx.wait();
  console.log("Deployer bought tokenId 0 (self), tx:", buyTx.hash);

  // Skip swap for single-signer demo (would revert on self-swap)
  console.log("Single-signer demo complete (swap skipped). Check txs on Sepolia Etherscan: https://sepolia.etherscan.io/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
