// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    IERC721 public immutable nft;

    mapping(uint256 => uint256) public listings; // tokenId => price (0 if not listed)
    mapping(uint256 => address) public tokenSellers; // tokenId => seller

    event Listed(uint256 indexed tokenId, uint256 price, address seller);
    event Bought(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event Swapped(uint256 indexed tokenId1, uint256 indexed tokenId2, address indexed from, address to);

    constructor(address _nft) Ownable(msg.sender) {
        nft = IERC721(_nft);
    }

    function listForSale(uint256 tokenId, uint256 price) public {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be positive");
        require(listings[tokenId] == 0, "Already listed");

        nft.transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = price;
        tokenSellers[tokenId] = msg.sender;
        emit Listed(tokenId, price, msg.sender);
    }

    function buyItem(uint256 tokenId) public payable {
        uint256 price = listings[tokenId];
        require(price > 0, "Not listed");
        require(msg.value == price, "Incorrect payment");
        address seller = tokenSellers[tokenId];

        nft.transferFrom(address(this), msg.sender, tokenId);
        payable(seller).transfer(price);

        delete listings[tokenId];
        delete tokenSellers[tokenId];

        emit Bought(tokenId, msg.sender, price);
    }

    function directSwap(uint256 tokenId1, uint256 tokenId2) public {
        address owner1 = msg.sender;
        address owner2 = nft.ownerOf(tokenId2);
        require(nft.ownerOf(tokenId1) == owner1, "Not owner of token1");
        require(owner1 != owner2, "Cannot swap with self");

        // Relies on prior approvals to this contract; transferFrom will revert if insufficient
        nft.transferFrom(owner1, owner2, tokenId1);
        nft.transferFrom(owner2, owner1, tokenId2);

        emit Swapped(tokenId1, tokenId2, owner1, owner2);
    }

    function delist(uint256 tokenId) public {
        require(nft.ownerOf(tokenId) == address(this), "Not escrowed");
        require(tokenSellers[tokenId] == msg.sender, "Not seller");

        nft.transferFrom(address(this), msg.sender, tokenId);
        delete listings[tokenId];
        delete tokenSellers[tokenId];
    }
}
