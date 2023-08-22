import Safe from "@safe-global/protocol-kit";
import { BigNumber } from "@ethersproject/bignumber";

export interface SafeInfo {
    safe: Safe;
    address: string;
    chainId: number;
    eoaOwner: string;
    balance: BigNumber;
}
