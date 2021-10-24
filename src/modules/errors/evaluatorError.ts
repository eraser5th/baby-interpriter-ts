import { EvaluatorError } from '../../types/evaluatorTypes';

const evaluatorError: EvaluatorError = (type, environment) => ({
  result: {
    type: 'EvaluatorError',
    message: `無効なast\`${type}\`が渡されました`,
  },
  isError: true,
  environment,
});

export default evaluatorError;
