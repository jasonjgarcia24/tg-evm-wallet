import {
	getUniswapPoolFee,
	getUniswapRouterAddress,
	getUniswapSlippage,
} from "../../../../config/environment";
import { BaseContract } from "../../BaseContract";

import { ethers } from "ethers";
import { percentOf } from "../../../math.utils";
import { Erc20TokenContract } from "../../erc20/Erc20Contract";
import defaultAbi from "./abi.json";

export class UniswapRouterContract extends BaseContract {
	constructor(chainId: number, pk: string) {
		super(chainId, getUniswapRouterAddress(chainId), pk, defaultAbi);
	}

	exactInputSingle = async (
		tokenIn: Erc20TokenContract,
		tokenOut: Erc20TokenContract,
		amountIn: ethers.BigNumber,
		amountOut: ethers.BigNumber
	): Promise<void> => {
		const method = "exactInputSingle";

		if (this.chainId !== tokenIn.chainId || this.chainId !== tokenOut.chainId) {
			throw new Error("ERR_CHCK_7: Chain Mismatch");
		}

		const userBalance = await tokenIn.balance();

		if (userBalance.lt(amountIn)) {
			throw new Error("Insufficient Funds");
		}

		const tokenInAddress = tokenIn.tokenAddress;
		const tokenOutAddress = tokenOut.tokenAddress;

		const slippagePercent = getUniswapSlippage(
			this.chainId,
			tokenInAddress,
			tokenOutAddress
		);

		const slippageValue = percentOf(amountOut, slippagePercent, 100);

		const amountOutMin = amountOut.sub(slippageValue);

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!gasPrice) {
			throw new Error("No gas price");
		}

		const args = [
			{
				tokenIn: tokenInAddress,
				tokenOut: tokenOutAddress,
				fee: getUniswapPoolFee(this.chainId, tokenInAddress, tokenOutAddress),
				recipient: await this.wallet.getAddress(),
				deadline: Date.now() + 10000,
				amountIn: amountIn,
				amountOutMinimum: amountOutMin,
				sqrtPriceLimitX96: 0,
			},
			{
				gasPrice,
			},
		];

		if (
			!this.contract.estimateGas[method] ||
			!this.contract.functions[method]
		) {
			throw new Error("ERR_CHCK_8");
		}

		await this.contract.estimateGas[method](...args);

		const tx = await this.contract.functions[method](...args);

		await tx.wait();
	};
}
