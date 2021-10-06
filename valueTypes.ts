export type NullValue = { type: 'NullValue', isError: false ,value: null}
export type IntValue = { type: 'IntValue', isError: false, value: number }
export type BoolValue = { type: 'BoolValue', isError: false, value: boolean }
// TODO: Implement StringValue

export type Value = NullValue | IntValue | BoolValue

export type Environment = {
    variables: Map<string, Value>,
    functions: Map<string, Value>
}
