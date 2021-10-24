/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue, Environment, IntValue, NullValue,
} from './valueTypes';
import { DefineFunction, Source, Statement } from './statementTypes';
import {
  Expression, FuncCall, HighLevelCompare, LowLevelCompare,
} from './expressionTypes';

//* **************************************
type EachErrorResponse<resultType> = {
    result: resultType,
    environment: Environment,
    isError: true,
}

type EvaluatorErrorResult = { type: 'EvaluatorError', message: string }

export type EvaluatorErrorResponse = EachErrorResponse<EvaluatorErrorResult>

export type EvaluatorError = (type: string, environment: Environment) => EvaluatorErrorResponse

type TypeErrorResult = { type: 'TypeError', message: string }

export type TypeErrorResponse = EachErrorResponse<TypeErrorResult>

export type TypeError = (type: string, environment: Environment) => TypeErrorResponse

type ArgumentsCountErrorResult = { type: 'ArgumentsCountError', message: string }

export type ArgumentsCountErrorResponse = EachErrorResponse<ArgumentsCountErrorResult>

export type ArgumentsCountError = (
    name: string,
    want: number,
    got: number,
    environment: Environment
) => ArgumentsCountErrorResponse

type UndefinedFunctionErrorResult = { type: 'UndefinedFunctionError', message: string }

export type UndefinedFunctionErrorResponse = EachErrorResponse<UndefinedFunctionErrorResult>

export type UndefinedFunctionError = (
    name: string,
    environment: Environment
) => UndefinedFunctionErrorResponse

type FunctionTypeErrorResult = { type: 'FunctionTypeError', message: string }

export type FunctionTypeErrorResponse = EachErrorResponse<FunctionTypeErrorResult>

export type FunctionTypeError = () => {}

export type ErrorResponse = EvaluatorErrorResponse |
TypeErrorResponse |
FunctionTypeErrorResponse |
UndefinedFunctionErrorResponse |
ArgumentsCountErrorResponse
//* **************************************

export type ValueResponse<T> = {
    result: T,
    environment: Environment,
    isError: false
}

//* **************************************

export type EvaluateFunctionDefinition = (
    funcDef: DefineFunction,
    environment: Environment
) => ValueResponse<NullValue>

export type EvaluateFunctionCalling = (
    calling: FuncCall,
    environment: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

export type EvaluatePartsOfSource = (
    statements: (Statement | DefineFunction)[],
    environment: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

type DummyAst = {type: 'DummyAst'}

export type AstEvaluator<
    astType extends Statement | Source | DefineFunction | DummyAst,
    resultType extends BoolValue | IntValue | NullValue
> = (
    ast: astType,
    environment: Environment
) => ValueResponse<resultType> | ErrorResponse
