import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractReceipt } from "@ethersproject/contracts";
import Safe, {
    EthersAdapter,
    SafeFactory,
    SafeAccountConfig,
} from "@safe-global/protocol-kit";
import {
    SafeTransaction,
    SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import { Message } from "node-telegram-bot-api";
import { SupportedNetworks, networkProvider } from "../config/network-config";
import { setEthAddress } from "./account-utils";
import { SafeInfo } from "../config/types/safe-types";

const initSigner = async (
    selectedNetwork: SupportedNetworks,
    withSigner?: boolean // default true
): Promise<ethers.Wallet | ethers.providers.JsonRpcProvider | null> => {
    if (withSigner === undefined) withSigner = true;

    // WALLET CONNECTOR WITH PROVIDER
    const provider = networkProvider(selectedNetwork);
    if (!withSigner) return provider;

    const wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY_ACCOUNT_BOT}`);

    return wallet.connect(provider as ethers.providers.Provider);
};

const initEthAdapter = async (
    selectedNetwork: SupportedNetworks,
    withSigner?: boolean // default true
): Promise<EthersAdapter> => {
    // BUILD EthAdapter
    // by using ethers and initSigner function
    const botSigner = (await initSigner(
        selectedNetwork,
        withSigner
    ))! as ethers.Wallet;

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: botSigner,
    });

    return ethAdapter;
};

export const deploySafe = async (
    msg: Message,
    owners: string | string[],
    addressRecord: Record<number, string>,
    selectedNetwork: Record<number, SupportedNetworks>
): Promise<SafeInfo> => {
    // Init Safe SDK
    const demo__Network = SupportedNetworks.ETHERUM_GOERLI;
    // initEthAdapter(selectedNetwork[msg.chat.id]);
    const ethAdapter = await initEthAdapter(demo__Network);
    console.log(ethAdapter);

    // Create Safe AA Factory
    const safeFactory = await SafeFactory.create({ ethAdapter });

    // Create Safe Account Config
    if (typeof owners === "string") owners = [owners];
    const threshold = 1;

    const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold,
        // ...
    };

    // Create Safe AA Wallet
    const safe: Safe = await safeFactory.deploySafe({ safeAccountConfig });

    // Get Safe AA Address
    const safeAddress = await getWalletAddress(safe);

    // Get Safe AA ChainId
    const safeChainId = await safe.getChainId();

    // Get Safe AA Balance
    const safeBalance = await getWalletBalance(safe);

    return {
        safe: safe,
        address: safeAddress,
        chainId: safeChainId,
        eoaOwner: owners[0],
        balance: safeBalance,
    };
};

export const connectSafe = async (
    safeAddress: string,
    network: SupportedNetworks,
    withSigner?: boolean // default true
): Promise<Safe> => {
    // Init Safe SDK
    const ethAdapter = await initEthAdapter(network, withSigner);

    // Connect to Safe
    const safe = await Safe.create({ ethAdapter, safeAddress });

    return safe;
};

export const setWalletAddress = (
    msg: Message,
    addressesRecord: Record<number, string>,
    address: string
) => {
    setEthAddress(msg, addressesRecord, address);
};

export const getWalletAddress = async (safe: Safe): Promise<string> => {
    return await safe.getAddress();
};

export const getWalletBalance = async (safe: Safe): Promise<BigNumber> => {
    return await safe.getBalance();
};

export const getWalletOwners = async (
    safeAddress: string,
    network: SupportedNetworks
): Promise<string[]> => {
    // Init Safe SDK instance
    const safe = await connectSafe(safeAddress, network, false);

    // Get Safe Owners
    const safeOwners = await safe.getOwners();

    return safeOwners;
};

export const createSafePaymentTx = async (
    safeAddress: string,
    network: SupportedNetworks,
    to: string,
    amount: string
): Promise<SafeTransaction> => {
    return await createSafeTx(safeAddress, network, to, amount, "0x");
};

export const createSafeTx = async (
    safeAddress: string,
    network: SupportedNetworks,
    to: string,
    amount: string,
    data: string
): Promise<SafeTransaction> => {
    // Init Safe SDK instance
    const safe = await connectSafe(
        safeAddress,
        SupportedNetworks.ETHERUM_GOERLI
    );

    // Create Transaction
    const amountWei = ethers.utils.parseEther(amount).toString(); // Convert to wei
    const safeTransactionData: SafeTransactionDataPartial = {
        to: to,
        value: amountWei,
        data: data,
    };

    const safeTransaction: SafeTransaction = await safe.createTransaction({
        safeTransactionData,
    });

    return safeTransaction;
};

export const createTxHash = async (
    safeAddress: string,
    network: SupportedNetworks,
    transaction: SafeTransaction
): Promise<string> => {
    // Init Safe SDK instance
    const safe = await connectSafe(safeAddress, network);

    // Create Transaction Hash
    const txHash: string = await safe.getTransactionHash(transaction);

    return txHash;
};

export const approveTxHash = async (
    safeAddress: string,
    network: SupportedNetworks,
    transaction: SafeTransaction
): Promise<ContractReceipt | undefined> => {
    // Init Safe SDK instance
    const safe = await connectSafe(safeAddress, network);

    // Approve Transaction
    const txHash: string = await safe.getTransactionHash(transaction);
    const approveTxResponse = await safe.approveTransactionHash(txHash);
    const txReceipt = await approveTxResponse.transactionResponse?.wait();
    console.log(`approvedTx: (${txReceipt})\n`);

    return txReceipt;
};

export const signAndExecuteSafeTx = async (
    safeAddress: string,
    network: SupportedNetworks,
    safeTransaction: SafeTransaction
): Promise<ContractReceipt | undefined> => {
    // Init Safe SDK instance
    const safe = await connectSafe(safeAddress, network);

    // Execute Transaction
    const executeTxResponse = await safe.executeTransaction(safeTransaction);
    const txReceipt = await executeTxResponse.transactionResponse?.wait();
    console.log(`executedTx: (${txReceipt?.transactionHash})\n`);

    return txReceipt;
};
