/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import {
  Expression, InvalidExpression, AddSubMulDiv, FuncCall, Literal, Variable,
} from './expressionTypes';
import { Tokens } from './tokenTypes';

type IfStatement = {
    type: 'If',
    condition: Expression,
    statements: (Statement)[]
}
type InvalidIfStatement = {ifStatement: null, parsedTokensCount: undefined}

export type ParseIfStatement = (tokens: Tokens) => {
    ifStatement: IfStatement
    parsedTokensCount: number
} | InvalidIfStatement

type Assignment = {
    type: 'Assignment',
    name: string,
    expression: Expression | AddSubMulDiv | FuncCall | Literal | Variable
}

type InvalidAssignment = {assignment: null, parsedTokensCount: undefined}

export type ParseAssignment = (tokens: Tokens) => {
    assignment: Assignment
    parsedTokensCount: number,
} | InvalidAssignment

export type ParseStatement = (tokens: Tokens) => {
    statement: Expression | Assignment | IfStatement | AddSubMulDiv | FuncCall | Literal | Variable
    parsedTokensCount: number,
} | { statement: null}

export type ParseCommaSeparatedIdentifiers = (tokens: Tokens) => {
    names: [],
    parsedTokensCount: 0,
} | {
    names: string[],
    parsedTokensCount: number,
}

type Statement = {
    statement: Expression | IfStatement | Assignment,
    parsedTokensCount: number
}

type DefineFunction = {
    type: 'FuncDef',
    name: string,
    arguments: string[],
    statements: Statement[]
}

type NullDefine = { define: null }

export type ParseDefineFunction = (tokens: Tokens) => {
    defineFunction: DefineFunction,
    parsedTokensCount: number,
} | NullDefine

type Source = {
    type: 'Source';
    statements: Statements;
}
type SyntaxError = {
    type: 'SyntaxError',
    message: string,
    headToken: string,
}

export type ParseSource = (tokens: Tokens) => Source | SyntaxError
