/* eslint-disable no-use-before-define */

import {
  boolValue,
  intValue,
  nullValue,
} from './value';

import {
  EvaluatorError,
  TypeError,
  EvaluateIfStatement,
  EvaluateAdd,
  Evaluate,
  EvaluatePartsOfSource,
  EvaluateAssignment,
  ArgumentsCountError,
  UndefinedFunctionError,
  UnwrapObject,
  WrapObject,
  EvaluateArguments,
  EvaluateEmbeddedFunction,
  EvaluateDefinedFunction,
  ComputeFunction,
  EvaluateFunctionCalling,
  EvaluateFunctionDefinition,
  EvaluateUnaryOperator,
  EvaluateLowLevelCompare,
  ComputeHighLevelCompare,
  EvaluateHighLevelCompare,
  ComputeLowLevelCompare,
  EvaluateAnd,
  EvaluateOr,
  Func,
} from '../types/evaluatorTypes';
import {
  BoolValue, IntValue, NullValue,
} from '../types/valueTypes';

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

const argumentsCountError: ArgumentsCountError = (name, want, got, environment) => ({
  result: {
    type: 'ArgumentsCountError',
    message: `関数'${name}'は${want}個の引数を取りますが、渡されたのは${got}個です`,
  },
  isError: true,
  environment,
});

const undefinedFunctionError: UndefinedFunctionError = (name, environment) => ({
  result: {
    type: 'UndefinedFunctionError',
    message: `関数'${name}'は存在しません`,
  },
  isError: true,
  environment,
});

const evaluatePartsOfSource: EvaluatePartsOfSource = (partsOfSource, environment) => {
  let result: IntValue | BoolValue | NullValue = nullValue;
  let env = environment;
  // forEachではreturnを使って値を返せないので書きづらく、
  // またreduceでは条件分岐が複雑になり書きづらいので、for文を使って処理しています
  // eslint-disable-next-line no-restricted-syntax
  for (const part of partsOfSource) {
    const evalResult = evaluate(part, env);
    if (evalResult.isError) {
      return evalResult;
    }
    result = evalResult.result;
    env = evalResult.environment;
  }
  return {
    result,
    isError: false,
    environment: env,
  };
};

const evaluateIfStatement: EvaluateIfStatement = (ast, initialEnvironment) => {
  const { condition, ifStatements, elseStatements } = ast;
  const evalResult = evaluate(condition, initialEnvironment);
  if (evalResult.isError) return evalResult;

  const { result, environment: halfwayEnvironment } = evalResult;
  if ((result.type === 'BoolValue' && result.value === false) || result.type === 'NullValue') {
    return evaluatePartsOfSource(elseStatements, halfwayEnvironment);
  }
  return evaluatePartsOfSource(ifStatements, halfwayEnvironment);
};

