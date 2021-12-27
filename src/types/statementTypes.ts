/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import {
  Expression, InvalidExpression, AddSubMulDiv, FuncCall, Literal, Variable,
} from './expressionTypes';
import { Token, Tokens } from './tokenTypes';

type InvalidStatements = {
    statements: null,
    parsedTokensCount: undefined
}

export type ParseBlock = (tokens: Tokens) => {
    statements: Statement[],
    parsedTokensCount: number
} | InvalidStatements

export type IfStatement = {
    type: 'If',
    condition: Expression,
    ifStatements: Statement[],
    elseStatements: Statement[]
}

type InvalidIfStatement = { ifStatement: null, parsedTokensCount: undefined }

export type ParseIfStatement = (tokens: Tokens) => {
    ifStatement: IfStatement
    parsedTokensCount: number
} | InvalidIfStatement

type ElseStatement = {
    type: 'Else',
    statements: Statement[]
}

export type ParseElseStatement = (tokens: Tokens) => {
    elseStatement: ElseStatement,
    isError: false,
    parsedTokensCount: number,
} | {
    elseStatement: null,
    isError: boolean,
    parsedTokensCount: undefined,
}

export type Assignment = {
    type: 'Assignment',
    name: string,
    expression: Expression
}

type InvalidAssignment = {assignment: null, parsedTokensCount: undefined}

export type ParseAssignment = (tokens: Tokens) => {
    assignment: Assignment
    parsedTokensCount: number,
} | InvalidAssignment

type InvalidForStatement = {forStatement: null, parsedTokensCount: undefined}

export type ForStatement = {
    type: 'For',
    initialization: Statement,
    termination: Expression,
    increment: Statement,
    statements: Statement[]
}

export type ParseForStatement = (tokens: Tokens) => {
    forStatement: ForStatement
    parsedTokensCount: number
} | InvalidForStatement

export type ParseStatement = (tokens: Tokens) => StatementWithCount | InvalidStatement

export type ParseCommaSeparatedIdentifiers = (tokens: Tokens) => {
    names: [],
    parsedTokensCount: 0,
} | {
    names: string[],
    parsedTokensCount: number,
}

export type Statement = IfStatement | Assignment | Expression | ForStatement

export type StatementWithCount = {
    statement: Statement,
    parsedTokensCount: number
}

export type InvalidStatement = {
    statement: null
    parsedTokensCount: undefined
}

export type DefineFunction = {
    type: 'FuncDef',
    name: string,
    arguments: string[],
    statements: Statement[]
}

type InvalidDefineFunction = { defineFunction: null, parsedTokensCount: undefined }

export type ParseDefineFunction = (tokens: Tokens) => {
    defineFunction: DefineFunction,
    parsedTokensCount: number,
} | InvalidDefineFunction

export type Source = {
    type: 'Source';
    partsOfSource: (Statement | DefineFunction)[];
}
export type SyntaxError = {
    type: 'SyntaxError',
    message: string,
    headToken: Token,
}

export type ParseSource = (tokens: Tokens) => Source | SyntaxError
