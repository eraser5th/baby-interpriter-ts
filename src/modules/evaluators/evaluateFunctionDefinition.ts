import { EvaluateFunctionDefinition } from '../../types/evaluatorTypes';
import { nullValue } from '../value';

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

export default evaluateFunctionDefinition;
