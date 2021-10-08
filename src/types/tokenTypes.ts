type Parens = 'LParen' | 'RParen'
type Braces = 'LBrace' | 'RBrace'
type Symbols = 'Asterisk' | 'Equal' | 'Plus' | 'Minus' | Parens | Braces | 'Comma' | 'Semicolon'
type SymbolToken = { type: Symbols }
type UnknownCharacterToken = {
    type: 'UnknownCharacter',
    value: string
}
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
type IfToken = { type: 'If' }
type DefToken = { type: 'Def' }
type NullToken = { type: 'Null' }
type KeywordToken = BoolToken | IfToken | DefToken | NullToken
export type Token = SymbolToken | UnknownCharacterToken | IdentToken | IntToken | KeywordToken
export type Tokens = Token[]
