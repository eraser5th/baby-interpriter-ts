import { TypeError } from '../../types/evaluatorTypes';

const typeError: TypeError = (type, environment) => ({
  result: {
    type: 'TypeError',
    message: `無効な型\`${type}\`が渡されました`,
  },
  isError: true,
  environment,
});

export default typeError;
