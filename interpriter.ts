/* eslint-disable no-continue */
/* eslint-disable no-console */

import { Token } from './tokenTypes';
import parseSource from './statementAndAssignmentParser';

import evaluate from './evaluator';
import lexicalAnalyse from './lexical-analyse';
import { emptyEnvironment } from './value';

const prompts = require('prompts');

async function read() {
  const respond = await prompts({
    type: 'text',
    name: 'value',
    message: '',
  });
  return respond.value;
}

const isUnknownCharacter = (token: Token) => token.type === 'UnknownCharacter';

(async () => {
  let environment = emptyEnvironment;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const tokens = lexicalAnalyse(await read());
    const lexicalError = tokens.find(isUnknownCharacter);
    if (lexicalError) {
      console.error(lexicalError);
      continue;
    }
    const ast = parseSource(tokens);
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
