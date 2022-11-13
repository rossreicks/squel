import { QueryBuilder } from '../query-builder';

export interface Options {
    autoQuoteTableNames?: boolean;
    autoQuoteFieldNames?: boolean;
    autoQuoteAliasNames?: boolean;
    buildParameterized?: boolean;
    dontQuote?: boolean;
    forDelete?: boolean;
    useAsForTableAliasNames?: boolean;
    nameQuoteCharacter?: string;
    tableAliasQuoteCharacter?: string;
    fieldAliasQuoteCharacter?: string;
    ignorePeriodsForFieldNameQuotes?: boolean;
    queryBuilder?: QueryBuilder;
    valueHandlers?: any[];
    parameterCharacter?: string;
    nested?: boolean;
    prefix?: string;
    numberedParameters?: boolean;
    numberedParametersPrefix?: string;
    numberedParametersStartAt?: number;
    replaceSingleQuotes?: boolean;
    singleQuoteReplacement?: string;
    singleTable?: boolean;
    separator?: string;
    stringFormatter?: any;
    rawNesting?: boolean;
    verb?: string;
}
