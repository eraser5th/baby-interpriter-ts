import { DefinedFunction, EmbeddedFunction } from './evaluatorTypes';

export type NullValue = {
    type: 'NullValue',
    value: null
}

export type IntValue = {
    type: 'IntValue',
    value: number
}

export type BoolValue = {
    type: 'BoolValue',
    value: boolean
}

export type Environment = {
    variables: Map<string,
        NullValue | IntValue | BoolValue
    >,
    functions: Map<string, DefinedFunction | EmbeddedFunction>;
}
