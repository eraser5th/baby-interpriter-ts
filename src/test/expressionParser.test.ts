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

// これわかんない Expression Test しか思いつきませんでした...
type ExpressionTest = {
  name: string,
  testCases: TestCase[]
}

const literal: TestCase[] = [

  {
    name: '1',
    input: lexicalAnalyse('1'),
    output: {
      expression: { type: 'IntLiteral', value: 1 },
      parsedTokensCount: 1,
    },
  },
  {
    name: 'false',
    input: lexicalAnalyse('false'),
    output: {
      expression: { type: 'BoolLiteral', value: false },
      parsedTokensCount: 1,
    },
  },
  {
    name: 'true',
    input: lexicalAnalyse('true'),
    output: {
      expression: { type: 'BoolLiteral', value: true },
      parsedTokensCount: 1,
    },
  },
  {
    name: 'null',
    input: lexicalAnalyse('null'),
    output: {
      expression: { type: 'NullLiteral' },
      parsedTokensCount: 1,
    },
  },
];

const addSubMulDiv: TestCase[] = [
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
  {
    name: '1+2+3',
    input: lexicalAnalyse('1+2+3'),
    output: {
      expression: {
        type: 'Add',
        left: {
          type: 'Add',
          left: { type: 'IntLiteral', value: 1 },
          right: { type: 'IntLiteral', value: 2 },
        },
        right: { type: 'IntLiteral', value: 3 },
      },
      parsedTokensCount: 5,
    },
  },
  {
    name: '1*2',
    input: lexicalAnalyse('1*2'),
    output: {
      expression: {
        type: 'Mul',
        left: { type: 'IntLiteral', value: 1 },
        right: { type: 'IntLiteral', value: 2 },
      },
      parsedTokensCount: 3,
    },
  },
  {
    name: '1*2+3',
    input: lexicalAnalyse('1*2+3'),
    output: {
      expression: {
        type: 'Add',
        left: {
          type: 'Mul',
          left: { type: 'IntLiteral', value: 1 },
          right: { type: 'IntLiteral', value: 2 },
        },
        right: { type: 'IntLiteral', value: 3 },
      },
      parsedTokensCount: 5,
    },
  },
  {
    name: '1+2*3',
    input: lexicalAnalyse('1+2*3'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'IntLiteral', value: 1 },
        right: {
          type: 'Mul',
          left: { type: 'IntLiteral', value: 2 },
          right: { type: 'IntLiteral', value: 3 },
        },
      },
      parsedTokensCount: 5,
    },
  },
  {
    name: '1*2*3',
    input: lexicalAnalyse('1*2*3'),
    output: {
      expression: {
        type: 'Mul',
        left: {
          type: 'Mul',
          left: { type: 'IntLiteral', value: 1 },
          right: { type: 'IntLiteral', value: 2 },
        },
        right: { type: 'IntLiteral', value: 3 },
      },
      parsedTokensCount: 5,
    },
  },
  {
    name: '(1)',
    input: lexicalAnalyse('(1)'),
    output: {
      expression: { type: 'IntLiteral', value: 1 },
      parsedTokensCount: 3,
    },
  },
  {
    name: '(1+2)',
    input: lexicalAnalyse('(1+2)'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'IntLiteral', value: 1 },
        right: { type: 'IntLiteral', value: 2 },
      },
      parsedTokensCount: 5,
    },
  },
  {
    name: '(1+2)+3',
    input: lexicalAnalyse('(1+2)+3'),
    output: {
      expression: {
        type: 'Add',
        left: {
          type: 'Add',
          left: { type: 'IntLiteral', value: 1 },
          right: { type: 'IntLiteral', value: 2 },
        },
        right: { type: 'IntLiteral', value: 3 },
      },
      parsedTokensCount: 7,
    },
  },
  {
    name: '1+(2+3)',
    input: lexicalAnalyse('1+(2+3)'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'IntLiteral', value: 1 },
        right: {
          type: 'Add',
          left: { type: 'IntLiteral', value: 2 },
          right: { type: 'IntLiteral', value: 3 },
        },
      },
      parsedTokensCount: 7,
    },
  },
  {
    name: '1*(2+3)',
    input: lexicalAnalyse('1*(2+3)'),
    output: {
      expression: {
        type: 'Mul',
        left: { type: 'IntLiteral', value: 1 },
        right: {
          type: 'Add',
          left: { type: 'IntLiteral', value: 2 },
          right: { type: 'IntLiteral', value: 3 },
        },
      },
      parsedTokensCount: 7,
    },
  },
  {
    name: '1*(2*3)',
    input: lexicalAnalyse('1*(2*3)'),
    output: {
      expression: {
        type: 'Mul',
        left: { type: 'IntLiteral', value: 1 },
        right: {
          type: 'Mul',
          left: { type: 'IntLiteral', value: 2 },
          right: { type: 'IntLiteral', value: 3 },
        },
      },
      parsedTokensCount: 7,
    },
  },
  {
    name: '(1*2)*3',
    input: lexicalAnalyse('(1*2)*3'),
    output: {
      expression: {
        type: 'Mul',
        left: {
          type: 'Mul',
          left: { type: 'IntLiteral', value: 1 },
          right: { type: 'IntLiteral', value: 2 },
        },
        right: { type: 'IntLiteral', value: 3 },
      },
      parsedTokensCount: 7,
    },
  },
];

