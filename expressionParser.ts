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
  // そもそも括弧がないから処理しない
  if (tokens[0]?.type !== 'LParen') return parseValue(tokens);
  // 括弧の中身を式にする
  const parsedExpression = parseExpression(tokens.slice(1));
  // 式が無効か、閉じ括弧が存在しないから処理しない
  const { expression, parsedTokensCount } = parsedExpression;
  if (!expression) return parseValue(tokens);
  if (tokens[parsedExpression.parsedTokensCount + 1]?.type !== 'RParen') return parseValue(tokens);

  return {
    expression: parsedExpression.expression,
    parsedTokensCount: parsedTokensCount + 2,
  };
};

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
    if (!expression || !parsedTokensCount) {
      return null;
    }
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
  const name = tokens[0];
  // 関数ではないので処理しない
  if (name?.type !== 'Ident' || tokens[1]?.type !== 'LParen') {
    return parseParenthesisExpression(tokens);
  }
  const argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2));
  if (argsAndParsedTokensCount === null) {
    return parseParenthesisExpression(tokens);
  }
  const { args, parsedTokensCount } = argsAndParsedTokensCount;
  if (tokens[parsedTokensCount + 2]?.type !== 'RParen') {
    return parseParenthesisExpression(tokens);
  }
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
  // 優先度の高い、関数がないか確認
  let { expression: left, parsedTokensCount: readPosition } = parseFunctionCallExpression(tokens);
  // 無効な式なのでinvalidExpressionで返却
  if (!left || !readPosition) return { expression: left, parsedTokensCount: readPosition };
  while (tokens[readPosition]?.type === 'Asterisk') {
    // 演算子の右側に
    const {
      expression: right,
      parsedTokensCount: rightTokensCount,
    } = parseFunctionCallExpression(tokens.slice(readPosition + 1));
    if (!right || !rightTokensCount) {
      return { expression: null };
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
      return { expression: null };
    }
    left = { type: 'Add', left, right };
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseExpression: ParseExpression = (tokens) => parseAddSubExpression(tokens);

export default parseExpression;
