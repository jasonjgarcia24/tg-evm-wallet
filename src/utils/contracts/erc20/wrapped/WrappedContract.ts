import { ethers } from "ethers";

import { Erc20TokenContract } from "../Erc20Contract";

import { getWrappedNativeAssetIdForChain } from "../../../../config/environment";
import { TransactionService } from "../../../../services/transaction";
import defaultAbi from "./abi.json";

export class WrappedTokenContract extends Erc20TokenContract {
	constructor(
		chainId: number,
		pk: string,
		abi: ethers.ContractInterface = defaultAbi
	) {
		super(chainId, getWrappedNativeAssetIdForChain(chainId), pk, abi);
	}

	deposit = async (amount: ethers.BigNumber): Promise<void> => {
		const method = "deposit";
		const currentBalance = await this.wallet.getBalance();

		if (currentBalance.lte(amount)) throw new Error("Insufficient Balance");

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!gasPrice) {
			throw new Error("No Gas Price");
		}

		if (!this.contract.estimateGas[method]) throw new Error("ERR_CHCK_4");

		const gasLimit = await this.contract.estimateGas[method]({
			gasPrice,
			value: amount,
		});

		const gasValue = gasLimit.mul(gasPrice);

		if (gasValue.add(amount).gt(currentBalance))
			throw new Error("Insufficient Balance");

		const tx = await this.contract[method]({
			gasLimit,
			gasPrice,
			value: amount,
		});

		await tx.wait();

		await TransactionService.handleWrappedDepositTransaction(
			tx.hash,
			this.chainId,
			await this.wallet.getAddress(),
			await this.formatValue(amount)
		);
	};

	withdraw = async (amount: ethers.BigNumber): Promise<void> => {
		const method = "withdraw";
		const currentBalance = await this.balance();

		if (currentBalance.lt(amount)) throw new Error("Insufficient Balance");

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!gasPrice) {
			throw new Error("No gas price");
		}

		if (!this.contract.estimateGas[method]) throw new Error("ERR_CHCK_5");

		const gasLimit = await this.contract.estimateGas[method](amount, {
			gasPrice,
		});

		const tx = await this.contract[method](amount, {
			gasLimit,
			gasPrice,
		});

		await tx.wait();

		await TransactionService.handleWrappedWithdrawTransaction(
			tx.hash,
			this.chainId,
			await this.wallet.getAddress(),
			await this.formatValue(amount)
		);
	};

	withdrawAll = async (): Promise<void> => {
		await this.withdraw(await this.balance());
	};
}
