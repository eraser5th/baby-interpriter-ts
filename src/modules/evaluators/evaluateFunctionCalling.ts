/* eslint-disable no-unused-vars */
import {
  ErrorResponse,
  EvaluateFunctionCalling,
  ValueResponse,
} from '../../types/evaluatorTypes';
import { Expression, FuncCall } from '../../types/expressionTypes';
import {
  BoolValue, DefinedFunction, EmbeddedFunction, Environment, Func, IntValue, NullValue,
} from '../../types/valueTypes';
import argumentsCountError from '../errors/argumentsCountError';
import undefinedFunctionError from '../errors/undefinedFunctionError';
import evaluate from '../evaluator';
import { boolValue, intValue, nullValue } from '../value';
import evaluatePartsOfSource from './evaluatePartsOfSource';

type UnwrapObject = (
    obj: IntValue | BoolValue | NullValue
) => null | number | boolean

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

type WrapObject = (
    obj: any
) => IntValue | BoolValue | NullValue

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

type EvaluateEmbeddedFunction = (
    func: EmbeddedFunction,
    args: (IntValue | BoolValue | NullValue)[]
) => NullValue | IntValue | BoolValue

const evaluateEmbeddedFunction: EvaluateEmbeddedFunction = (func, args) => wrapObject(
  func.function(...args.map(unwrapObject)),
);

type EvaluateDefinedFunction = (
    func: DefinedFunction,
    args: (IntValue | BoolValue | NullValue)[],
    env: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

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

type ComputeFunction = (
    func: Func,
    name: string,
    args: (IntValue | BoolValue | NullValue)[],
    env: Environment
) => ValueResponse<BoolValue | IntValue | NullValue> | ErrorResponse

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

type EvaluateArguments = (
    args: Expression[],
    environment: Environment
) => {
    evaluatedArguments: (NullValue | IntValue | BoolValue)[],
    isError: false,
    environment: Environment
} | ErrorResponse

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

export default evaluateFunctionCalling;
