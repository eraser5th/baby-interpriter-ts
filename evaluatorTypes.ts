/* eslint-disable no-unused-vars */
import { Environment } from './valueTypes';
import { Statement } from './statementAssignmentTypes';

type Owa = {
  type: string,
  isError: boolean,
  message: string
}

export type OwaOwary = {
  result: Owa,
  environment: Environment
}

export type EvaluatorError = (type: Statement, envrionment: Environment) => OwaOwary
export type TypeError = (type: Statement, environment: Environment) => OwaOwary
export type EvaluateStatements = (statements: Statement[], environment: Environment) => OwaOwary
