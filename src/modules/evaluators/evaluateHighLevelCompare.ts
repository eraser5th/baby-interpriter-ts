/* eslint-disable no-unused-vars */
import { AstEvaluator, ErrorResponse } from '../../types/evaluatorTypes';
import { HighLevelCompare } from '../../types/expressionTypes';
import { BoolValue, Environment } from '../../types/valueTypes';
import evaluate from '../evaluator';

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

const computeHighLevelCompare: ComputeHighLevelCompare = (ast, environment) => {
  let leftEvalRes;
  if (ast.left.type === 'HighLevelCompare') {
    leftEvalRes = computeHighLevelCompare(ast.left, environment);
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

const evaluateHighLevelCompare: AstEvaluator<HighLevelCompare, BoolValue> = (ast, environment) => {
  let leftEvalRes;
  if (ast.left.type === 'HighLevelCompare') {
    leftEvalRes = computeHighLevelCompare(ast.left, environment);
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

export default evaluateHighLevelCompare;
