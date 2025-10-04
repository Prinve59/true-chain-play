// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BattlePetNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("BattlePet", "BPET") Ownable(msg.sender) {}

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 id = _nextTokenId++;
        _mint(to, id);
        return id;
    }

    function approveForMarket(address spender, uint256 tokenId) public {
        approve(spender, tokenId);
    }
}