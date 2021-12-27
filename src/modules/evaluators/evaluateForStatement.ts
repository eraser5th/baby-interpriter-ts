/* eslint-disable no-unused-vars */
import { AstEvaluator, ErrorResponse, ValueResponse } from '../../types/evaluatorTypes';
import { ForStatement } from '../../types/statementTypes';
import { BoolValue, IntValue, NullValue } from '../../types/valueTypes';
import evaluate from '../evaluator';
import { nullValue } from '../value';
import evaluatePartsOfSource from './evaluatePartsOfSource';

const evaluateForStatement: AstEvaluator<
    ForStatement, BoolValue | IntValue | NullValue
> = (ast, environment) => {
  const {
    initialization, termination, increment, statements,
  } = ast;
  const initialRes = evaluate(initialization, environment);
  if (initialRes.isError) return initialRes;
  let terminationRes = evaluate(termination, initialRes.environment);
  if (terminationRes.isError) return terminationRes;
  let incrementRes: ErrorResponse | ValueResponse<IntValue | BoolValue | NullValue> = initialRes;

  let response: ErrorResponse | ValueResponse<BoolValue | IntValue | NullValue> = {
    result: nullValue,
    isError: false,
    environment: terminationRes.environment,
  };
  while (terminationRes.result.value) {
    response = evaluatePartsOfSource(ast.statements, incrementRes.environment);
    if (response.isError) return response;
    incrementRes = evaluate(increment, terminationRes.environment);
    if (incrementRes.isError) return incrementRes;
    terminationRes = evaluate(termination, incrementRes.environment);
    if (terminationRes.isError) return terminationRes;
  }

  return {
    result: response.result,
    isError: false,
    environment: initialRes.environment,
  };
};

export default evaluateForStatement;
