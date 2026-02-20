import type { PropertyListing, PropertyAddress, PropertyFeatures, ListingStatus, ListingType, PropertyType } from "../schemas";
interface DomainNextData {
    props: {
        pageProps: {
            componentProps?: {
                listingDetails?: {
                    id?: number;
                    headline?: string;
                    description?: string;
                    priceDetails?: {
                        displayPrice?: string;
                    };
                    saleMode?: string;
                    status?: string;
                    listingType?: string;
                    dateListed?: string;
                    dateUpdated?: string;
                    auctionSchedule?: {
                        time?: string;
                    };
                    media?: Array<{
                        type?: string;
                        url?: string;
                    }>;
                    inspections?: Array<{
                        time?: string;
                    }>;
                };
                address?: {
                    displayAddress?: string;
                    street?: string;
                    streetNumber?: string;
                    streetName?: string;
                    streetType?: string;
                    suburb?: string;
                    state?: string;
                    postcode?: string;
                    lat?: number;
                    lng?: number;
                };
                features?: {
                    beds?: number;
                    baths?: number;
                    parking?: number;
                    propertyType?: string;
                    propertyTypeFormatted?: string;
                    landSize?: number;
                    buildingSize?: number;
                    features?: string[];
                };
                agents?: Array<{
                    id?: number;
                    name?: string;
                    phone?: string;
                    photo?: string;
                    agencyId?: number;
                    agencyName?: string;
                }>;
            };
        };
    };
}
/**
 * Extract __NEXT_DATA__ JSON from Domain.com.au HTML
 */
export declare function extractDomainNextData(html: string): DomainNextData | null;
export declare function parseAustralianAddress(rawAddress: string): PropertyAddress | null;
export declare function parsePropertyFeatures(input: {
    bedrooms?: string;
    bathrooms?: string;
    carSpaces?: string;
    size?: string;
    features?: string[];
    propertyType?: string;
}): PropertyFeatures;
export declare function parsePrice(price?: string): {
    priceValue?: number;
    priceFrom?: number;
    priceTo?: number;
};
export declare function mapPropertyType(raw?: string): PropertyType | undefined;
export declare function deriveListingStatus(listingType: ListingType): ListingStatus;
export declare function parseDomainPropertyListing(html: string, listingType: ListingType, sourceUrl?: string): PropertyListing | null;
/**
 * Parse Domain.com.au search results page
 */
export declare function parseDomainSearchResults(html: string): PropertyListing[];
export {};
//# sourceMappingURL=domain-parser.d.ts.map