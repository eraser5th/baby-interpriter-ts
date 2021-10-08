/* eslint-disable no-undef */
import parseSource from '../modules/statementParser';
import { Source, SyntaxError } from '../types/statementTypes';
import { Tokens } from '../types/tokenTypes';

type TestCase = {
    name: string,
    input: Tokens,
    output: Source | SyntaxError
}

const testCase: TestCase[] = [
];

describe('構文解析(文)', () => {
  testCase.forEach((value) => {
    test(value.name, () => {
      expect(parseSource(value.input)).toStrictEqual(value.output);
    });
  });
});
