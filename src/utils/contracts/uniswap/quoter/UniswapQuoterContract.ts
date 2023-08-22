import { ethers } from "ethers";

import {
	getUniswapPoolFee,
	getUniswapQuoterAddress,
} from "../../../../config/environment";

import { BaseContract } from "../../BaseContract";
import { Erc20TokenContract } from "../../erc20/Erc20Contract";

import defaultAbi from "./abi.json";

export class UniswapQuoterContract extends BaseContract {
	constructor(
		chainId: number,
		pk: string,
		abi: ethers.ContractInterface = defaultAbi
	) {
		super(chainId, getUniswapQuoterAddress(chainId), pk, abi);
	}

	quote = async (
		tokenIn: Erc20TokenContract,
		tokenOut: Erc20TokenContract,
		amountIn: ethers.BigNumber,
		sqrtPriceLimitX96: number = 0
	): Promise<ethers.BigNumber> => {
		const method = "quoteExactInputSingle";
		const fee = getUniswapPoolFee(
			this.chainId,
			tokenIn.tokenAddress,
			tokenOut.tokenAddress
		);

		if (!this.contract.callStatic[method]) throw new Error("ERR_CHCK_6");

		const quote: ethers.BigNumber = await this.contract.callStatic[method](
			tokenIn.tokenAddress,
			tokenOut.tokenAddress,
			fee,
			amountIn,
			sqrtPriceLimitX96
		);

		return quote;
	};
}
