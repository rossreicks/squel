/**
 * Additional options for `update().setFields()`.
 */
export interface SetFieldsOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
}
