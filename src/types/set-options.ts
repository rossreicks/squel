/**
 * Additional options for `update().set()`.
 */
export interface SetOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;

    /**
     * If set and the value is a String then it will not be quoted in the output Default is `false`.
     */
    dontQuote?: boolean;
}
