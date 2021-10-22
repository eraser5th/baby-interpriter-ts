/* eslint-disable no-undef */

import evaluate from '../modules/evaluator';
import lexicalAnalyse from '../modules/lexical-analyse';
import parseSource from '../modules/statementParser';
import { Source } from '../types/statementTypes';
import { nullValue } from '../modules/value';
import { Environment } from '../types/valueTypes';
import { EvaluatorErrorResponse, TypeErrorResponse, ValueResponse } from '../types/evaluatorTypes';

function lexAndParse(source: string) {
  return parseSource(lexicalAnalyse(source)) as Source;
}

function emptyEnvironment(): Environment {
  return {
    variables: new Map(),
    functions: new Map(),
  };
}

type TestCase = {
  name: string,
  input: {
    source: Source,
    environment: Environment,
  }
  output: ValueResponse | TypeErrorResponse | EvaluatorErrorResponse
}

type EvaluatorTests = {
  name: string,
  testCases: TestCase[]
}[]

const nullString: TestCase[] = [
  {
    name: '空',
    input: {
      source: lexAndParse(''),
      environment: emptyEnvironment(),
    },
    output: {
      result: nullValue,
      isError: false,
      environment: emptyEnvironment(),
    },
  },
];

const environmentTest: TestCase[] = [
  {
    name: '空',
    input: {
      source: lexAndParse(''),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a: null',
    input: {
      source: lexAndParse(''),
      environment: {
        variables: new Map().set('a', { type: 'NullValue', value: null }),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map().set('a', { type: 'NullValue', value: null }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a: 1',
    input: {
      source: lexAndParse(''),
      environment: {
        variables: new Map().set('a', { type: 'IntValue', value: 1 }),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map().set('a', { type: 'IntValue', value: 1 }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=1;',
    input: {
      source: lexAndParse('a=1;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map().set('a', { type: 'IntValue', value: 1 }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=false;b=true;',
    input: {
      source: lexAndParse('a=false;b=true;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map()
          .set('a', { type: 'BoolValue', value: false })
          .set('b', { type: 'BoolValue', value: true }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=true;',
    input: {
      source: lexAndParse('a=true;'),
      environment: {
        variables: new Map().set('a', { type: 'BoolValue', value: false }),
        functions: new Map(),
      },
    },
    output: {
      result: nullValue,
      isError: false,
      environment: {
        variables: new Map()
          .set('a', { type: 'BoolValue', value: true }),
        functions: new Map(),
      },
    },
  },
];

const expressionTest: TestCase[] = [
  {
    name: '1;',
    input: {
      source: lexAndParse('1;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 1 },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: '1+2;',
    input: {
      source: lexAndParse('1+2;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 3 },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=1;a+2;',
    input: {
      source: lexAndParse('a=1;a+2;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 3 },
      isError: false,
      environment: {
        variables: new Map()
          .set('a', { type: 'IntValue', value: 1 }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=2;a*3;',
    input: {
      source: lexAndParse('a=2;a*3;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 6 },
      isError: false,
      environment: {
        variables: new Map()
          .set('a', { type: 'IntValue', value: 2 }),
        functions: new Map(),
      },
    },
  },
  {
    name: 'null;',
    input: {
      source: lexAndParse('null;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'NullValue', value: null },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
];

const errorTests: TestCase[] = [
  {
    name: 'true+1;',
    input: {
      source: lexAndParse('true+1;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: '1+false;',
    input: {
      source: lexAndParse('1+true;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=a;',
    input: {
      source: lexAndParse('a=a;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: '(1+false)+2;',
    input: {
      source: lexAndParse('(1+false)+2;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: '1+(2+false);',
    input: {
      source: lexAndParse('1+(2+false);'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'if false+1 {1;};',
    input: {
      source: lexAndParse('if false+1 {1;};'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`BoolValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'a=1+null;',
    input: {
      source: lexAndParse('a=1+null;'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'TypeError', message: '無効な型`NullValue`が渡されました' },
      isError: true,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
];

const ifStatementTests: TestCase[] = [
  {
    name: 'if true {1;}',
    input: {
      source: lexAndParse('if true {1;}'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 1 },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'if false {1;}',
    input: {
      source: lexAndParse('if false {1;}'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'NullValue', value: null },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'if 1 {2;}',
    input: {
      source: lexAndParse('if 1 {2;}'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 2 },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'if 1 {2;3;}',
    input: {
      source: lexAndParse('if 1 {2;3;}'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'IntValue', value: 3 },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
  {
    name: 'if null {2;3;}',
    input: {
      source: lexAndParse('if null {2;3;}'),
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
    output: {
      result: { type: 'NullValue', value: null },
      isError: false,
      environment: {
        variables: new Map(),
        functions: new Map(),
      },
    },
  },
];

const evaluatorTests: EvaluatorTests = [
  {
    name: '空',
    testCases: nullString,
  },
  {
    name: '環境及び変数代入',
    testCases: environmentTest,
  },
  {
    name: '式',
    testCases: expressionTest,
  },
  {
    name: 'エラー',
    testCases: errorTests,
  },
  {
    name: 'if文',
    testCases: ifStatementTests,
  },
];

describe('評価', () => {
  evaluatorTests.forEach((evaluatorTest) => {
    describe(evaluatorTest.name, () => {
      evaluatorTest.testCases.forEach((testCase) => {
        test(testCase.name, () => {
          expect(evaluate(testCase.input.source, testCase.input.environment))
            .toStrictEqual(testCase.output);
        });
      });
    });
  });
});
