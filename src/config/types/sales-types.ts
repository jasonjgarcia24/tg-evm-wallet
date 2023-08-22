import {
    SaleWithToken,
    Sale,
    CollectionStatsAggregateQuery,
} from "@zoralabs/zdk/dist/queries/queries-sdk";

export interface CountableSale extends Sale {
    count: number;
}

export interface CountableSaleWithToken extends SaleWithToken {
    count: number;
}

export type CountableSaleWithTokenAndVolume = CountableSaleWithToken &
    CollectionStatsAggregateQuery;
