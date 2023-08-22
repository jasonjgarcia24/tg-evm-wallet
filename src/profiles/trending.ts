import dotenv from "dotenv";
dotenv.config();

import { Message, CallbackQuery } from "node-telegram-bot-api";
import { telegram_bot as bot } from "../utils/telegram-bot";
import { IProjectConfig } from "../config/types/project-types";
import {
    supportedNetworkToZdkNetwork,
    SupportedNetworks,
} from "../config/network-config";
import {
    SupportedTrendingPeriods,
    supportedToTrendingPeriodNumber,
    supportedToTrendingPeriodFactor,
} from "../config/trending-config";
import { truncateAddress } from "../utils/address-utils";
import {
    CountableSaleWithToken,
    CountableSaleWithTokenAndVolume,
} from "../config/types/sales-types";
import { SalesQueryArgs } from "@zoralabs/zdk";
import { getZdkInstance } from "../utils/zdk-utils";
import {
    SaleSortKey,
    SalesQueryFilter,
    SortDirection,
    SalesQuery,
    SaleWithToken,
    Sale,
    CollectionStatsAggregateQuery,
} from "@zoralabs/zdk/dist/queries/queries-sdk";

let messageId: number | undefined = undefined;

export const runTrending = (
    activeNetwork: Record<number, SupportedNetworks>,
    selectedTrendingPeriod: Record<number, SupportedTrendingPeriods>,
    projectConfig: Record<number, IProjectConfig>
) => {
    console.log("runTrending");

    bot.on("callback_query", (query: CallbackQuery) => {
        if (!query.message) {
            console.log("QUERY_FAILED");
            return;
        }

        if (query.data === "trending_profile") {
            initTrendingProfile(
                query.message,
                activeNetwork,
                selectedTrendingPeriod
            );
        }
    });
};

const initTrendingProfile = (
    msg: Message,
    activeNetwork: Record<number, SupportedNetworks>,
    selectedTrendingPeriod: Record<number, SupportedTrendingPeriods>
) => {
    const network = activeNetwork[msg.chat.id];
    const trendingPeriod = selectedTrendingPeriod[msg.chat.id];

    collectNftSales(network, trendingPeriod)
        .then((trendingNftCollections: CountableSaleWithTokenAndVolume[]) => {
            const table = renderTrendingNftCollectionsTable(
                trendingNftCollections,
                trendingPeriod
            );

            bot.sendMessage(msg.chat.id, table, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }).then((msg: Message) => {
                messageId = msg.message_id;
            });
        })
        .catch((err) => console.log(err));
};

const collectNftSales = async (
    network: SupportedNetworks,
    selectedTrendingPeriod: SupportedTrendingPeriods
): Promise<CountableSaleWithTokenAndVolume[]> => {
    // Initialize Zora SDK.
    const zdk = getZdkInstance(network);

    // Set filter to fetch sales from the past 24 hours.
    const now = new Date();
    const yesterday = new Date(
        now.getTime() -
            supportedToTrendingPeriodFactor(selectedTrendingPeriod)! *
                24 *
                60 *
                60 *
                1000
    );

    const filter: SalesQueryFilter = {
        timeFilter: {
            startDate: yesterday.toISOString().split("T")[0],
            endDate: now.toISOString().split("T")[0],
        },
        priceFilter: {
            // minimumChainTokenPrice: "0.000000001",
        },
    };

    // Initialize sales query args.
    const salesQueryArgs: SalesQueryArgs = {
        where: {},
        sort: {
            sortDirection: SortDirection.Desc,
            sortKey: SaleSortKey.Time,
        },
        filter: filter,
        includeFullDetails: true,
        pagination: {
            after: undefined,
            limit: 100,
        },
    };

    let hasNextPage: boolean = true;
    const sales: SaleWithToken[] = [];

    // Fetch sales until there are no more pages.
    while (hasNextPage) {
        // Fetch sales and add them to the sales array
        const results: SalesQuery = await zdk.sales(salesQueryArgs);
        console.log(results.sales.nodes[0]);

        sales.push(
            ...(results.sales.nodes.filter((sale) => {
                const bolckTimestamp = new Date(
                    sale.sale!.transactionInfo.blockTimestamp
                );
                const diff = Math.floor(
                    (now.getTime() - bolckTimestamp.getTime()) / 1000 / 60
                );

                return (
                    diff <=
                    60 *
                        supportedToTrendingPeriodNumber(selectedTrendingPeriod)!
                );
            }) as SaleWithToken[])
            // .map((sale) => sale.sale!) as Sale[])
        );

        // Update pagination args
        hasNextPage = results.sales.pageInfo.hasNextPage;
        salesQueryArgs.pagination!.after = results.sales.pageInfo.endCursor;
    }

    // Sort sales by collection address and count the number of sales per collection.
    const trendingCollections: CountableSaleWithToken[] =
        sortUniqueElementsByCount(sales, "collectionAddress");

    // Fetch collection stats aggregation for each collection.
    const trendingCollectionsWithVolume = (await Promise.all(
        trendingCollections.map(async (collection) => {
            const collectionStatsAggregation =
                await collectCollectionStatsAggregation(network, collection);

            return { ...collection, ...collectionStatsAggregation };
        })
    )) as CountableSaleWithTokenAndVolume[];

    return trendingCollectionsWithVolume;
};

