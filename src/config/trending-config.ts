export enum SupportedTrendingPeriods {
    _1HR = "1hr",
    _6HR = "6hr",
    _24HR = "24hr",
    _1WK = "1wk",
    UNDEFINED = "_undefined_",
}

export const supportedToTrendingPeriodNumber = (
    trendingPeriod: SupportedTrendingPeriods
): number | null => {
    switch (trendingPeriod) {
        case SupportedTrendingPeriods._1HR:
            return 1;
        case SupportedTrendingPeriods._6HR:
            return 6;
        case SupportedTrendingPeriods._24HR:
            return 24;
        case SupportedTrendingPeriods._1WK:
            return 168;
        default:
            return null;
    }
};

export const supportedToTrendingPeriodFactor = (
    trendingPeriod: SupportedTrendingPeriods
): number | null => {
    switch (trendingPeriod) {
        case SupportedTrendingPeriods._1HR:
            return 1 / 24;
        case SupportedTrendingPeriods._6HR:
            return 6 / 24;
        case SupportedTrendingPeriods._24HR:
            return 1;
        case SupportedTrendingPeriods._1WK:
            return 7;
        default:
            return null;
    }
};
