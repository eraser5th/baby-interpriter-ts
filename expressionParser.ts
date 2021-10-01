/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import { Expression } from 'typescript';
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
  Tokens,
} from './types';

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
      return {
        expression: null,
      };
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
  // そもそも括弧がないからバリューを返す
  if (tokens[0]?.type !== 'LParen') return parseValue(tokens);
  // 括弧の中身を式にする
  const parsedExpression = parseExpression(tokens.slice(1));
  // 式が無効なので無効な式を返す
  if (!parsedExpression.expression) {
    return { expression: null, parsedTokensCount: undefined };
  }
  const { expression, parsedTokensCount } = parsedExpression;
  // 閉じ括弧が存在しないので無効な式を返す
  if (tokens[parsedTokensCount + 1]?.type !== 'RParen') {
    return { expression: null, parsedTokensCount: undefined };
  }

  return {
    expression,
    parsedTokensCount: parsedTokensCount + 2,
  };
};

// 主に関数の引数処理
const parseCommaSeparatedExpressions: ParseCommaSeparatedExpressions = (tokens) => {
  // 第一引数を取得
  const parsedFirstExpression = parseExpression(tokens);
  const argsAndTokensCount: {args: Expression[], parsedTokensCount: number} = {
    args: [],
    parsedTokensCount: 0,
  };
  // 第一引数が存在しないので空の式配列で返す
  if (!parsedFirstExpression.expression) return argsAndTokensCount;

  // 第一引数が存在するのでargsに挿入
  argsAndTokensCount.args.push(parsedFirstExpression.expression);
  // 第二引数の参照に備える
  let readPosition = parsedFirstExpression.parsedTokensCount;

  // 第二引数以降をargsに順次挿入
  while (tokens[readPosition]?.type === 'Comma') {
    readPosition += 1;
    const parsedExpression = parseExpression(tokens.slice(readPosition));
    // 無効な式が帰ってきたので無効な式配列を返す
    if (!parsedExpression.expression) {
      return {
        args: null,
        parsedTokensCount: undefined,
      };
    }
    // 引数を挿入
    argsAndTokensCount.args.push(parsedExpression.expression);
    // 今回の引数で使った分Tokenを進める
    readPosition += parsedExpression.parsedTokensCount;
  }

  return argsAndTokensCount;
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
  const name = tokens[0];
  // 関数ではないので括弧の式がないか処理して返す
  if (name?.type !== 'Ident' || tokens[1]?.type !== 'LParen') {
    return parseParenthesisExpression(tokens);
  }
  // 引数を処理
  const argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2));
  // 無効な式配列なので無効な式を返す
  if (argsAndParsedTokensCount.args === null) {
    return { expression: null, parsedTokensCount: undefined };
  }

  const { args, parsedTokensCount } = argsAndParsedTokensCount;
  // 引数の閉じ括弧が無い
  if (tokens[parsedTokensCount + 2]?.type !== 'RParen') return parseParenthesisExpression(tokens);

  return {
    expression: {
      type: 'FuncCall',
      name: name.name,
      arguments: args,
    },
    parsedTokensCount: parsedTokensCount + 3,
  };
};

// eslint-disable-next-line no-unused-vars
type hoge = (tokens: Tokens) => {
  expression: null,
  parsedTokensCount: undefined,
} | {

}

const parseMulDivExpression: ParseMulDivExpression = (tokens) => {
  // 優先度の高い、関数がないか確認
  let { expression: left, parsedTokensCount: readPosition } = parseFunctionCallExpression(tokens);
  // 無効な式なのでinvalidExpressionで返却
  if (!left || !readPosition) return { expression: left, parsedTokensCount: readPosition };
  while (tokens[readPosition]?.type === 'Asterisk') {
    // 演算子の右側を順次処理
    const {
      expression: right,
      parsedTokensCount: rightTokensCount,
    } = parseFunctionCallExpression(tokens.slice(readPosition + 1));
    if (!right || !rightTokensCount) {
      return { expression: null, parsedTokensCount: undefined };
    }
    left = { type: 'Mul', left, right };
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseAddSubExpression: ParseAddSubExpression = (tokens) => {
  // 優先度の高い、乗除算がないか確認
  let { expression: left, parsedTokensCount: readPosition } = parseMulDivExpression(tokens);
  if (!left || !readPosition) return { expression: left, parsedTokensCount: readPosition };
  while (tokens[readPosition]?.type === 'Plus') {
    const {
      expression: right,
      parsedTokensCount: rightTokensCount,
    } = parseFunctionCallExpression(tokens.slice(readPosition + 1));
    if (!right || !rightTokensCount) {
      return { expression: null, parsedTokensCount: undefined };
    }
    left = { type: 'Add', left, right };
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseExpression: ParseExpression = (tokens) => parseAddSubExpression(tokens);

export default parseExpression;
