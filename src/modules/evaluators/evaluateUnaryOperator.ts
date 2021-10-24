import { AstEvaluator } from '../../types/evaluatorTypes';
import { UnaryOperator } from '../../types/expressionTypes';
import { BoolValue, IntValue } from '../../types/valueTypes';
import typeError from '../errors/typeError';
import evaluate from '../evaluator';
import { intValue } from '../value';

const evaluateUnaryOperator: AstEvaluator<
  UnaryOperator, BoolValue | IntValue
> = (ast, environment) => {
  const evalResult = evaluate(ast.expression, environment);
  if (evalResult.isError) {
    return evalResult;
  }
  if (ast.type === 'UnaryNot') {
    return {
      result: {
        type: 'BoolValue',
        value: !evalResult.result.value,
      },
      isError: false,
      environment: evalResult.environment,
    };
  }
  if (evalResult.result.type !== 'IntValue') {
    return typeError(evalResult.result.type, environment);
  }
  if (ast.type === 'UnaryPlus') {
    return {
      result: intValue(evalResult.result.value),
      isError: false,
      environment: evalResult.environment,
    };
  }
  return {
    result: intValue(-evalResult.result.value),
    isError: false,
    environment: evalResult.environment,
  };
};

export default evaluateUnaryOperator;
