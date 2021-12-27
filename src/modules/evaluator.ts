/* eslint-disable no-use-before-define */

import { boolValue, intValue, nullValue } from './value';

import { AstEvaluator } from '../types/evaluatorTypes';
import { BoolValue, IntValue, NullValue } from '../types/valueTypes';
import { DefineFunction, Source, Statement } from '../types/statementTypes';
import evaluatePartsOfSource from './evaluators/evaluatePartsOfSource';
import evaluateIfStatement from './evaluators/evaluateIfStatement';
import {
  evaluateAdd, evaluateDiv, evaluateMul, evaluateSub,
} from './evaluators/evaluateAddSubMulDiv';
import evaluateLowLevelCompare from './evaluators/evaluateLowLevelCompare';
import evaluatorError from './errors/evaluatorError';
import evaluateHighLevelCompare from './evaluators/evaluateHighLevelCompare';
import evaluateUnaryOperator from './evaluators/evaluateUnaryOperator';
import evaluateOr from './evaluators/evaluateOr';
import evaluateAnd from './evaluators/evaluateAnd';
import evaluateFunctionCalling from './evaluators/evaluateFunctionCalling';
import evaluateAssignment from './evaluators/evaluateAssignment';
import evaluateFunctionDefinition from './evaluators/evaluateFunctionDefinition';
import evaluateForStatement from './evaluators/evaluateForStatement';

type DummyAst = {type: 'DummyAst'}

const evaluate: AstEvaluator<
  Statement | Source | DefineFunction | DummyAst,
  BoolValue | IntValue | NullValue
> = (ast, environment) => {
  switch (ast.type) {
    case 'Source':
      return evaluatePartsOfSource(ast.partsOfSource, environment);
    case 'FuncDef':
      return evaluateFunctionDefinition(ast, environment);
    case 'Assignment':
      return evaluateAssignment(ast, environment);
    case 'If':
      return evaluateIfStatement(ast, environment);
    case 'For':
      return evaluateForStatement(ast, environment);
    case 'Add':
      return evaluateAdd(ast, environment);
    case 'Sub':
      return evaluateSub(ast, environment);
    case 'Mul':
      return evaluateMul(ast, environment);
    case 'Div':
      return evaluateDiv(ast, environment);
    case 'UnaryMinus':
    case 'UnaryPlus':
    case 'UnaryNot':
      return evaluateUnaryOperator(ast, environment);
    case 'AndOperation':
      return evaluateAnd(ast, environment);
    case 'OrOperation':
      return evaluateOr(ast, environment);
    case 'HighLevelCompare':
      return evaluateHighLevelCompare(ast, environment);
    case 'LowLevelCompare':
      return evaluateLowLevelCompare(ast, environment);
    case 'FuncCall':
      return evaluateFunctionCalling(ast, environment);
    case 'Variable':
      return {
        result: environment.variables.get(ast.name) || nullValue,
        isError: false,
        environment,
      };
    case 'IntLiteral':
      return {
        result: intValue(ast.value),
        isError: false,
        environment,
      };
    case 'BoolLiteral':
      return {
        result: boolValue(ast.value),
        isError: false,
        environment,
      };
    case 'NullLiteral':
      return {
        result: nullValue,
        isError: false,
        environment,
      };
    default:
      return evaluatorError(ast.type, environment);
  }
};

export default evaluate;
