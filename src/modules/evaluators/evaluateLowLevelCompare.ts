/* eslint-disable no-unused-vars */
import { AstEvaluator, ErrorResponse } from '../../types/evaluatorTypes';
import { LowLevelCompare } from '../../types/expressionTypes';
import { BoolValue, Environment } from '../../types/valueTypes';
import evaluate from '../evaluator';

type CompareResult = {
    type: 'CompareResult',
    boolValue: boolean,
    value: number | boolean | null
}

type ComputeLowLevelCompare = (
    ast: LowLevelCompare,
    environment: Environment
) => {
    result: CompareResult,
    environment: Environment,
    isError: false
} | ErrorResponse

const computeLowLevelCompare: ComputeLowLevelCompare = (ast, environment) => {
  let leftEvalRes;
  if (ast.left.type === 'LowLevelCompare') {
    leftEvalRes = computeLowLevelCompare(ast.left, environment);
  } else {
    leftEvalRes = evaluate(ast.left, environment);
  }
  if (leftEvalRes.isError) return leftEvalRes;

  const rightEvalRes = evaluate(ast.right, environment);
  if (rightEvalRes.isError) return rightEvalRes;
  // eslint-disable-next-line no-eval
  let nextBoolValue: boolean = eval(`${leftEvalRes.result.value} ${ast.kindOfCompare} ${rightEvalRes.result.value}`);
  if (leftEvalRes.result.type === 'CompareResult') {
    nextBoolValue = leftEvalRes.result.boolValue && nextBoolValue;
  }
  return {
    result: {
      type: 'CompareResult',
      boolValue: nextBoolValue,
      value: rightEvalRes.result.value,
    },
    isError: false,
    environment,
  };
};

const evaluateLowLevelCompare: AstEvaluator<LowLevelCompare, BoolValue> = (ast, environment) => {
  let leftEvalRes;
  if (ast.left.type === 'LowLevelCompare') {
    leftEvalRes = computeLowLevelCompare(ast.left, environment);
  } else {
    leftEvalRes = evaluate(ast.left, environment);
  }
  if (leftEvalRes.isError) return leftEvalRes;

  const rightEvalRes = evaluate(ast.right, environment);
  if (rightEvalRes.isError) return rightEvalRes;
  // eslint-disable-next-line no-eval
  let resultValue: boolean = eval(`${leftEvalRes.result.value} ${ast.kindOfCompare} ${rightEvalRes.result.value}`);
  if (leftEvalRes.result.type === 'CompareResult') {
    resultValue = leftEvalRes.result.boolValue && resultValue;
  }
  return {
    result: {
      type: 'BoolValue',
      value: resultValue,
    },
    isError: false,
    environment,
  };
};

export default evaluateLowLevelCompare;