const callVariant: TestCase[] = [
  {
    name: 'a',
    input: lexicalAnalyse('a'),
    output: {
      expression: { type: 'Variable', name: 'a' },
      parsedTokensCount: 1,
    },
  },
  {
    name: 'hoge',
    input: lexicalAnalyse('hoge'),
    output: {
      expression: { type: 'Variable', name: 'hoge' },
      parsedTokensCount: 1,
    },
  },
  {
    name: '1+a',
    input: lexicalAnalyse('1+a'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'IntLiteral', value: 1 },
        right: { type: 'Variable', name: 'a' },
      },
      parsedTokensCount: 3,
    },
  },
  {
    name: 'a+b',
    input: lexicalAnalyse('a+b'),
    output: {
      expression: {
        type: 'Add',
        left: { type: 'Variable', name: 'a' },
        right: { type: 'Variable', name: 'b' },
      },
      parsedTokensCount: 3,
    },
  },
  {
    name: 'a*b',
    input: lexicalAnalyse('a*b'),
    output: {
      expression: {
        type: 'Mul',
        left: { type: 'Variable', name: 'a' },
        right: { type: 'Variable', name: 'b' },
      },
      parsedTokensCount: 3,
    },
  },
];

const callFunc: TestCase[] = [
  {
    name: 'a()',
    input: lexicalAnalyse('a()'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [],
        name: 'a',
      },
      parsedTokensCount: 3,
    },
  },
  {
    name: 'hoge()',
    input: lexicalAnalyse('hoge()'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [],
        name: 'hoge',
      },
      parsedTokensCount: 3,
    },
  },
  {
    name: 'a(1)',
    input: lexicalAnalyse('a(1)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          { type: 'IntLiteral', value: 1 },
        ],
        name: 'a',
      },
      parsedTokensCount: 4,
    },
  },
  {
    name: 'a(1,2)',
    input: lexicalAnalyse('a(1,2)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          { type: 'IntLiteral', value: 1 },
          { type: 'IntLiteral', value: 2 },
        ],
        name: 'a',
      },
      parsedTokensCount: 6,
    },
  },
  {
    name: 'a(b)',
    input: lexicalAnalyse('a(b)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          { type: 'Variable', name: 'b' },
        ],
        name: 'a',
      },
      parsedTokensCount: 4,
    },
  },
  {
    name: 'a(1+b)',
    input: lexicalAnalyse('a(1+b)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          {
            type: 'Add',
            left: { type: 'IntLiteral', value: 1 },
            right: { type: 'Variable', name: 'b' },
          },
        ],
        name: 'a',
      },
      parsedTokensCount: 6,
    },
  },
  {
    name: 'a(1*b)',
    input: lexicalAnalyse('a(1*b)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          {
            type: 'Mul',
            left: { type: 'IntLiteral', value: 1 },
            right: { type: 'Variable', name: 'b' },
          },
        ],
        name: 'a',
      },
      parsedTokensCount: 6,
    },
  },
  {
    name: 'a(1*b, 2+c)',
    input: lexicalAnalyse('a(1*b, 2+c)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          {
            type: 'Mul',
            left: { type: 'IntLiteral', value: 1 },
            right: { type: 'Variable', name: 'b' },
          },
          {
            type: 'Add',
            left: { type: 'IntLiteral', value: 2 },
            right: { type: 'Variable', name: 'c' },
          },
        ],
        name: 'a',
      },
      parsedTokensCount: 10,
    },
  },
  {
    name: 'a(b())',
    input: lexicalAnalyse('a(b())'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          {
            type: 'FuncCall',
            arguments: [],
            name: 'b',
          },
        ],
        name: 'a',
      },
      parsedTokensCount: 6,
    },
  },
  {
    name: 'a((b+1)*5, 2+c, false)',
    input: lexicalAnalyse('a((b+1)*5, 2+c, false)'),
    output: {
      expression: {
        type: 'FuncCall',
        arguments: [
          {
            type: 'Mul',
            left: {
              type: 'Add',
              left: { type: 'Variable', name: 'b' },
              right: { type: 'IntLiteral', value: 1 },
            },
            right: { type: 'IntLiteral', value: 5 },
          },
          {
            type: 'Add',
            left: { type: 'IntLiteral', value: 2 },
            right: { type: 'Variable', name: 'c' },
          },
          {
            type: 'BoolLiteral',
            value: false,
          },
        ],
        name: 'a',
      },
      parsedTokensCount: 16,
    },
  },
  {
    name: 'a()+b()',
    input: lexicalAnalyse('a()+b()'),
    output: {
      expression: {
        type: 'Add',
        left: {
          type: 'FuncCall',
          arguments: [],
          name: 'a',
        },
        right: {
          type: 'FuncCall',
          arguments: [],
          name: 'b',
        },
      },
      parsedTokensCount: 7,
    },
  },
  {
    name: '(a()+b())*5',
    input: lexicalAnalyse('(a()+b())*5'),
    output: {
      expression: {
        type: 'Mul',
        left: {
          type: 'Add',
          left: {
            type: 'FuncCall',
            arguments: [],
            name: 'a',
          },
          right: {
            type: 'FuncCall',
            arguments: [],
            name: 'b',
          },
        },
        right: { type: 'IntLiteral', value: 5 },
      },
      parsedTokensCount: 11,
    },
  },
];

