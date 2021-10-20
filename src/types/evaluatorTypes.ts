/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue, Environment, IntValue, NullValue,
} from './valueTypes';
import {
  Assignment,
  DefineFunction, IfStatement, Source, Statement,
} from './statementTypes';
import { AddSubMulDiv, Expression, FuncCall } from './expressionTypes';

//* **************************************
export type EvaluatorErrorResult = {
    type: 'EvaluatorError',
    message: string
}
export type EvaluatorErrorResponse = {
    result: EvaluatorErrorResult,
    environment: Environment,
    isError: true,
}
export type EvaluatorError = (
    type: string,
    environment: Environment
) => EvaluatorErrorResponse
//* **************************************

//* **************************************
export type TypeErrorResult = {
    type: 'TypeError',
    message: string,
}
export type TypeErrorResponse = {
    result: TypeErrorResult,
    environment: Environment,
    isError: true,
}
export type TypeError = (
    type: string,
    environment: Environment
) => TypeErrorResponse
//* **************************************

export type ValueResponse = {
    result: NullValue | IntValue | BoolValue
    isError: false,
    environment: Environment
}

//* **************************************
export type ArgumentsCountErrorResult = {
    type: 'ArgumentsCountError',
    message: string
}
export type ArgumentsCountErrorResponse = {
    result: ArgumentsCountErrorResult,
    isError: true,
    environment: Environment
}
export type ArgumentsCountError = (
    name: string,
    want: number,
    got: number,
    environment: Environment
) => ArgumentsCountErrorResponse
//* **************************************

//* **************************************
export type UndefinedFunctionErrorResult = {
    type: 'UndefinedFunctionError',
    message: string
}
export type UndefinedFunctionErrorResponse = {
    result: UndefinedFunctionErrorResult,
    isError: true,
    environment: Environment
}
export type UndefinedFunctionError = (
    name: string,
    environment: Environment
) => UndefinedFunctionErrorResponse
//* **************************************

//* **************************************
export type FunctionTypeErrorResult = {
    type: 'FunctionTypeError',
    message: string
}

export type FunctionTypeErrorResponse = {
    result: FunctionTypeErrorResult,
    isError: true,
    environment: Environment
}

export type FunctionTypeError = () => {}
//* **************************************

//* **************************************
export type UnwrapObject = (
    obj: IntValue | BoolValue | NullValue
) => null | number | boolean

export type WrapObject = (
    obj: any
) => IntValue | BoolValue | NullValue
//* **************************************

//* **************************************

export type ErrorResponse = EvaluatorErrorResponse |
TypeErrorResponse |
FunctionTypeErrorResponse |
UndefinedFunctionErrorResponse |
ArgumentsCountErrorResponse

export type EvaluateArguments = ( // 完了？
    args: Expression[],
    environment: Environment
) => {
    evaluatedArguments: (NullValue | IntValue | BoolValue)[],
    isError: false,
    environment: Environment
} | ErrorResponse

export type EmbeddedFunction = {
    type: 'EmbeddedFunction',
    function: Function,
    argumentsCount: number
}

export type DefinedFunction = {
    type: 'DefinedFunction',
    statements: (Statement | DefineFunction)[],
    arguments: string[],
    argumentsCount: number
}

export type Func = EmbeddedFunction | DefinedFunction

export type EvaluateEmbeddedFunction = (
    func: EmbeddedFunction,
    args: (IntValue | BoolValue | NullValue)[]
) => NullValue | IntValue | BoolValue

export type EvaluateDefinedFunction = (
    func: DefinedFunction,
    args: (IntValue | BoolValue | NullValue)[],
    env: Environment
) => ValueResponse | ErrorResponse

export type ComputeFunction = (
    func: Func,
    name: string,
    args: (IntValue | BoolValue | NullValue)[],
    env: Environment
) => ValueResponse | ErrorResponse

export type EvaluateFunctionCalling = (
    calling: FuncCall,
    environment: Environment
) => ValueResponse | ErrorResponse

export type EvaluateFunctionDefinition = (
    funcDef: DefineFunction,
    environment: Environment
) => {
    result: NullValue,
    isError: false,
    environment: Environment,
}
//* **************************************

export type EvaluatePartsOfSource = (
    statements: (Statement | DefineFunction)[],
    environment: Environment
) => ValueResponse | ErrorResponse

export type EvaluateIfStatement = (
    ast: IfStatement,
    initialEnvironment: Environment
) => ValueResponse | ErrorResponse

export type EvaluateAdd = (
    ast: AddSubMulDiv,
    environment: Environment
) => {
    result: IntValue,
    isError: false,
    environment: Environment
} | ErrorResponse

export type EvaluateAssignment = (
    ast: Assignment,
    environment: Environment
) => {
    result: NullValue,
    environment: Environment
    isError: false,
} | ErrorResponse

type Dummy = {
    type: 'Dummy',
}

export type Evaluate = (
    ast: Statement | Source | DefineFunction | Dummy,
    environment: Environment
) => ValueResponse | ErrorResponse
