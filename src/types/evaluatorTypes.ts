/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue, Environment, IntValue, NullValue,
} from './valueTypes';
import {
  Assignment,
  DefineFunction, IfStatement, Source, Statement,
} from './statementTypes';
import { AddSubMulDiv } from './expressionTypes';

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

export type EvaluateAssignment = (ast: Assignment, environment: Environment) => {
    result: NullValue,
    environment: Environment
    isError: false,
} | TypeErrorResponse | EvaluatorErrorResponse

export type Evaluate = (
    ast: Statement | Source | DefineFunction,
    environment: Environment
) => ValueResponse | TypeErrorResponse | EvaluatorErrorResponse
