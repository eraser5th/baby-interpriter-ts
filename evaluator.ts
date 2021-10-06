/* eslint-disable no-use-before-define */
/* eslint-disable no-case-declarations */

import {
  intValue,
  nullValue,
  boolValue,
} from './value';

import {
  EvaluatorError,
  TypeError,
  EvaluateStatements,
  EvaluateIfStatement,
  EvaluateAddSubMulDiv,
  EvaluateAST,
  Evaluate,
  ASTNullValue,
  Message,
  AssignVariables,
  GetVariable,
  ASTValue,
} from './evaluatorTypes';
import { Environment } from './valueTypes';

const evaluatorError: EvaluatorError = (stmt, environment) => ({
  type: 'Message',
  result: {
    type: 'EvaluatorError',
    isError: true,
    message: `無効なstatement\`${stmt}\`が渡されました\n\n${stmt}`,
  },
  environment,
});

const typeError: TypeError = (stmt, environment) => ({
  type: 'Message',
  result: {
    type: 'TypeError',
    isError: true,
    message: `無効な型\`${stmt.type}\`が渡されました\n\n${stmt}`,
  },
  environment,
});

const evaluateStatements: EvaluateStatements = (statements, environment) => {
  if (statements.length === 0) return nullValue;
  let result = {
    type: 'TypeError',
    isError: true,
    message: 'This is an initialize message',
  };
  let env = environment;
  // forEachではreturnを使って値を返せないので書きづらく、
  // またreduceでは条件分岐が複雑になり書きづらいので、for文を使って処理しています
  // eslint-disable-next-line no-restricted-syntax
  for (const stmt of statements) {
    const evalResult = evaluateAST(stmt, env);
    result = evalResult.result;
    env = evalResult.environment;
  }
  return { type: 'Message', result, environment: env };
};

const evaluateIfStatement: EvaluateIfStatement = (ast, initialEnvironment) => {
  const { condition, statements } = ast;
  const evalResult = evaluateAST(condition, initialEnvironment);
  if (evalResult.type === 'Message') { return evalResult; }
  if (evalResult.value === false) {
    return {
      result: nullValue,
      environment: evalResult,
    };
  }
  return evaluateStatements(statements, halfwayEnvironment);
};

const evaluateAdd: EvaluateAddSubMulDiv = (ast, environment) => {
  const {
    result: leftResult,
    environment: leftEnvironment,
  } = evaluateAST(ast.left, environment);
  if (leftResult.isError) {
    return { type: 'Message', result: leftResult, environment: leftEnvironment };
  }
  if (leftResult.type !== 'IntValue') {
    return typeError(leftResult, environment);
  }
  const {
    result: rightResult,
    environment: rightEnvironment,
  } = evaluateAST(ast.right, leftEnvironment);
  if (rightResult.isError) {
    return { type: 'Message', result: rightResult, environment: rightEnvironment };
  }
  if (rightResult.type !== 'IntValue') {
    return typeError(rightResult, environment);
  }

  return {
    type: 'Message',
    result: intValue(leftResult.value + rightResult.value),
    environment: rightEnvironment,
  };
};

const evaluateAST: EvaluateAST = (ast, environment) => {
  const astNullValue: ASTNullValue = {
    type: 'ASTNullValue',
    result: nullValue,
    environment,
  };

  switch (ast.type) {
    case 'Assignment':
      const setValue = evaluateAST(ast.expression, environment);
      if(setValue.type === 'Message') {
        return setValue;
      }
      if(setValue.type === 'AssignVariables' || setValue.type === 'GetVariable' || setValue.type === 'ASTNullValue') {
        return astNullValue;
      }
      return {
        type: 'AssignVariables',
        result: nullValue,
        environment: {
          variables: new Map(environment.variables).set(ast.name, setValue.result),
          functions: environment.functions,
        },
      };
    case 'FuncDef':
      // 実装待ちなので、とりあえず evaluatorError を返す
      return {
        type: 'Message',
        result: {
          type: 'EvaluatorError',
          isError: true,
          message: '関数定義は実装中だゾ',
        },
        environment,
      };
    case 'If':
      const ifResult = evaluateIfStatement(ast, environment);
      if(ifResult.type === 'NullValue') {
        return astNullValue;
      }
      return ifResult;
    case 'Add':
      return evaluateAdd(ast, environment);
    case 'Variable':
      const getValue = environment.variables.get(ast.name);
      if(!getValue) {
        return astNullValue;
      }
      return {
        type: 'GetVariable',
        result: getValue,
        environment,
      };
    case 'IntLiteral':
      return {
        type: 'ASTIntValue',
        result: intValue(ast.value),
        environment,
      };
    case 'BoolLiteral':
      return {
        type: 'ASTBoolValue',
        result: boolValue(ast.value),
        environment,
      };
    case 'NullLiteral':
      return astNullValue;
    default:
      return evaluatorError(ast, environment);
  }
};

const evaluate: Evaluate = (ast, environment) => {
  let record: Message | AssignVariables | GetVariable | ASTValue = {
    type: 'ASTNullValue',
    result: nullValue,
    environment
  };
  ast.partsOfSource.forEach((part) => {
    const tmp = evaluateAST(part, record.environment);
    record = tmp;
  })
  return record;
};

export default evaluate;
