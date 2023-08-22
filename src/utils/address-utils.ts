export const truncateAddress = (str: string): string => {
    const prefix = str.substring(0, 5);
    const suffix = str.substring(str.length - 4);

    return `${prefix}...${suffix}`;
};
