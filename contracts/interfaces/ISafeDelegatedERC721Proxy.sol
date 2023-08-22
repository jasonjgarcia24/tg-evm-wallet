// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISafeDelegatedERC721Proxy {
    struct AllowanceInfo {
        bool canBeTransferred;
        bool canBeSold;
        uint256 minPrice;
    }

    function allowances(
        bytes32
    )
        external
        view
        returns (bool canBeTransferred, bool canBeSold, uint256 minPrice);

    function canSellNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address spender
    ) external view returns (bool, uint256);

    function canTransferNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address spender
    ) external view returns (bool);

    function sellNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address destination
    ) external payable;

    function transferNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address destination
    ) external;

    function setAllowance(
        address nft,
        uint256 tokenId,
        uint256 minPrice,
        address destination,
        bool canBeTransferred
    ) external;
}
