type Parens = 'LParen' | 'RParen'
type Braces = 'LBrace' | 'RBrace'
type CompareSymbol = 'LEqual' | 'LThan' | 'EqualEqual' | 'NotEqual' | 'EqualEqualEqual' | 'NotEqualEqual'
type Symbols = CompareSymbol | 'Asterisk'| 'Slash' | 'Equal' | 'Plus' | 'Minus' | Parens | Braces | 'Comma' | 'Semicolon' | 'Not'
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
type ElseToken = { type: 'Else' }
type DefToken = { type: 'Def' }
type NullToken = { type: 'Null' }
type KeywordToken = BoolToken | IfToken| ElseToken | DefToken | NullToken
export type Token = SymbolToken | UnknownCharacterToken | IdentToken | IntToken | KeywordToken
export type Tokens = Token[]
