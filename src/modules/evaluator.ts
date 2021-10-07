/* eslint-disable no-use-before-define */

import {
  boolValue,
  intValue,
  nullValue,
} from './value';

import {
  EvaluatorError,
  TypeError,
  ValueResponse,
  EvaluateIfStatement,
  EvaluateAdd,
  Evaluate,
  EvaluatePartsOfSource,
} from './evaluatorTypes';
import { BoolValue, IntValue, NullValue } from './valueTypes';

const evaluatorError: EvaluatorError = (type, environment) => ({
  result: {
    type: 'EvaluatorError',
    message: `無効なast\`${type}\`が渡されました`,
  },
  isError: true,
  environment,
});

const typeError: TypeError = (type, environment) => ({
  result: {
    type: 'TypeError',
    message: `無効な型\`${type}\`が渡されました`,
  },
  isError: true,
  environment,
});

const evaluatePartsOfSource: EvaluatePartsOfSource = (statements, environment) => {
  let result: IntValue | BoolValue | NullValue = nullValue;
  let env = environment;
  // forEachではreturnを使って値を返せないので書きづらく、
  // またreduceでは条件分岐が複雑になり書きづらいので、for文を使って処理しています
  // eslint-disable-next-line no-restricted-syntax
  for (const stmt of statements) {
    const evalResult = evaluate(stmt, env);
    if (evalResult.isError) {
      return evalResult;
    }
    if (evalResult === null) {
      return evaluatorError(stmt.type, env);
    }
    result = evalResult.result;
    env = evalResult.environment;
  }
  const res: ValueResponse = {
    result,
    isError: false,
    environment: env,
  };
  return res;
};

const evaluateIfStatement: EvaluateIfStatement = (ast, initialEnvironment) => {
  const { condition, statements } = ast;
  const evalResult = evaluate(condition, initialEnvironment);
  if (evalResult.isError) return evalResult;

  const { result, environment: halfwayEnvironment } = evalResult;
  if ((result.type === 'BoolValue' && result.value === false) || result.type === 'NullValue') {
    return {
      result: nullValue,
      isError: false,
      environment: halfwayEnvironment,
    };
  }
  return evaluatePartsOfSource(statements, halfwayEnvironment);
};

const evaluateAdd: EvaluateAdd = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) return leftEvalRes;
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

const evaluate: Evaluate = (ast, environment) => {
  switch (ast.type) {
    case 'Source':
      return evaluatePartsOfSource(ast.partsOfSource, environment);
    case 'Assignment':
      return {
        result: nullValue,
        isError: false,
        environment: {
          variables: new Map(environment.variables).set(
            ast.name,
            evaluate(ast.expression, environment).result,
          ),
          functions: environment.functions,
        },
      };
    case 'If':
      return evaluateIfStatement(ast, environment);
    case 'Add':
      return evaluateAdd(ast, environment);
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
