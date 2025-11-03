/**
 * Interface representing the minimal subset of data required for our current analysis.
 */
export interface CPP_RouteWise {
    /** Three-letter IATA code for the origin airport */
    ORIGIN_AIRPORT_ABBREV: string;
    /** Three-letter IATA code for the destination airport */
    DESTINATION_AIRPORT_ABBREV: string;
    /** Coach fare type - ensured to be a number */
    YCA_FARE: number;
}

export interface CPP {
    /** Unique item identifier */
    ITEM_NUM: number;
    /** The year the contract or service was awarded */
    AWARD_YEAR: number;
    /** Three-letter IATA code for the origin airport */
    ORIGIN_AIRPORT_ABBREV: string;
    /** Three-letter IATA code for the destination airport */
    DESTINATION_AIRPORT_ABBREV: string;
    /** Full name of the origin city */
    ORIGIN_CITY_NAME: string;
    /** Abbreviated state name for the origin */
    ORIGIN_STATE: string;
    /** Full name of the origin country (e.g., "UNITED STATES") */
    ORIGIN_COUNTRY: 'UNITED STATES';
    /** Full name of the destination city */
    DESTINATION_CITY_NAME: string;
    /** Abbreviated state name for the destination */
    DESTINATION_STATE: string;
    /** Full name of the destination country (e.g., "UNITED STATES") */
    DESTINATION_COUNTRY: 'UNITED STATES';
    /** Two-letter IATA code for the airline */
    AIRLINE_ABBREV: string;
    /** Contract type/status (e.g., 'N' for New, 'C' for Continuation) */
    AWARDED_SERV: 'N' | 'C' | string;
    /** Total count of passengers (PAX) */
    PAX_COUNT: number;

    /** Fares for various class types (all appear to be integers, possibly zero) */
    YCA_FARE: number; // Coach fare type
    _CA_FARE: number; // Another coach fare type
    BUSINESS_FARE: number;
    _CP_FARE: number; // Premium/Contract fare type

    /** Location name of the origin airport */
    ORIGIN_AIRPORT_LOCATION: string;
    /** Location name of the destination airport */
    DESTINATION_AIRPORT_LOCATION: string;
    /** Concatenated city/state/airport string for origin (e.g., "ALLENTOWNPA-ABE") */
    ORIGIN_CITY_STATE_AIRPORT: string;
    /** Concatenated city/state/airport string for destination (e.g., "ATLANTAGA-ATL") */
    DESTINATION_CITY_STATE_AIRPORT: string;

    /** Effective start date (e.g., "10/01/2025") */
    EFFECTIVE_DATE: string;
    /** Expiration date (e.g., "09/30/2026") */
    EXPIRATION_DATE: string;
}