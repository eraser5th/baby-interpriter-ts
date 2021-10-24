/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue, Environment, IntValue, NullValue,
} from './valueTypes';
import {
  Assignment,
  DefineFunction, IfStatement, Source, Statement,
} from './statementTypes';
import {
  AddSubMulDiv,
  AndOperation,
  Expression,
  FuncCall,
  HighLevelCompare,
  LowLevelCompare,
  OrOperation,
  UnaryOperator,
} from './expressionTypes';

export type EachErrorResponse<resultType> = {
    result: resultType,
    environment: Environment,
    isError: true,
}

//* **************************************
export type EvaluatorErrorResult = { type: 'EvaluatorError', message: string }

export type EvaluatorErrorResponse = EachErrorResponse<EvaluatorErrorResult>

export type EvaluatorError = (type: string, environment: Environment) => EvaluatorErrorResponse
//* **************************************
export type TypeErrorResult = { type: 'TypeError', message: string }

export type TypeErrorResponse = EachErrorResponse<TypeErrorResult>

export type TypeError = (type: string, environment: Environment) => TypeErrorResponse
//* **************************************
export type ArgumentsCountErrorResult = { type: 'ArgumentsCountError', message: string }

export type ArgumentsCountErrorResponse = EachErrorResponse<ArgumentsCountErrorResult>

export type ArgumentsCountError = (
    name: string,
    want: number,
    got: number,
    environment: Environment
) => ArgumentsCountErrorResponse
//* **************************************
export type UndefinedFunctionErrorResult = { type: 'UndefinedFunctionError', message: string }

export type UndefinedFunctionErrorResponse = EachErrorResponse<UndefinedFunctionErrorResult>

export type UndefinedFunctionError = (
    name: string,
    environment: Environment
) => UndefinedFunctionErrorResponse
//* **************************************
export type FunctionTypeErrorResult = { type: 'FunctionTypeError', message: string }

export type FunctionTypeErrorResponse = EachErrorResponse<FunctionTypeErrorResult>

export type FunctionTypeError = () => {}
//* **************************************

export type ErrorResponse = EvaluatorErrorResponse |
TypeErrorResponse |
FunctionTypeErrorResponse |
UndefinedFunctionErrorResponse |
ArgumentsCountErrorResponse

export type ValueResponse<T> = {
    result: T,
    environment: Environment,
    isError: false
}
//* **************************************
export type UnwrapObject = (
    obj: IntValue | BoolValue | NullValue
) => null | number | boolean

export type WrapObject = (
    obj: any
) => IntValue | BoolValue | NullValue
//* **************************************

//* **************************************

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
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

export type ComputeFunction = (
    func: Func,
    name: string,
    args: (IntValue | BoolValue | NullValue)[],
    env: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

export type EvaluateFunctionCalling = (
    calling: FuncCall,
    environment: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

export type EvaluateFunctionDefinition = (
    funcDef: DefineFunction,
    environment: Environment
) => ValueResponse<NullValue>
//* **************************************

export type EvaluatePartsOfSource = (
    statements: (Statement | DefineFunction)[],
    environment: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

type CompareResult = {
    type: 'CompareResult',
    boolValue: boolean,
    value: number | boolean | null
}

export type ComputeHighLevelCompare =(
    ast: HighLevelCompare,
    environment: Environment
) => {
    result: CompareResult,
    environment: Environment,
    isError: false
} | ErrorResponse

export type ComputeLowLevelCompare = (
    ast: LowLevelCompare,
    environment: Environment
) => {
    result: CompareResult,
    environment: Environment,
    isError: false
} | ErrorResponse

type DummyAst = {type: 'DummyAst'}

export type AstEvaluator<
    astType extends Statement | Source | DefineFunction | DummyAst,
    resultType extends BoolValue | IntValue | NullValue
> = (
    ast: astType,
    environment: Environment
) => ValueResponse<resultType> | ErrorResponse
