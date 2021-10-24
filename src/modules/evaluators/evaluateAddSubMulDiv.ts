import { AstEvaluator } from '../../types/evaluatorTypes';
import { AddSubMulDiv } from '../../types/expressionTypes';
import { IntValue } from '../../types/valueTypes';
import typeError from '../errors/typeError';
import evaluate from '../evaluator';
import { intValue } from '../value';

export const evaluateAdd: AstEvaluator<AddSubMulDiv, IntValue> = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) {
    return leftEvalRes;
  }
  if (leftEvalRes.result.type !== 'IntValue') {
    return typeError(leftEvalRes.result.type, leftEvalRes.environment);
  }

  const rightEvalRes = evaluate(ast.right, leftEvalRes.environment);
  if (rightEvalRes.isError) {
    return rightEvalRes;
  }
  if (rightEvalRes.result.type !== 'IntValue') {
    return typeError(rightEvalRes.result.type, environment);
  }

  return {
    result: intValue(leftEvalRes.result.value + rightEvalRes.result.value),
    isError: false,
    environment: rightEvalRes.environment,
  };
};

export const evaluateSub: AstEvaluator<AddSubMulDiv, IntValue> = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) {
    return leftEvalRes;
  }
  if (leftEvalRes.result.type !== 'IntValue') {
    return typeError(leftEvalRes.result.type, leftEvalRes.environment);
  }

  const rightEvalRes = evaluate(ast.right, leftEvalRes.environment);
  if (rightEvalRes.isError) {
    return rightEvalRes;
  }
  if (rightEvalRes.result.type !== 'IntValue') {
    return typeError(rightEvalRes.result.type, environment);
  }

  return {
    result: intValue(leftEvalRes.result.value - rightEvalRes.result.value),
    isError: false,
    environment: rightEvalRes.environment,
  };
};

export const evaluateMul: AstEvaluator<AddSubMulDiv, IntValue> = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) {
    return leftEvalRes;
  }
  if (leftEvalRes.result.type !== 'IntValue') {
    return typeError(leftEvalRes.result.type, leftEvalRes.environment);
  }

  const rightEvalRes = evaluate(ast.right, leftEvalRes.environment);
  if (rightEvalRes.isError) {
    return rightEvalRes;
  }
  if (rightEvalRes.result.type !== 'IntValue') {
    return typeError(rightEvalRes.result.type, environment);
  }

  return {
    result: intValue(leftEvalRes.result.value * rightEvalRes.result.value),
    isError: false,
    environment: rightEvalRes.environment,
  };
};

export const evaluateDiv: AstEvaluator<AddSubMulDiv, IntValue> = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) {
    return leftEvalRes;
  }
  if (leftEvalRes.result.type !== 'IntValue') {
    return typeError(leftEvalRes.result.type, leftEvalRes.environment);
  }

  const rightEvalRes = evaluate(ast.right, leftEvalRes.environment);
  if (rightEvalRes.isError) {
    return rightEvalRes;
  }
  if (rightEvalRes.result.type !== 'IntValue') {
    return typeError(rightEvalRes.result.type, environment);
  }

  return {
    result: intValue(leftEvalRes.result.value / rightEvalRes.result.value),
    isError: false,
    environment: rightEvalRes.environment,
  };
};
