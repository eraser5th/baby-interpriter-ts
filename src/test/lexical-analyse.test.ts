/* eslint-disable no-undef */

import lexicalAnalyse from '../modules/lexical-analyse';
import { Tokens } from '../types/tokenTypes';

type TestCase = {
  testName: string,
  input: string,
  output: Tokens
}[]

const testCase: TestCase = [
  {
    testName: '空文字列',
    input: '',
    output: [],
  },
  {
    testName: '1',
    input: '1',
    output: [{ type: 'Int', value: 1 }],
  },
  {
    testName: '123',
    input: '123',
    output: [{ type: 'Int', value: 123 }],
  },
  {
    testName: '+',
    input: '+',
    output: [{ type: 'Plus' }],
  },
  {
    testName: '=',
    input: '=',
    output: [{ type: 'Equal' }],
  },
  {
    testName: '1+2',
    input: '1+2',
    output: [
      { type: 'Int', value: 1 },
      { type: 'Plus' },
      { type: 'Int', value: 2 },
    ],
  },
  {
    testName: '空白は無視する1',
    input: '\t 1 ',
    output: [{ type: 'Int', value: 1 }],
  },
  {
    testName: '空白は無視する2',
    input: '     ',
    output: [],
  },

  {
    testName: '空白は無視する3',
    input: '1\n2',
    output: [
      { type: 'Int', value: 1 },
      { type: 'Int', value: 2 },
    ],
  },
  {
    testName: '無効な文字列',
    input: 'あ',
    output: [{ type: 'UnknownCharacter', value: 'あ' }],
  },
  {
    testName: '識別子',
    input: 'test abc',
    output: [
      { type: 'Ident', name: 'test' },
      { type: 'Ident', name: 'abc' },
    ],
  },
  {
    testName: '丸括弧',
    input: '()',
    output: [
      { type: 'LParen' },
      { type: 'RParen' },
    ],
  },
  {
    testName: '波括弧',
    input: '{}',
    output: [
      { type: 'LBrace' },
      { type: 'RBrace' },
    ],
  },
  {
    testName: 'コンマ',
    input: ',',
    output: [{ type: 'Comma' }],
  },
  {
    testName: 'セミコロン',
    input: ';',
    output: [{ type: 'Semicolon' }],
  },
  {
    testName: 'Ifキーワード',
    input: 'if',
    output: [{ type: 'If' }],
  },
  {
    testName: 'def',
    input: 'def',
    output: [{ type: 'Def' }],
  },
  {
    testName: 'false',
    input: 'false',
    output: [{ type: 'Bool', value: false }],
  },
  {
    testName: 'true',
    input: 'true',
    output: [{ type: 'Bool', value: true }],
  },
  {
    testName: 'null',
    input: 'null',
    output: [{ type: 'Null' }],
  },
  {
    testName: '(a())',
    input: '(a())',
    output: [
      { type: 'LParen' },
      { type: 'Ident', name: 'a' },
      { type: 'LParen' },
      { type: 'RParen' },
      { type: 'RParen' },
    ],
  },
  {
    testName: '(',
    input: '(',
    output: [{ type: 'LParen' }],
  },
  {
    testName: ')',
    input: ')',
    output: [{ type: 'RParen' }],
  },
  {
    testName: '(()',
    input: '(()',
    output: [
      { type: 'LParen' },
      { type: 'LParen' },
      { type: 'RParen' },
    ],
  },
  {
    testName: '())',
    input: '())',
    output: [
      { type: 'LParen' },
      { type: 'RParen' },
      { type: 'RParen' },
    ],
  },
  {
    testName: '-',
    input: '-',
    output: [{ type: 'Minus' }],
  },
  {
    testName: '(a()))*b()))',
    input: '(a()))*b()))',
    output: [
      { type: 'LParen' },
      { type: 'Ident', name: 'a' },
      { type: 'LParen' },
      { type: 'RParen' },
      { type: 'RParen' },
      { type: 'RParen' },
      { type: 'Asterisk' },
      { type: 'Ident', name: 'b' },
      { type: 'LParen' },
      { type: 'RParen' },
      { type: 'RParen' },
      { type: 'RParen' },
    ],
  },
];

describe('字句解析', () => {
  testCase.forEach((value) => {
    test(value.testName, () => {
      expect(lexicalAnalyse(value.input)).toStrictEqual(value.output);
    });
  });
});
