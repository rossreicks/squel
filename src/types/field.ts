import { BaseBuilder } from '../cls';
import { FieldOptions } from './field-options';

export interface Field {
    alias: string | null;
    name: string | BaseBuilder;
    options: FieldOptions;
}
