import { runOnboarding } from "./src/profiles/onboarding";
import { runNFTs } from "./src/profiles/nfts";
import { runTrending } from "./src/profiles/trending";
import { runNftPurchase } from "./src/profiles/nft-purchase";
import { runPeanut } from "./src/profiles/peanut-exchange";
import { SupportedNetworks } from "./src/config/network-config";
import { SupportedTrendingPeriods } from "./src/config/trending-config";
import { IProjectConfig } from "./src/config/types/project-types";

// In-memory storage for simplicity; consider using a database for persistent storage.
const userEthAddresses: Record<number, string> = {};
const activeNetwork: Record<number, SupportedNetworks> = {};
const selectedTrendingPeriod: Record<number, SupportedTrendingPeriods> = {};
const projectConfig: Record<number, IProjectConfig> = {};

runOnboarding(userEthAddresses, activeNetwork, projectConfig);
runNFTs(activeNetwork, selectedTrendingPeriod, projectConfig);
runTrending(activeNetwork, selectedTrendingPeriod, projectConfig);
runNftPurchase(userEthAddresses, activeNetwork, projectConfig).then(() => {});
runPeanut(userEthAddresses, activeNetwork, projectConfig).then(() => {});
