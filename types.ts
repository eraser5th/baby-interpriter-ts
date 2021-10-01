/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

// ******************************   Token   *************************************************************** {{{
type Parens = 'LParen' | 'RParen'
type Braces = 'LBrace' | 'RBrace'

type Symbols = 'Asterisk' | 'Equal' | 'Plus' | 'Minus' | Parens | Braces | 'Comma' | 'Semicolon'

type SymbolToken = { type: Symbols }
type UnknownCharacterToken = { type: 'UnknownCharacter', value: string }

type IdentToken = { type: 'Ident', name: string }
type IntToken = { type: 'Int', value: number }

type BoolToken = { type: 'Bool', value: boolean }
type IfToken = { type: 'If' }
type DefToken = { type: 'Def' }
type NullToken = { type: 'Null' }

type KeywordToken = BoolToken | IfToken | DefToken | NullToken

type Token = SymbolToken | UnknownCharacterToken | IdentToken | IntToken | KeywordToken

export type Tokens = Token[]
// ********************************************************************************************************/ }}}

// *****************************  Expression  **********************************************************/ {{{
type IntLiteral = { type: 'IntLiteral', value: number }
type BoolLiteral = { type: 'BoolLiteral', value: boolean }
type NullLiteral = { type: 'NullLiteral' }

type Literal = IntLiteral | BoolLiteral | NullLiteral
type Variable = {
    type: 'Variable',
    name: string
}
type FuncCall = {
    type: 'FuncCall',
    name: string,
    arguments: Expression[]
}
type InfixOperator = 'Sub' | 'Add' | 'Mul' | 'Div'
type AddSubMulDiv = {
    type: InfixOperator,
    left: Expression | AddSubMulDiv | FuncCall | Literal | Variable,
    right: Expression | AddSubMulDiv | FuncCall | Literal | Variable
}

export type Expression = {
    expression: Expression | AddSubMulDiv | FuncCall | Literal | Variable
    parsedTokensCount: number
}

export type InvalidExpression = {
    expression: null,
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
    args: Expression[],
    parsedTokensCount: number
} | null

export type ParseFunctionCallExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseMulDivExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseAddSubExpression = (tokens: Tokens) => Expression | InvalidExpression

export type ParseExpression = (tokens: Tokens) => Expression | InvalidExpression
// *****************************************************************************************************/ }}}

// *******************************    Statement & Assignment    ****************************************/ {{{
type NullStatement = { statements: null }

export type ParseBlock = (tokens: Tokens) => {
    statements: Statement[],
    parsedTokensCount: number
} | NullStatement

type IfStatement = {
    type: 'If',
    condition: Expression,
    statements: Statement[]
}

export type ParseIfStatement = (tokens: Tokens) => {
    ifStatement: IfStatement
} | { ifStatement: null }

type Assignment = {
    type: 'Assignment',
    name: string,
    expression: Expression
}

type NullAssignment = { assignment: null }

export type ParseAssignment = (tokens: Tokens) => {
    assignment: Assignment
    parsedTokensCount: number,
} | NullAssignment

export type ParseStatement = (tokens: Tokens) => {
    statement: Expression,
    parsedTokensCount: number,
} | {
    assignment: Assignment
    parsedTokensCount: number,
} | {
    statement: IfStatement
    parsedTokensCount: number,
} | { statement: null }

export type ParseCommaSeparatedIdentifiers = (tokens: Tokens) => {
    names: [],
    parsedTokensCount: 0,
} | {
    names: string[],
    parsedTokensCount: number,
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
