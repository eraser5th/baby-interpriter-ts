export type NullValue = {
    type: 'NullValue',
    value: null
}

export type IntValue = {
    type: 'IntValue',
    value: number
}

export type BoolValue = {
    type: 'BoolValue',
    value: boolean
}

export type Environment = {
    variables: Map<any, any>,
    functions: Map<any, any>
}