const invalidExpression: TestCase[] = [
  {
    name: '空',
    input: lexicalAnalyse(''),
    output: CreateInvalidExpression(),
  },
  {
    name: '(',
    input: lexicalAnalyse('('),
    output: CreateInvalidExpression(),
  },
  {
    name: '1+',
    input: lexicalAnalyse('1+'),
    output: CreateInvalidExpression(),
  },
  {
    name: '*3',
    input: lexicalAnalyse('*3'),
    output: CreateInvalidExpression(),
  },
  {
    name: 'a(',
    input: lexicalAnalyse('a('),
    output: CreateInvalidExpression(),
  },
  /*
  {
    name: 'a)',
    input: lexicalAnalyse('a)'),
    output: CreateInvalidExpression(),
  },
  */
  {
    name: '(1+2)*',
    input: lexicalAnalyse('(1+2)*'),
    output: CreateInvalidExpression(),
  },
  {
    name: 'a(1*)',
    input: lexicalAnalyse('a(1*)'),
    output: CreateInvalidExpression(),
  },
  {
    name: 'a*()',
    input: lexicalAnalyse('a*()'),
    output: CreateInvalidExpression(),
  },
  {
    name: '+*1',
    input: lexicalAnalyse('+*1'),
    output: CreateInvalidExpression(),
  },
  // {
  //   name: 'a())',
  //   input: lexicalAnalyse('a())'),
  //   output: CreateInvalidExpression(),
  // },
  // {
  //   name: '1+2)',
  //   input: lexicalAnalyse('1+2)'),
  //   output: CreateInvalidExpression(),
  // },
  {
    name: '***',
    input: lexicalAnalyse('***'),
    output: CreateInvalidExpression(),
  },
  {
    name: ')',
    input: lexicalAnalyse(')'),
    output: CreateInvalidExpression(),
  },
  // {
  //   name: '(a()))*b()))',
  //   input: lexicalAnalyse('(a()))*b()))'),
  //   output: CreateInvalidExpression(),
  // },
];

const expressionTests: ExpressionTest[] = [
  {
    name: 'リテラル',
    testCases: literal,
  },
  {
    name: '四則演算',
    testCases: addSubMulDiv,
  },
  {
    name: '変数呼び出し',
    testCases: callVariant,
  },
  {
    name: '関数呼び出し',
    testCases: callFunc,
  },
  {
    name: '無効な式',
    testCases: invalidExpression,
  },
];

describe('構文解析(式)', () => {
  expressionTests.forEach((expressionTest) => {
    describe(expressionTest.name, () => {
      expressionTest.testCases.forEach((testCase) => {
        test(testCase.name, () => {
          expect(parseExpression(testCase.input)).toStrictEqual(testCase.output);
        });
      });
    });
  });
});
