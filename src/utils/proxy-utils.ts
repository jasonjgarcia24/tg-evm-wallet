import { ethers } from "ethers";

export const encodeSetAllowanceCalldata = (
    tokenAddress: string,
    tokenId: string,
    minPrice: string, // WEI
    destination: string,
    canBeTransferred: boolean = true
): string => {
    const abi = new ethers.utils.AbiCoder();
    const funcSig = "setAllowance(address,uint256,uint256,address,bool)";
    const types = ["address", "uint256", "uint256", "address", "bool"];
    const values = [
        tokenAddress,
        ethers.BigNumber.from(tokenId),
        ethers.BigNumber.from(minPrice),
        destination,
        canBeTransferred,
    ];

    const encodedData = ethers.utils.defaultAbiCoder.encode(types, values);
    const functionHash = ethers.utils.id(funcSig).slice(0, 10);
    const calldata = functionHash + encodedData.slice(2);

    return calldata;
};
