/* eslint-disable no-undef */
import parseExpression from '../modules/expressionParser';
import lexicalAnalyse from '../modules/lexical-analyse';
import { ExpressionWithTokensCount, InvalidExpression } from '../types/expressionTypes';
import { Tokens } from '../types/tokenTypes';

const CreateInvalidExpression = (): InvalidExpression => ({
  expression: null,
  parsedTokensCount: undefined,
});

type TestCase = {
    name: string,
    input: Tokens,
    output: ExpressionWithTokensCount | InvalidExpression
}

const testCase: TestCase[] = [
  {
    name: '空',
    input: [],
    output: CreateInvalidExpression(),
  },
  {
    name: '1',
    input: lexicalAnalyse('1'),
    output: {
      expression: { type: 'IntLiteral', value: 1 },
      parsedTokensCount: 1,
    },
  },
  {
    name: '1+2',
    input: lexicalAnalyse('1+2'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'IntLiteral', value: 1 },
        right: { type: 'IntLiteral', value: 2 },
      },
      parsedTokensCount: 3,
    },
  },
];

describe('構文解析(式)', () => {
  testCase.forEach((value) => {
    test(value.name, () => {
      expect(parseExpression(value.input)).toStrictEqual(value.output);
    });
  });
});
