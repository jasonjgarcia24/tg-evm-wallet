import { ethers } from "ethers";

export const percentOf = (
	number: ethers.BigNumber,
	percent: number,
	denominator: number = 100
): ethers.BigNumber => {
	while (percent < 0) {
		percent *= 10;
		denominator *= 10;
	}

	return number.mul(percent).div(denominator);
};
