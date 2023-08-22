export class TransactionService {
	static handleErc20ApproveTransaction = async (
		_tx_hash: string,
		_spender: string,
		_amount: string,
		_chainId: number,
		_owner: string
	) => {
		// TODO
		throw Error("Not Implemented");
	};

	static handleErc20TransferTransaction = async (
		_tx_hash: string,
		_to: string,
		_amount: string,
		_chainId: number,
		_owner: string
	) => {
		// TODO
		throw Error("Not Implemented");
	};

	static handleErc20TransferFromTransaction = async (
		_tx_hash: string,
		_from: string,
		_to: string,
		_amount: string,
		_chainId: number,
		_owner: string
	) => {
		// TODO
		throw Error("Not Implemented");
	};

	static handleWrappedDepositTransaction = async (
		_tx_hash: string,
		_chainId: number,
		_owner: string,
		_amount: string
	) => {
		// TODO
		throw Error("Not Implemented");
	};

	static handleWrappedWithdrawTransaction = async (
		_tx_hash: string,
		_chainId: number,
		_owner: string,
		_amount: string
	) => {
		// TODO
		throw Error("Not Implemented");
	};
}
