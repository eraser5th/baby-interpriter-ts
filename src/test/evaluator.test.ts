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

/*
describe('評価', () => {
  describe('エラー処理', () => {
    test('型エラー', () => {
      expect(evaluate(lexAndParse('a+1;'), {
        variables: new Map([['a', { type: 'NullValue' }]]),
        functions: new Map(),
      }).result.type).toBe('TypeError');
    });
  });
  test('1;', () => {
    expect(evaluate({
      type: 'Source',
      partsOfSource: [
        { type: 'IntLiteral', value: 1 },
      ],
    }, {
      variables: new Map(),
      functions: new Map(),
    })).toStrictEqual(
      {
        result: {
          type: 'IntValue',
          value: 1,
        },
        isError: false,
        environment: {
          variables: new Map(),
          functions: new Map(),
        },
      },
    );
  });
  describe('Add', () => {
    test('1+2;', () => {
      expect(evaluate(lexAndParse('1+2;'), emptyEnvironment)).toStrictEqual(
        {
          result: {
            type: 'IntValue',
            value: 3,
          },
          isError: false,
          environment: {
            variables: new Map(),
            functions: new Map(),
          },
        },
      );
    });
    test('エラー時にエラーを上げていく処理', () => {
      expect(evaluate(lexAndParse('(1+non)+23;'), emptyEnvironment).result.type).toBe('TypeError');
      expect(evaluate(lexAndParse('1+(non+23);'), emptyEnvironment).result.type).toBe('TypeError');
    });
  });
  test('複数の文', () => {
    expect(evaluate(lexAndParse('1;2;'), emptyEnvironment)).toStrictEqual(
      {
        result: {
          type: 'IntValue',
          value: 2,
        },
        isError: false,
        environment: {
          variables: new Map(),
          functions: new Map(),
        },
      },
    );
  });
  test('代入文', () => {
    expect(evaluate(lexAndParse('a=1;'), emptyEnvironment)).toStrictEqual(
      {
        result: {
          type: 'NullValue',
          value: null,
        },
        isError: false,
        environment: {
          variables: new Map([
            ['a', {
              type: 'IntValue',
              isError: false,
              value: 1,
            }],
          ]),
          functions: new Map(),
        },
      },
    );
  });
  describe('変数の参照', () => {
    test('正常な参照', () => {
      expect(evaluate(lexAndParse('value;'), {
        variables: new Map([
          ['value', {
            type: 'IntValue',
            value: 123,
          }],
        ]),
        functions: new Map(),
      })).toStrictEqual(
        {
          result: {
            type: 'IntValue',
            value: 123,
          },
          isError: false,
          environment: {
            variables: new Map([
              ['value', {
                type: 'IntValue',
                isError: false,
                value: 123,
              }],
            ]),
            functions: new Map(),
          },
        },
      );
    });
    test('存在しない参照', () => {
      expect(evaluate(lexAndParse('non;'), emptyEnvironment)).toStrictEqual(
        {
          result: {
            type: 'NullValue',
            isError: false,
          },
          environment: {
            variables: new Map(),
            functions: new Map(),
          },
        },
      );
    });
  });
  describe('各種リテラル', () => {
    test('整数', () => {
      expect(evaluate(lexAndParse('123;'), emptyEnvironment)).toStrictEqual(
        {
          result: {
            type: 'IntValue',
            isError: false,
            value: 123,
          },
          environment: {
            variables: new Map(),
            functions: new Map(),
          },
        },
      );
    });
    describe('真偽値', () => {
      test('true', () => {
        expect(evaluate(lexAndParse('true;'), emptyEnvironment)).toStrictEqual(
          {
            result: {
              type: 'BoolValue',
              isError: false,
              value: true,
            },
            environment: emptyEnvironment,
          },
        );
      });
      test('false', () => {
        expect(evaluate(lexAndParse('false;'), emptyEnvironment)).toStrictEqual(
          {
            result: {
              type: 'BoolValue',
              isError: false,
              value: false,
            },
            environment: emptyEnvironment,
          },
        );
      });
    });
    test('null', () => {
      expect(evaluate(lexAndParse('null;'), emptyEnvironment)).toStrictEqual(
        {
          result: {
            type: 'NullValue',
            isError: false,
          },
          environment: emptyEnvironment,
        },
      );
    });
  });
  describe('if', () => {
    test('trueのとき', () => {
      expect(evaluate(lexAndParse('if(true){a=1;}'), emptyEnvironment)).toStrictEqual({
        result: nullValue,
        environment: {
          variables: new Map([
            ['a', intValue(1)],
          ]),
          functions: new Map(),
        },
      });
    });
    test('falseのとき', () => {
      expect(evaluate(lexAndParse('if(false){a=1;}'), emptyEnvironment)).toStrictEqual({
        result: nullValue,
        environment: emptyEnvironment,
      });
    });
    test('intのとき', () => {
      expect(evaluate(lexAndParse('if(123){a=1;}'), emptyEnvironment)).toStrictEqual({
        result: nullValue,
        environment: {
          variables: new Map([
            ['a', intValue(1)],
          ]),
          functions: new Map(),
        },
      });
    });
    test('nullのとき', () => {
      expect(evaluate(lexAndParse('if(null){a=1;}'), emptyEnvironment)).toStrictEqual({
        result: nullValue,
        environment: emptyEnvironment,
      });
    });
    test('文が0個', () => {
      expect(evaluate(lexAndParse('if(true){}'), emptyEnvironment)).toStrictEqual({
        result: nullValue,
        environment: emptyEnvironment,
      });
    });
    test('文が1個', () => {
      expect(evaluate(lexAndParse('if(true){ 1; }'), emptyEnvironment)).toStrictEqual({
        result: intValue(1),
        environment: emptyEnvironment,
      });
    });
    test('文が2個', () => {
      expect(evaluate(lexAndParse('if(true){ 2; 3; }'), emptyEnvironment)).toStrictEqual({
        result: intValue(3),
        environment: emptyEnvironment,
      });
    });
  });
  describe('組み込み関数', () => {
    test('組み込み関数が呼べることの確認', () => {
    });
    test('組み込み関数に引数を渡せることの確認', () => {
    });
  });
  describe('関数定義', () => {
    test('定義ができることの確認', () => {
    });
    test('すでに定義されている関数を上書き', () => {
    });
    test('定義した関数を呼べることの確認', () => {
    });
    test('定義した関数と環境が違うことの確認', () => {
    });
    test('定義した関数を呼んで仮引数に渡されることの確認', () => {
    });
  });
});
*/
