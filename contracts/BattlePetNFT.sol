// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BattlePetNFT is ERC721, Ownable {
    uint256 public _nextTokenId; // made public to view next ID

    constructor() ERC721("BattlePet", "BPET") Ownable(msg.sender) {}

    // ✅ made public so anyone can mint (was onlyOwner before)
    function mint(address to) public returns (uint256) {
        uint256 id = _nextTokenId++;
        _mint(to, id);
        return id;
    }

    // already public
    function approveForMarket(address spender, uint256 tokenId) public {
        approve(spender, tokenId);
    }
}
