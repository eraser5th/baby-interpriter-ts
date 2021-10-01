export type NullValue = { type: 'NullValue', isError: false }
export type IntValue = { type: 'IntValue', isError: false, value: number }
export type BoolValue = { type: 'BoolValue', isError: false, value: boolean }
export type Environment = { variables: Map<any, any>, functions: Map<any, any> }
