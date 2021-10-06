/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import {
  BoolValue,
  Environment,
  IntValue,
  NullValue,
  Value,
} from './valueTypes';

import {
  Source,
  Statement,
  Assignment,
  IfStatement,
  DefineFunction,
} from './statementAssignmentTypes';

import {
  AddSubMulDiv,
  Variable,
  Literal,
  FuncCall,
  Expression,
} from './expressionTypes';

type ASTTypes = 'ASTNullValue' | 'AssignVariables' | 'GetVariable' | 'ASTIntValue' | 'ASTBoolValue' | 'Message'

export type TypeResult = {
  type: ASTTypes
  isError: boolean,
  message: string
}

type TypeErrorResult = {
  type: 'TypeError',
  isError: true,
  message: string,
}

type EvaluatorErrorResult = {
  type: 'EvaluatorError',
  isError: true,
  message: string,
}

type ErrorResult = TypeErrorResult | EvaluatorErrorResult

export type Message = {
  type: 'Message'
  result: TypeResult | ErrorResult
  environment: Environment
}

export type EvaluatorError = (
  stmt: Statement,
  environment: Environment
) => {
  type: 'Message'
  result: EvaluatorErrorResult
  environment: Environment
}

export type TypeError = (
  stmt: Statement | Value | TypeResult,
  environment: Environment
) => {
  type: 'Message'
  result: TypeErrorResult
  environment: Environment
}

export type EvaluateStatements = (
  statements: Statement[],
  environment: Environment
) => Message | NullValue

export type EvaluateIfStatement = (
  ast: IfStatement,
  // Todo
  // Fixed: To Environment from any by matumoto
  initialEnvironment: Environment
) => Message | NullValue

export type EvaluateAddSubMulDiv = (
  ast: AddSubMulDiv,
  environment: Environment
) => Message


export type AssignVariables = {
  type: 'AssignVariables',
  result: NullValue,
  environment: Environment
}

export type GetVariable = {
  type: 'GetVariable',
  result: Value,
  environment: Environment
}

export type ASTIntValue = {
  type: 'ASTIntValue',
  result: IntValue,
  environment: Environment,
}

export type ASTBoolValue = {
  type: 'ASTBoolValue',
  result: BoolValue,
  environment: Environment,
};

export type ASTNullValue = {
  type: 'ASTNullValue',
  result: NullValue,
  environment: Environment,
}

export type ASTValue = ASTIntValue | ASTBoolValue | ASTNullValue

export type EvaluateAST = (
  ast: Statement | DefineFunction,
  environment: Environment
) => Message | AssignVariables | GetVariable | ASTValue

export type Evaluate = (
  ast: Source,
  environment: Environment,
) => Message | AssignVariables | GetVariable | ASTValue
