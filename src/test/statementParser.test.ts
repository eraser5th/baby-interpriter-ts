/* eslint-disable no-undef */
import lexicalAnalyse from '../modules/lexical-analyze';
import parseSource from '../modules/statementParser';
import { Source, SyntaxError } from '../types/statementTypes';
import { Tokens } from '../types/tokenTypes';

type TestCase = {
    name: string,
    input: Tokens,
    output: Source | SyntaxError
}

type StatementTest = {
  name: string,
  testCases: TestCase[]
}

const ifStatement: TestCase[] = [
  {
    name: 'if(true){}',
    input: lexicalAnalyse('if(true){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: true },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if(false){}',
    input: lexicalAnalyse('if(false){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: false },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if(1){}',
    input: lexicalAnalyse('if(1){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'IntLiteral', value: 1 },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if(a){}',
    input: lexicalAnalyse('if(a){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'Variable', name: 'a' },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if(a()){}',
    input: lexicalAnalyse('if(a()){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'FuncCall', name: 'a', arguments: [] },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if(a(1, b, c())){}',
    input: lexicalAnalyse('if(a(1, b, c())){}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: {
            type: 'FuncCall',
            name: 'a',
            arguments: [
              { type: 'IntLiteral', value: 1 },
              { type: 'Variable', name: 'b' },
              { type: 'FuncCall', name: 'c', arguments: [] },
            ],
          },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if true {}',
    input: lexicalAnalyse('if true {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: true },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if 1 {}',
    input: lexicalAnalyse('if 1 {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'IntLiteral', value: 1 },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if a {}',
    input: lexicalAnalyse('if a {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'Variable', name: 'a' },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if a() {}',
    input: lexicalAnalyse('if a() {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'FuncCall', name: 'a', arguments: [] },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if a(1, b, c()) {}',
    input: lexicalAnalyse('if a(1, b, c()) {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: {
            type: 'FuncCall',
            name: 'a',
            arguments: [
              { type: 'IntLiteral', value: 1 },
              { type: 'Variable', name: 'b' },
              { type: 'FuncCall', name: 'c', arguments: [] },
            ],
          },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if true {1;}',
    input: lexicalAnalyse('if true {1;}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: true },
          ifStatements: [
            { type: 'IntLiteral', value: 1 },
          ],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if true {1+2;}',
    input: lexicalAnalyse('if true {1+2;}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: true },
          ifStatements: [{
            type: 'Add',
            left: { type: 'IntLiteral', value: 1 },
            right: { type: 'IntLiteral', value: 2 },
          }],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if true {1*2;}',
    input: lexicalAnalyse('if true {1*2;}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: { type: 'BoolLiteral', value: true },
          ifStatements: [{
            type: 'Mul',
            left: { type: 'IntLiteral', value: 1 },
            right: { type: 'IntLiteral', value: 2 },
          }],
          elseStatements: [],
        },
      ],
    },
  },
  {
    name: 'if false+1*a() {}',
    input: lexicalAnalyse('if false+1*a() {}'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'If',
          condition: {
            type: 'Add',
            left: { type: 'BoolLiteral', value: false },
            right: {
              type: 'Mul',
              left: { type: 'IntLiteral', value: 1 },
              right: {
                type: 'FuncCall',
                arguments: [],
                name: 'a',
              },
            },
          },
          ifStatements: [],
          elseStatements: [],
        },
      ],
    },
  },
];

const assignment: TestCase[] = [
  {
    name: 'a=1;',
    input: lexicalAnalyse('a=1;'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'Assignment',
          name: 'a',
          expression: { type: 'IntLiteral', value: 1 },
        },
      ],
    },
  },
  {
    name: 'a=b;',
    input: lexicalAnalyse('a=b;'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'Assignment',
          name: 'a',
          expression: { type: 'Variable', name: 'b' },
        },
      ],
    },
  },
  {
    name: 'a=1+b*c(false);',
    input: lexicalAnalyse('a=1+b*c(false);'),
    output: {
      type: 'Source',
      partsOfSource: [
        {
          type: 'Assignment',
          name: 'a',
          expression: {
            type: 'Add',
            left: { type: 'IntLiteral', value: 1 },
            right: {
              type: 'Mul',
              left: { type: 'Variable', name: 'b' },
              right: {
                type: 'FuncCall',
                arguments: [{ type: 'BoolLiteral', value: false }],
                name: 'c',
              },
            },
          },
        },
      ],
    },
  },
];

const defFunc: TestCase[] = [

];

const StatementTests: StatementTest[] = [
  {
    name: 'if文',
    testCases: ifStatement,
  },
  {
    name: '変数宣言',
    testCases: assignment,
  },
  {
    name: '関数宣言',
    testCases: defFunc,
  },
];

describe('構文解析(文)', () => {
  StatementTests.forEach((expressionTest) => {
    describe(expressionTest.name, () => {
      expressionTest.testCases.forEach((testCase) => {
        test(testCase.name, () => {
          expect(parseSource(testCase.input)).toStrictEqual(testCase.output);
        });
      });
    });
  });
});
