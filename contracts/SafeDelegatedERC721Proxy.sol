// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//
// Imported code
//

// from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol
import {IERC721} from "lib/openzeppelin-contracts/contracts/interfaces/IERC721.sol";

// from import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

// From code sample found
contract Enum {
    enum Operation {
        Call,
        DelegateCall
    }
}

interface Executor {
    /// @dev Allows a Module to execute a transaction.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation
    ) external returns (bool success);
}

contract SafeDelegatedERC721Proxy {
    //
    // Buying logic
    //

    struct PurchaseInfo {
        bool initiated;
        uint256 maxPrice;
        Executor gnosisSafeInstance;
    }

    // For a given nft and index, specify the maximum amount that will be paid
    mapping(bytes32 => PurchaseInfo) public allowances;

    function generateBuyAllowanceKey(
        address owner,
        address nft,
        uint256 tokenId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, nft, tokenId));
    }

    function getMaxAmountToPayForNFT(
        address owner,
        address nft,
        uint256 tokenId
    ) public view returns (uint256) {
        bytes32 key = generateBuyAllowanceKey(owner, nft, tokenId);
        return allowances[key].maxPrice;
    }

    function setMaxAmountToPayForNFT(
        address owner,
        address nft,
        uint256 tokenId,
        uint256 amount,
        address spender
    ) public {
        require(msg.sender == owner, "Only owner can set allowance");
        bytes32 key = generateBuyAllowanceKey(owner, nft, tokenId);
        allowances[key] = PurchaseInfo({
            initiated: false,
            maxPrice: amount,
            gnosisSafeInstance: Executor(spender)
        });
    }

    function buyNFT(
        address owner,
        address nft,
        uint256 tokenId,
        uint256 amount,
        address payable seller
    ) public {
        bytes32 key = generateBuyAllowanceKey(owner, nft, tokenId);
        require(amount <= allowances[key].maxPrice, "Price less than expected");
        // Protect against re-entrancy
        require(!allowances[key].initiated, "Already in progress");

        allowances[key].initiated = true;

        // It's expected the receiver of the funds sends the NFT in the same transaction
        transferEtherFromGnosisSafe(
            allowances[key].gnosisSafeInstance, // Safe SCW funds will be taken from
            nft, // NFT being bought
            tokenId, // ID of NFT being bought
            seller, // Market destination where NFT will be sent from
            amount
        ); // Cost of NFT

        // Resulting in the NFT now belonging to the user
        require(
            IERC721(nft).ownerOf(tokenId) == address(this),
            "NFT not transferred"
        );

        delete allowances[key];

        // Now this contract owns the NFT, forward it to the real owner
        IERC721(nft).transferFrom(address(this), owner, tokenId);
    }

    function transferEtherFromGnosisSafe(
        Executor payer,
        address nft,
        uint256 tokenId,
        address payable _to,
        uint256 _amount
    ) public {
        bytes memory data = abi.encodePacked(address(this), nft, tokenId);

        Enum.Operation op = Enum.Operation.Call;
        bool success = payer.execTransactionFromModule(_to, _amount, data, op);

        require(success, "Transfer from Gnosis Safe failed");
    }

    //
    // Selling logic
    //

    struct SellAllowanceInfo {
        bool canBeTransferred;
        bool canBeSold;
        uint256 minPrice;
    }

    mapping(bytes32 => SellAllowanceInfo) public sellingAllowances;

    function generateSellAllowanceKey(
        address owner,
        address nft,
        uint256 tokenId,
        address spender
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, nft, tokenId, spender));
    }

    function canSellNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address spender
    ) external view returns (bool, uint256) {
        bytes32 key = generateSellAllowanceKey(owner, nft, tokenId, spender);
        return (
            sellingAllowances[key].canBeSold,
            sellingAllowances[key].minPrice
        );
    }

    function canTransferNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address spender
    ) external view returns (bool) {
        bytes32 key = generateSellAllowanceKey(owner, nft, tokenId, spender);
        return sellingAllowances[key].canBeTransferred;
    }

    function sellNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address destination
    ) external payable {
        bytes32 key = generateSellAllowanceKey(
            owner,
            nft,
            tokenId,
            destination
        );

        require(sellingAllowances[key].canBeSold, "Not sellable");
        require(
            msg.value >= sellingAllowances[key].minPrice,
            "Insufficient payment"
        );
        // Implicitly the caller is allowed to spend

        payable(owner).transfer(sellingAllowances[key].minPrice);

        IERC721 nftContract = IERC721(nft);
        nftContract.transferFrom(owner, destination, tokenId);

        delete sellingAllowances[key];
    }

    function transferNFT(
        address owner,
        address nft,
        uint256 tokenId,
        address destination
    ) external {
        bytes32 key = generateSellAllowanceKey(
            owner,
            nft,
            tokenId,
            destination
        );

        require(sellingAllowances[key].canBeTransferred, "Not transferrable");
        // Implicitly the caller is allowed to send
        IERC721 nftContract = IERC721(nft);
        nftContract.transferFrom(owner, destination, tokenId);

        delete sellingAllowances[key];
    }

    function setSellAllowance(
        address nft,
        uint256 tokenId,
        bool canBeSold,
        uint256 minPrice,
        address destination,
        bool canBeTransferred
    ) external {
        if (minPrice > 0) {
            require(canBeSold, "Price requires selling permission");
        }

        address owner = msg.sender;
        bytes32 key = generateSellAllowanceKey(
            owner,
            nft,
            tokenId,
            destination
        );

        sellingAllowances[key] = SellAllowanceInfo({
            canBeSold: canBeSold,
            minPrice: minPrice,
            canBeTransferred: canBeTransferred
        });
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
