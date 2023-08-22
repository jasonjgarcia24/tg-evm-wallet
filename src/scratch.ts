import dotenv from "dotenv";
dotenv.config();

import { ZDK, ZDKNetwork, ZDKChain, SalesQueryArgs } from "@zoralabs/zdk";
import {
    CollectionAddressOwnerAddressAttributesInput,
    NetworkInfo,
    SalesVolumeFilter,
    SaleType,
    SearchableEntity,
    SalesQueryFilter,
    SalesQueryInput,
    SortDirection,
    SaleSortKey,
    Token,
    TokenContract,
} from "@zoralabs/zdk/dist/queries/queries-sdk";

const networkInfo: NetworkInfo = {
    network: ZDKNetwork.Ethereum,
    chain: ZDKChain.Mainnet,
};

const API_ENDPOINT = "https://api.zora.co/graphql";

// All arguments are optional
const args = {
    endPoint: API_ENDPOINT,
    networks: [networkInfo],
    // apiKey: process.env.API_KEY,
};

const main = async () => {
    const zdk = new ZDK(args);

    const filter: SalesQueryFilter = {
        timeFilter: {
            startDate: "2023-08-08",
            endDate: "2023-08-09",
        },
        priceFilter: {
            minimumChainTokenPrice: "0.000000001",
        },
    };

    const salesQueryArgs: SalesQueryArgs = {
        where: {},
        sort: {
            sortDirection: SortDirection.Desc,
            sortKey: SaleSortKey.Time,
        },
        filter: filter,
        includeFullDetails: true,
        pagination: {
            after: "eyJza2lwIjogNTB9",
            limit: 100,
        },
    };

    const results = await zdk.sales(salesQueryArgs);

    console.log(results);
    console.log(results.sales.nodes[0].sale!);
};

main()
    .then(() => {
        console.log("done");
    })
    .catch((error) => {
        console.error(error);
    });