const evaluateAdd: EvaluateAdd = (ast, environment) => {
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

const evaluateSub: EvaluateAdd = (ast, environment) => {
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

const evaluateMul: EvaluateAdd = (ast, environment) => {
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

const evaluateDiv: EvaluateAdd = (ast, environment) => {
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

const evaluateUnaryOperator: EvaluateUnaryOperator = (ast, environment) => {
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

const unwrapObject: UnwrapObject = (obj) => {
  switch (obj.type) {
    case 'IntValue':
    case 'BoolValue':
      return obj.value;
    case 'NullValue':
      return null;
    default:
      return null;
  }
};

const wrapObject: WrapObject = (obj) => {
  const toStr = Object.prototype.toString;
  switch (toStr.call(obj)) {
    case '[object Number]':
      return intValue(obj);
    case '[object Boolean]':
      return boolValue(obj);
    default:
      return nullValue;
  }
};

const evaluateAssignment: EvaluateAssignment = (ast, environment) => {
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

const evaluateArguments: EvaluateArguments = (args, environment) => {
  const evaluatedArguments = [];
  let argumentsEvaluatedEnvironment = environment;
  // eslint-disable-next-line no-restricted-syntax
  for (const stmt of args) {
    const evalResult = evaluate(stmt, argumentsEvaluatedEnvironment);
    if (evalResult.isError) {
      return evalResult;
    }
    evaluatedArguments.push(evalResult.result);
    argumentsEvaluatedEnvironment = evalResult.environment;
  }

  return {
    evaluatedArguments,
    isError: false,
    environment: argumentsEvaluatedEnvironment,
  };
};

const evaluateEmbeddedFunction: EvaluateEmbeddedFunction = (func, args) => wrapObject(
  func.function(...args.map(unwrapObject)),
);

const evaluateDefinedFunction: EvaluateDefinedFunction = (func, args, env) => {
  const variables = new Map();
  func.arguments.forEach((arg, i) => {
    variables.set(arg, args[i]);
  });
  return evaluatePartsOfSource(
    func.statements,
    {
      variables,
      functions: env.functions,
    },
  );
};

const computeFunction: ComputeFunction = (func, name, args, env) => {
  if (func.type === 'EmbeddedFunction') {
    return {
      result: evaluateEmbeddedFunction(func, args),
      isError: false,
      environment: env,
    };
  }
  return evaluateDefinedFunction(func, args, env);
};

const evaluateFunctionCalling: EvaluateFunctionCalling = (calling, environment) => {
  const func: Func | undefined = environment.functions.get(calling.name);
  if (func === undefined) {
    return undefinedFunctionError(calling.name, environment);
  }
  const args = calling.arguments;
  if (func.argumentsCount !== args.length) {
    return argumentsCountError(
      calling.name,
      func.argumentsCount,
      calling.arguments.length,
      environment,
    );
  }
  const evaluatedArgs = evaluateArguments(args, environment);
  if (evaluatedArgs.isError) {
    return evaluatedArgs;
  }
  return computeFunction(
    func, calling.name, evaluatedArgs.evaluatedArguments, evaluatedArgs.environment,
  );
};

const evaluateFunctionDefinition: EvaluateFunctionDefinition = (funcDef, environment) => ({
  result: nullValue,
  isError: false,
  environment: {
    variables: environment.variables,
    functions: new Map(environment.functions).set(
      funcDef.name,
      {
        type: 'DefinedFunction',
        argumentsCount: funcDef.arguments.length,
        arguments: funcDef.arguments,
        statements: funcDef.statements,
      },
    ),
  },
});

const evaluateAnd: EvaluateAnd = (ast, environment) => {
  const leftEvalRes = evaluate(ast.left, environment);
  if (leftEvalRes.isError) return leftEvalRes;

  const rightEvalRes = evaluate(ast.right, environment);
  if (rightEvalRes.isError) return rightEvalRes;

  const value = leftEvalRes.result.value && rightEvalRes.result.value;
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

const evaluateOr: EvaluateOr = (ast, environment) => {
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

const evaluateHighLevelCompare: EvaluateHighLevelCompare = (ast, environment) => {
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

const evaluateLowLevelCompare: EvaluateLowLevelCompare = (ast, environment) => {
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

const evaluate: Evaluate = (ast, environment) => {
  switch (ast.type) {
    case 'Source':
      return evaluatePartsOfSource(ast.partsOfSource, environment);
    case 'FuncDef':
      return evaluateFunctionDefinition(ast, environment);
    case 'Assignment':
      return evaluateAssignment(ast, environment);
    case 'If':
      return evaluateIfStatement(ast, environment);
    case 'Add':
      return evaluateAdd(ast, environment);
    case 'Sub':
      return evaluateSub(ast, environment);
    case 'Mul':
      return evaluateMul(ast, environment);
    case 'Div':
      return evaluateDiv(ast, environment);
    case 'UnaryMinus':
    case 'UnaryPlus':
    case 'UnaryNot':
      return evaluateUnaryOperator(ast, environment);
    case 'AndOperation':
      return evaluateAnd(ast, environment);
    case 'OrOperation':
      return evaluateOr(ast, environment);
    case 'HighLevelCompare':
      return evaluateHighLevelCompare(ast, environment);
    case 'LowLevelCompare':
      return evaluateLowLevelCompare(ast, environment);
    case 'FuncCall':
      return evaluateFunctionCalling(ast, environment);
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
