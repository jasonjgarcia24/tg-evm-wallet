// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract MockMarket {
    constructor() {}

    // // Fallback function must be declared as external.
    fallback() external payable {
        sendNft();
    }

    // Receive is a variant of fallback that is triggered when msg.data is empty
    receive() external payable {
        sendNft();
    }

    function abiEncode(
        address destAddress,
        address tokenAddress,
        uint256 tokenId
    ) public pure returns (bytes memory) {
        return abi.encodePacked(destAddress, tokenAddress, tokenId);
    }

    function sendNft() internal {
        address destAddress = address(uint160(bytes20(msg.data[0:20])));
        address tokenAddress = address(uint160(bytes20(msg.data[20:40])));
        uint256 tokenId = uint256(bytes32(msg.data[40:]));

        IERC721(tokenAddress).transferFrom(address(this), destAddress, tokenId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
