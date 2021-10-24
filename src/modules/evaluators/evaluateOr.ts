import { AstEvaluator } from '../../types/evaluatorTypes';
import { OrOperation } from '../../types/expressionTypes';
import { BoolValue, IntValue, NullValue } from '../../types/valueTypes';
import evaluate from '../evaluator';

const evaluateOr: AstEvaluator<
  OrOperation, BoolValue | IntValue | NullValue
> = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) return leftEvalRes;

  const rightEvalRes = evaluate(ast.right, environment);
  if (rightEvalRes.isError) return rightEvalRes;

  const value = leftEvalRes.result.value || rightEvalRes.result.value;
  if (typeof value === 'number') {
    return {
      result: {
        type: 'IntValue',
        value,
      },
      isError: false,
      environment,
    };
  } if (typeof value === 'boolean') {
    return {
      result: {
        type: 'BoolValue',
        value,
      },
      isError: false,
      environment,
    };
  }
  return {
    result: {
      type: 'NullValue',
      value,
    },
    isError: false,
    environment,
  };
};

export default evaluateOr;
