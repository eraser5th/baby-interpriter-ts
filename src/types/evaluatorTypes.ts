/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue, Environment, IntValue, NullValue,
} from './valueTypes';
import {
  DefineFunction, IfStatement, Source, Statement,
} from './statementTypes';
import { AddSubMulDiv } from './expressionTypes';

type EvaluatorErrorResult = {
    type: 'EvaluatorError',
    message: string
}

type EvaluatorErrorResponse = {
    result: EvaluatorErrorResult,
    environment: Environment,
    isError: true,
}

export type EvaluatorError = (
    type: string,
    environment: Environment
) => EvaluatorErrorResponse

type TypeErrorResult = {
    type: 'TypeError',
    message: string,
}

type TypeErrorResponse = {
    result: TypeErrorResult,
    environment: Environment,
    isError: true,
}

export type TypeError = (
    type: string,
    environment: Environment
) => TypeErrorResponse

export type ValueResponse = {
    result: NullValue | IntValue | BoolValue
    isError: false,
    environment: Environment
}

export type EvaluatePartsOfSource = (
    statements: (Statement | DefineFunction)[],
    environment: Environment
) => ValueResponse | EvaluatorErrorResponse | TypeErrorResponse

export type EvaluateIfStatement = (
    ast: IfStatement,
    initialEnvironment: Environment
) => ValueResponse | EvaluatorErrorResponse | TypeErrorResponse

export type EvaluateAdd = (
    ast: AddSubMulDiv,
    environment: Environment
) => {
    result: IntValue,
    isError: false,
    environment: Environment
} | TypeErrorResponse | EvaluatorErrorResponse

export type Evaluate = (
    ast: Statement | Source | DefineFunction,
    environment: Environment
) => ValueResponse | TypeErrorResponse | EvaluatorErrorResponse
