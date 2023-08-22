import { ethers } from "ethers";
import { TransactionService } from "../../../services/transaction";
import { BaseContract } from "../BaseContract";
import defaultAbi from "./abi.json";

export class Erc20TokenContract extends BaseContract {
	tokenAddress: string;

	constructor(
		chainId: number,
		tokenAddress: string,
		privateKey: string,
		abi: ethers.ContractInterface = defaultAbi
	) {
		super(chainId, tokenAddress, privateKey, abi);
		this.tokenAddress = tokenAddress;
	}

	parseValue = async (value: string): Promise<ethers.BigNumber> => {
		const decimals = await this.decimals();

		return ethers.utils.parseUnits(value, decimals);
	};

	formatValue = async (value: ethers.BigNumber): Promise<string> => {
		const decimals = await this.decimals();

		return ethers.utils.formatUnits(value, decimals);
	};

	formatBalance = async (): Promise<string> => {
		return await this.formatValue(await this.balance());
	};

	displayValue = async (value: ethers.BigNumber): Promise<string> => {
		const symbol = await this.symbol();

		return `${this.formatValue(value)} ${symbol}`;
	};

	displayBalance = async (): Promise<string> => {
		return await this.displayValue(await this.balance());
	};

	name = async (): Promise<number> => {
		return await this.contract["name"]();
	};

	symbol = async (): Promise<number> => {
		return await this.contract["symbol"]();
	};

	decimals = async (): Promise<number> => {
		return await this.contract["decimals"]();
	};

	balanceOf = async (address: string): Promise<ethers.BigNumber> => {
		return await this.contract["balanceOf"](address);
	};

	balance = async (): Promise<ethers.BigNumber> => {
		return this.balanceOf(await this.wallet.getAddress());
	};

	allowanceOf = async (
		owner: string,
		spender: string
	): Promise<ethers.BigNumber> => {
		return await this.contract["allowance"](owner, spender);
	};

	allowance = async (spender: string): Promise<ethers.BigNumber> => {
		return this.allowanceOf(await this.wallet.getAddress(), spender);
	};

	approve = async (
		spender: string,
		amount: ethers.BigNumber
	): Promise<void> => {
		const method = "approve";
		const currentAllowance = await this.allowance(spender);

		if (currentAllowance.gte(amount)) return;

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!this.contract.estimateGas[method] || !gasPrice) {
			throw new Error("ERR_CHCK_1");
		}

		const gasLimit = await this.contract.estimateGas[method](spender, amount, {
			gasPrice,
		});

		const tx = await this.contract[method](spender, amount, {
			gasLimit,
			gasPrice,
		});

		await tx.wait();

		await TransactionService.handleErc20ApproveTransaction(
			tx.hash,
			spender,
			await this.formatValue(amount),
			this.chainId,
			await this.wallet.getAddress()
		);
	};

	transfer = async (
		toAddress: string,
		amount: ethers.BigNumber
	): Promise<void> => {
		const method = "transfer";
		const currentBalance = await this.balance();

		if (currentBalance.lt(amount)) throw new Error("Not enough Balance");

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!gasPrice) {
			throw new Error("No gas price");
		}

		if (!this.contract.estimateGas[method]) throw new Error("ERR_CHCK_2");

		const gasLimit = await this.contract.estimateGas[method](
			toAddress,
			amount,
			{
				gasPrice,
			}
		);

		const tx = await this.contract[method](toAddress, amount, {
			gasLimit,
			gasPrice,
		});

		await tx.wait();

		await TransactionService.handleErc20TransferTransaction(
			tx.hash,
			toAddress,
			await this.formatValue(amount),
			this.chainId,
			await this.wallet.getAddress()
		);
	};

	transferFrom = async (
		fromAddress: string,
		toAddress: string,
		amount: ethers.BigNumber
	): Promise<void> => {
		const method = "transferFrom";
		const currentBalance = await this.balanceOf(fromAddress);

		if (currentBalance.lt(amount)) throw new Error("Not enough Balance");

		const gasPrice = (await this.wallet.getFeeData()).maxFeePerGas;

		if (!gasPrice) {
			throw new Error("No gas price");
		}

		if (!this.contract.estimateGas[method]) throw new Error("ERR_CHCK_3");

		const gasLimit = await this.contract.estimateGas[method](
			fromAddress,
			toAddress,
			amount,
			{
				gasPrice,
			}
		);

		const tx = await this.contract[method](fromAddress, toAddress, amount, {
			gasLimit,
			gasPrice,
		});

		await tx.wait();

		await TransactionService.handleErc20TransferFromTransaction(
			tx.hash,
			fromAddress,
			toAddress,
			await this.formatValue(amount),
			this.chainId,
			await this.wallet.getAddress()
		);
	};
}