const collectCollectionStatsAggregation = async (
    network: SupportedNetworks,
    saleWithToken: CountableSaleWithToken
): Promise<CollectionStatsAggregateQuery> => {
    // Initialize Zora SDK.
    const zdk = getZdkInstance(network);
    const networkZdk = supportedNetworkToZdkNetwork(network)!;

    const collectionStatsAgg = await zdk.collectionStatsAggregate({
        collectionAddress: saleWithToken.sale.collectionAddress,
        network: networkZdk,
    });

    return collectionStatsAgg;
};

const sortUniqueElementsByCount = (
    arr: SaleWithToken[],
    sale_field: keyof Sale,
    limit: number = 10
): CountableSaleWithToken[] => {
    const counts = new Map<any, number>();

    const uniqueElements = arr.filter((item) => {
        const fieldValue = item.sale[sale_field];
        if (!counts.has(fieldValue)) {
            counts.set(fieldValue, 1);
            return true;
        } else {
            counts.set(fieldValue, counts.get(fieldValue)! + 1);
            return false;
        }
    }) as CountableSaleWithToken[];

    // Sort the unique elements by count.
    uniqueElements.sort((a, b) => {
        const countA = counts.get(a.sale[sale_field])!;
        const countB = counts.get(b.sale[sale_field])!;
        if (countA === countB) {
            // If the count is the same, use lexicographical sorting.
            return String(a.sale[sale_field]).localeCompare(
                String(b.sale[sale_field])
            );
        }
        return countB - countA;
    });

    // Return the top N elements with a count property.
    return uniqueElements.slice(0, limit).map((element) => {
        element.count = counts.get(element.sale[sale_field])!;
        return element;
    });
};

const renderTrendingNftCollectionsTable = (
    trendingNftCollections: CountableSaleWithTokenAndVolume[],
    trendingPeriod: SupportedTrendingPeriods
): string => {
    // Generate the formatted table header
    // const headers = [" Collection ", "Volume", "Period", " Avg Price (USDC) "];
    const headers = [
        "  Address   ",
        "Avg Price (USD) ",
        "Floor (ETH)",
        "   Price (USD)    ",
        "Total Sales",
    ];

    console.log(trendingNftCollections[0]);

    // Get the padded table data
    const rows = trendingNftCollections.map((sale) => {
        // Format Avg Price
        const usdcPrice = String(
            sale.sale.price!.usdcPrice!.decimal.toFixed(6)
        );

        const usdcPriceFormatted =
            usdcPrice.split(".")[0].padStart(9, " ") +
            "." +
            usdcPrice.split(".")[1].padEnd(6, "0");

        // Format Floor Price
        const floorPrice = String(
            sale.aggregateStat.floorPrice
                ? sale.aggregateStat.floorPrice!.toFixed(6)
                : null
        );

        const floorPriceFormatted =
            floorPrice !== "null"
                ? floorPrice.split(".")[0].padStart(4, " ") +
                  "." +
                  floorPrice.split(".")[1].padEnd(6, "0")
                : "N/A".padStart(6, " ").padEnd(11, " ");

        // Format USDC Price
        const volumePrice = String(
            sale.aggregateStat.salesVolume.usdcPrice.toFixed(6)
        );

        const volumePriceFormatted =
            volumePrice.split(".")[0].padStart(11, " ") +
            "." +
            volumePrice.split(".")[1].padEnd(6, "0");

        // Format Total Sales
        const volumeTotalSalesFormatted = String(
            sale.aggregateStat.salesVolume.totalCount
        ).padStart(11, " ");

        return [
            truncateAddress(sale.sale.collectionAddress),
            usdcPriceFormatted,
            floorPriceFormatted,
            volumePriceFormatted,
            volumeTotalSalesFormatted,
        ];
    });

    const links = trendingNftCollections.map((sale) => {
        return `<a href="https://opensea.io/assets?search[query]=${
            sale.sale.collectionAddress
        }">🔗 ${truncateAddress(sale.sale.collectionAddress)}</a>`;
    });

    // Generate the formatted table
    const table =
        `<pre>|                  Collection                   |              Volume              |</pre>\n` +
        `<pre>| ${headers.join(" | ")} |</pre>\n` +
        `<pre>| ------------ + ---------------- + ----------- + ------------------ + ----------- |</pre>\n` +
        rows.map((row) => `<pre>| ${row.join(" | ")} |</pre>`).join("\n") +
        "\n\n" +
        links.join("\n");

    console.log(table);

    return table;
};
