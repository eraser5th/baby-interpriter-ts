/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import { Environment, NullValue } from './valueTypes';
import { Statement } from './statementAssignmentTypes';

export type Owa = {
    type: string,
    isError: boolean,
    message: string
}

type TypeErrorResult = {
    type: 'TypeError',
    isError: true,
    message: string,
}

export type OwaOwary = {
  result: Owa | TypeErrorResult
  environment: Environment
}

export type EvaluatorError = (
    type: Statement,
    environment: Environment
) => OwaOwary
export type TypeError = (
    type: Statement,
    environment: Environment
) => OwaOwary
export type EvaluateStatements = (
    statements: Statement[],
    environment: Environment
) => OwaOwary | NullValue
