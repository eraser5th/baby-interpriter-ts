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

type InfixOperator = 'Sub' | 'Add' | 'Mul' | 'Div'

export type AddSubMulDiv = {
    type: InfixOperator,
    left: Expression
    right: Expression
}

export type UnaryOperator = {
    type: 'UnaryPlus' | 'UnaryMinus',
    expression: Expression
}

export type Expression = Literal | Variable | FuncCall | AddSubMulDiv | UnaryOperator

export type ExpressionWithTokensCount = {
    expression: Expression
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

export type ParseParenthesisExpression = (tokens: Tokens) => ExpressionWithTokensCount | InvalidExpression

export type ParseCommaSeparatedExpressions = (tokens: Tokens) => {
    args: (Expression | AddSubMulDiv | FuncCall | Literal | Variable)[],
    parsedTokensCount: number
} | InvalidArguments

export type ParseUnaryOperator = (tokens: Tokens) => {
    expression: Expression,
    parsedTokensCount: number
} | {
    expression: Literal | Variable;
    parsedTokensCount: 1;
} | InvalidExpression

export type ParseFunctionCallExpression = (tokens: Tokens) => ExpressionWithTokensCount | InvalidExpression

export type ParseMulDivExpression = (tokens: Tokens) => ExpressionWithTokensCount | InvalidExpression

export type ParseAddSubExpression = (tokens: Tokens) => ExpressionWithTokensCount | InvalidExpression

export type ParseExpression = (tokens: Tokens) => ExpressionWithTokensCount | InvalidExpression
