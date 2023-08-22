import DEV_ENV from "./dev.environment.json";
import PROD_ENV from "./prod.environment.json";

const isProd = process.env["NODE_ENV"] === "PROD";

type ConfigSchema = { [key: number]: { rpc: string } };

const CONFIG: ConfigSchema = isProd ? PROD_ENV : DEV_ENV;

export const getChainRpcFromChainId = (chainId: number): string => {
	// TODO
	return CONFIG[chainId]?.rpc as string;
};

export const getWrappedNativeAssetIdForChain = (_chainId: number): string => {
	// TODO
	throw Error("Not Implemented");
};

export const getUniswapPoolFee = (
	_chainId: number,
	_inAddr: string,
	_outAddr: string
): number => {
	// TODO
	throw Error("Not Implemented");
};

export const getUniswapRouterAddress = (_chainId: number): string => {
	// TODO
	throw Error("Not Implemented");
};

export const getUniswapQuoterAddress = (_chainId: number): string => {
	// TODO
	throw Error("Not Implemented");
};

export const getUniswapSlippage = (
	_chainId: number,
	_inAddr: string,
	_outAddr: string
): number => {
	// TODO
	throw Error("Not Implemented");
};
