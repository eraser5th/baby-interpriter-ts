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
    arguments: (Expression | Literal | Variable | FuncCall | AddSubMulDiv)[]
}
type InfixOperator = 'Sub' | 'Add' | 'Mul' | 'Div'
export type AddSubMulDiv = {
    type: InfixOperator,
    left: Expression | Literal | Variable | FuncCall | AddSubMulDiv
    right: Expression | Literal | Variable | FuncCall | AddSubMulDiv
}
/*
type Expression = {
    expression: Literal,
    parsedTokensCount: 1
} | {
    expression: Variable,
    parsedTokensCount: 1
} | {
    expression: AddSubMulDiv
    parsedTokensCount: number
} | {
    expression: FuncCall
    parsedTokensCount: number
}
*/

export type Expression = {
    expression: AddSubMulDiv | FuncCall | Literal | Variable
    parsedTokensCount: number
}

export type InvalidExpression = {
    expression: null,
    parsedTokensCount: undefined
}
export type InvalidArguments = {
    args: null,
    parsedTokensCount: undefined
}

export type ParseLiteral = (tokens: Tokens) => {
    expression: Literal,
    parsedTokensCount: 1
} | InvalidExpression

export type ParseValue = (tokens: Tokens) => {
    expression: Literal | Variable
    parsedTokensCount: 1
} | InvalidExpression

export type ParseParenthesisExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseCommaSeparatedExpressions = (tokens: Tokens) => {
    args: (Expression | AddSubMulDiv | FuncCall | Literal | Variable)[],
    parsedTokensCount: number
} | InvalidArguments

export type ParseFunctionCallExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseMulDivExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseAddSubExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseExpression = (tokens: Tokens) => Expression | InvalidExpression
