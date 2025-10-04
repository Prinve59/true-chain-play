const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let nft, marketplace, owner, buyer, seller;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("BattlePetNFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(await nft.getAddress());
    await marketplace.waitForDeployment();

    // Mint pets
    await nft.connect(owner).mint(owner.address);  // tokenId 0
    await nft.connect(owner).mint(seller.address); // tokenId 1
    await nft.connect(owner).mint(buyer.address);  // tokenId 2 (for swap)
    await nft.connect(owner).mint(seller.address); // tokenId 3 (for swap)
  });

  it("Should list and buy an item", async function () {
    const tokenId = 0;
    const price = ethers.parseEther("0.01");
    await nft.connect(owner).approveForMarket(await marketplace.getAddress(), tokenId);
    await marketplace.connect(owner).listForSale(tokenId, price);

    await expect(marketplace.connect(buyer).buyItem(tokenId, { value: price }))
      .to.emit(marketplace, "Bought")
      .withArgs(tokenId, buyer.address, price);

    expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);
    expect(await marketplace.listings(tokenId)).to.equal(0);
  });

  it("Should perform direct swap", async function () {
    const tokenId1 = 2;  // Buyer's pet
    const tokenId2 = 3;  // Seller's pet
    const marketplaceAddr = await marketplace.getAddress();

    // Approvals
    await nft.connect(buyer).approveForMarket(marketplaceAddr, tokenId1);
    await nft.connect(seller).approveForMarket(marketplaceAddr, tokenId2);

    await expect(marketplace.connect(buyer).directSwap(tokenId1, tokenId2))
      .to.emit(marketplace, "Swapped")
      .withArgs(tokenId1, tokenId2, buyer.address, seller.address);

    expect(await nft.ownerOf(tokenId1)).to.equal(seller.address);
    expect(await nft.ownerOf(tokenId2)).to.equal(buyer.address);
  });
});