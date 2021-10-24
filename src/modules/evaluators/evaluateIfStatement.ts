import { AstEvaluator } from '../../types/evaluatorTypes';
import { IfStatement } from '../../types/statementTypes';
import { BoolValue, IntValue, NullValue } from '../../types/valueTypes';
import evaluate from '../evaluator';
import evaluatePartsOfSource from './evaluatePartsOfSource';

const evaluateIfStatement: AstEvaluator<
  IfStatement, BoolValue | IntValue | NullValue
> = (ast, initialEnvironment) => {
  const { condition, ifStatements, elseStatements } = ast;
  const evalResult = evaluate(condition, initialEnvironment);
  if (evalResult.isError) return evalResult;

  const { result, environment: halfwayEnvironment } = evalResult;
  if ((result.type === 'BoolValue' && result.value === false) || result.type === 'NullValue') {
    return evaluatePartsOfSource(elseStatements, halfwayEnvironment);
  }
  return evaluatePartsOfSource(ifStatements, halfwayEnvironment);
};

export default evaluateIfStatement;
