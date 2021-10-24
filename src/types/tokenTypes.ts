type Parens = 'LParen' | 'RParen'
type Braces = 'LBrace' | 'RBrace'
type LogicOpeSymbol = 'Not' | 'PipePipe' | 'AndAnd' | 'And' | 'Pipe'
type CompareSymbol = 'LEqual' | 'LThan' | 'EqualEqual' | 'NotEqual' | 'EqualEqualEqual' | 'NotEqualEqual'
type Symbols = (
    'Asterisk'| 'Slash' | 'Equal' | 'Plus' | 'Minus' |'Comma' | 'Semicolon' |
    CompareSymbol | Parens | Braces |LogicOpeSymbol
)

type SymbolToken = { type: Symbols }
type IdentToken = {
    type: 'Ident',
    name: string
}
type IntToken = {
    type: 'Int',
    value: number
}
type BoolToken = {
    type: 'Bool',
    value: boolean
}
type Keyword = 'If' | 'Else' | 'Def' | 'Null'
type KeywordToken = BoolToken | { type: Keyword }
type UnknownCharacterToken = {
    type: 'UnknownCharacter',
    value: string
}
export type Token = SymbolToken | IdentToken | IntToken | KeywordToken | UnknownCharacterToken
export type Tokens = Token[]
