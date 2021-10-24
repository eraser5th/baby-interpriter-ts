import { DefineFunction, Statement } from './statementTypes';

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

export type EmbeddedFunction = {
    type: 'EmbeddedFunction',
    function: Function,
    argumentsCount: number
  }

export type DefinedFunction = {
    type: 'DefinedFunction',
    statements: (Statement | DefineFunction)[],
    arguments: string[],
    argumentsCount: number
  }

export type Func = EmbeddedFunction | DefinedFunction

export type Environment = {
    variables: Map<string,
        NullValue | IntValue | BoolValue
    >,
    functions: Map<string, Func>;
}
