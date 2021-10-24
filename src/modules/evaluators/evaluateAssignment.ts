import { AstEvaluator } from '../../types/evaluatorTypes';
import { Assignment } from '../../types/statementTypes';
import { NullValue } from '../../types/valueTypes';
import evaluate from '../evaluator';
import { nullValue } from '../value';

const evaluateAssignment: AstEvaluator<Assignment, NullValue> = (ast, environment) => {
  const evalResult = evaluate(ast.expression, environment);
  if (evalResult.isError) return evalResult;
  return {
    result: nullValue,
    isError: false,
    environment: {
      variables: new Map(environment.variables).set(
        ast.name,
        evalResult.result,
      ),
      functions: environment.functions,
    },
  };
};

export default evaluateAssignment;
