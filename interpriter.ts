/* eslint-disable no-continue */
/* eslint-disable no-console */

import { Token } from './tokenTypes';

const prompts = require('prompts');
const { Environment } = require('./value');
const { lexicalAnalyse } = require('./lexical-analyse');
const { parse } = require('./parser');
const { evaluate } = require('./evaluator');

async function read() {
  const respond = await prompts({
    type: 'text',
    name: 'value',
    message: '',
  });
  return respond.value;
}

(async () => {
  let environment = Environment;
  const isUnknownCharacter = (token: Token): boolean => token.type === 'UnknownCharacter';
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const tokens = lexicalAnalyse(await read());
    const lexicalError = tokens.find(isUnknownCharacter);
    if (lexicalError) {
      console.error(lexicalError);
      continue;
    }
    const ast = parse(tokens);
    if (ast.type === 'SyntaxError') {
      console.error(ast);
      continue;
    }
    const resultObject = evaluate(ast, environment);
    if (resultObject.result.isError) {
      console.error(resultObject);
      continue;
    }
    console.log(resultObject.result);
    environment = resultObject.environment;
  }
})();
