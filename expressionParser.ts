/* eslint-disable max-len */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import {
  // Expression
  ParseLiteral,
  ParseValue,
  ParseParenthesisExpression,
  ParseFunctionCallExpression,
  ParseMulDivExpression,
  ParseAddSubExpression,
  ParseExpression,
  ParseCommaSeparatedExpressions,
} from './expressionTypes';

class InvalidExpression {
  expression: null

  parsedTokensCount: undefined

  constructor() {
    this.expression = null;
    this.parsedTokensCount = undefined;
  }
}

class InvalidArguments {
  args: null

  parsedTokensCount: undefined

  constructor() {
    this.args = null;
    this.parsedTokensCount = undefined;
  }
}

const parseLiteral: ParseLiteral = (tokens) => {
  const head = tokens[0];
  switch (head.type) {
    case 'Int':
      return {
        expression: {
          type: 'IntLiteral',
          value: head.value,
        },
        parsedTokensCount: 1,
      };
    case 'Bool':
      return {
        expression: {
          type: 'BoolLiteral',
          value: head.value,
        },
        parsedTokensCount: 1,
      };
    case 'Null':
      return {
        expression: {
          type: 'NullLiteral',
        },
        parsedTokensCount: 1,
      };
    default:
      return new InvalidExpression();
  }
};

const parseValue: ParseValue = (tokens) => {
  const head = tokens[0];
  if (head?.type === 'Ident') {
    return {
      expression: {
        type: 'Variable',
        name: head.name,
      },
      parsedTokensCount: 1,
    };
  }
  return parseLiteral(tokens);
};

const parseParenthesisExpression: ParseParenthesisExpression = (tokens) => {
  // 括弧がないからバリューを返す
  if (tokens[0]?.type !== 'LParen') return parseValue(tokens);
  // 括弧の中身を式にする
  const parsedExpression = parseExpression(tokens.slice(1));
  // 式が無効なので無効な式を返す
  if (!parsedExpression.expression) return new InvalidExpression();

  const { expression, parsedTokensCount } = parsedExpression;
  // 閉じ括弧が存在しないので無効な式を返す
  if (tokens[parsedTokensCount + 1]?.type !== 'RParen') return new InvalidExpression();

  return {
    expression,
    parsedTokensCount: parsedTokensCount + 2,
  };
};

/*
型 '(tokens: Tokens) => InvalidArguments | { args: (Literal | Variable | FuncCall | AddSubMulDiv)[]; parsedTokensCount: number; }' を型 'ParseCommaSeparatedExpressions' に割り当てることはできません。
  型 'InvalidArguments | { args: (Literal | Variable | FuncCall | AddSubMulDiv)[]; parsedTokensCount: number; }' を型 'InvalidArguments | { args: Expression[]; parsedTokensCount: number; }' に割り当てることはできません。
    型 '{ args: (Literal | Variable | FuncCall | AddSubMulDiv)[]; parsedTokensCount: number; }' を型 'InvalidArguments | { args: Expression[]; parsedTokensCount: number; }' に割り当てることはできません。
      型 '{ args: (Literal | Variable | FuncCall | AddSubMulDiv)[]; parsedTokensCount: number; }' を型 '{ args: Expression[]; parsedTokensCount: number; }' に割り当てることはできません。
        プロパティ 'args' の型に互換性がありません。
          型 '(Literal | Variable | FuncCall | AddSubMulDiv)[]' を型 'Expression[]' に割り当てることはできません。
            型 'Literal | Variable | FuncCall | AddSubMulDiv' を型 'Expression' に割り当てることはできません。
              型 'IntLiteral' には 型 'Expression' からの次のプロパティがありません: expression, parsedTokensCountts(2322)
*/

// 主に関数の引数処理
const parseCommaSeparatedExpressions: ParseCommaSeparatedExpressions = (tokens) => {
  const {
    expression: firstExpression,
    parsedTokensCount: firstParsedTokensCount,
  } = parseExpression(tokens);
  if (!firstExpression || !firstParsedTokensCount) {
    return {
      args: [],
      parsedTokensCount: 0,
    };
  }
  const args = [firstExpression];
  let readPosition = firstParsedTokensCount;
  while (tokens[readPosition]?.type === 'Comma') {
    readPosition += 1;
    const { expression, parsedTokensCount } = parseExpression(tokens.slice(readPosition));
    if (!expression || !parsedTokensCount) return new InvalidArguments();
    args.push(expression);
    readPosition += parsedTokensCount;
  }
  return {
    args,
    parsedTokensCount: readPosition,
  };
};

/*
function parseUnaryOperator(tokens) {
  if (tokens[0]?.type === 'Plus' || tokens[0]?.type === 'Minus') {
    const { expression: left, parsedTokensCount } = parseUnaryOperator(tokens.slice(1));
    if (left === null) {
      return { expression: null };
    }
    if (tokens[0].type === 'Plus') {
      return { expression: { type: 'Mul', left }, parsedTokensCount: parsedTokensCount + 1 };
    }
    return {
      type: 'UnaryMinus',
      value: expression,
    };
  }
  return parseExpression(tokens);
}
*/

const parseFunctionCallExpression: ParseFunctionCallExpression = (tokens) => {
  // 関数ではないので括弧の式がないか処理して返す
  if (tokens[0].type !== 'Ident' || tokens[1]?.type !== 'LParen') {
    return parseParenthesisExpression(tokens);
  }

  const name = tokens[0];
  // 引数を処理、スライスは括弧の中身を参照するため
  const argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2));
  // 無効な式配列なので無効な式を返す
  if (!argsAndParsedTokensCount.args) return new InvalidExpression();

  const { args, parsedTokensCount } = argsAndParsedTokensCount;
  // 引数の閉じ括弧が無いので無効な式を返す
  if (tokens[parsedTokensCount + 2]?.type !== 'RParen') return new InvalidExpression();

  return {
    expression: {
      type: 'FuncCall',
      name: name.name,
      arguments: args,
    },
    parsedTokensCount: parsedTokensCount + 3,
  };
};

const parseMulDivExpression: ParseMulDivExpression = (tokens) => {
  const firstExpression = parseFunctionCallExpression(tokens);
  if (!firstExpression.expression) return new InvalidExpression();

  let { expression: left, parsedTokensCount: readPosition } = firstExpression;

  while (tokens[readPosition]?.type === 'Asterisk') {
    const nextExpression = parseFunctionCallExpression(tokens.slice(readPosition + 1));
    if (!nextExpression.expression) return new InvalidExpression();

    const { expression: right, parsedTokensCount: rightTokensCount } = nextExpression;

    left = { type: 'Mul', left, right };
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseAddSubExpression: ParseAddSubExpression = (tokens) => {
  const firstExpression = parseMulDivExpression(tokens);
  if (!firstExpression.expression) return new InvalidExpression();

  let { expression: left, parsedTokensCount: readPosition } = firstExpression;

  while (tokens[readPosition]?.type === 'Plus') {
    const nextExpression = parseMulDivExpression(tokens.slice(readPosition + 1));
    if (!nextExpression.expression) return new InvalidExpression();

    const { expression: right, parsedTokensCount: rightTokensCount } = nextExpression;

    left = { type: 'Add', left, right };
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseExpression: ParseExpression = (tokens) => parseAddSubExpression(tokens);

export default parseExpression;
