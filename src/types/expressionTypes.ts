/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { Tokens } from './tokenTypes';

type IntLiteral = { type: 'IntLiteral', value: number }
type BoolLiteral = { type: 'BoolLiteral', value: boolean }
type NullLiteral = { type: 'NullLiteral' }
export type Literal = IntLiteral | BoolLiteral | NullLiteral

export type Variable = {
    type: 'Variable',
    name: string
}

export type FuncCall = {
    type: 'FuncCall',
    name: string,
    arguments: Expression[]
}

type InfixOperation<T> = {
    type: T,
    left: Expression,
    right: Expression
}

export type AddSubMulDiv = InfixOperation<'Sub' | 'Add' | 'Mul' | 'Div'>

export type OrOperation = InfixOperation<'OrOperation'>

export type AndOperation = InfixOperation<'AndOperation'>

export type LogicalOperation = OrOperation | AndOperation

export type UnaryOperator = {
    type: 'UnaryPlus' | 'UnaryMinus' | 'UnaryNot',
    expression: Expression
}

export type HighLevelCompare = {
    type: 'HighLevelCompare',
    kindOfCompare: '===' | '!==' | '<=' | '<',
    left: Expression,
    right: Expression
}
export type LowLevelCompare = {
    type: 'LowLevelCompare',
    kindOfCompare: '===' | '!==',
    left: Expression,
    right: Expression
}

export type Compare = HighLevelCompare | LowLevelCompare

export type Expression = Literal | Variable | FuncCall | AddSubMulDiv | UnaryOperator | Compare | LogicalOperation

export type InvalidExpression = {
    expression: null,
    parsedTokensCount: undefined
}

export type InvalidArguments = {
    args: null,
    parsedTokensCount: undefined
}

export type ParseCommaSeparatedExpressions = (tokens: Tokens) => {
    args: (Expression | AddSubMulDiv | FuncCall | Literal | Variable)[],
    parsedTokensCount: number
} | InvalidArguments

export type ExpressionParser<expressionType, count extends number> = (tokens: Tokens) => {
    expression: expressionType,
    parsedTokensCount: count
} | InvalidExpression
