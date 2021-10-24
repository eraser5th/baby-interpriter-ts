import { ArgumentsCountError } from '../../types/evaluatorTypes';

const argumentsCountError: ArgumentsCountError = (name, want, got, environment) => ({
  result: {
    type: 'ArgumentsCountError',
    message: `関数'${name}'は${want}個の引数を取りますが、渡されたのは${got}個です`,
  },
  isError: true,
  environment,
});

export default argumentsCountError;
