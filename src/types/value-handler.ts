import { Options } from './options';

interface ParamString {
    text: string;
    values: any[];
}

export type ValueHandler<T> = {
    handler: (value: T, asParam?: boolean, options?: Options) => string | ParamString;
    type: T;
};
