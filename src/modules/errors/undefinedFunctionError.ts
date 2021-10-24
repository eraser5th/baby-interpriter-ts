import { UndefinedFunctionError } from '../../types/evaluatorTypes';

const undefinedFunctionError: UndefinedFunctionError = (name, environment) => ({
  result: {
    type: 'UndefinedFunctionError',
    message: `関数'${name}'は存在しません`,
  },
  isError: true,
  environment,
});

export default undefinedFunctionError;
