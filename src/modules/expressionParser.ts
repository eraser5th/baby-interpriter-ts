/* eslint-disable max-len */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import {
  ParseLiteral,
  ParseValue,
  ParseParenthesisExpression,
  ParseFunctionCallExpression,
  ParseMulDivExpression,
  ParseAddSubExpression,
  ParseExpression,
  ParseCommaSeparatedExpressions,
  ParseUnaryOperator,
} from '../types/expressionTypes';

const InvalidExpression = () => ({
  expression: null,
  parsedTokensCount: undefined,
});

const InvalidArguments = () => ({
  args: null,
  parsedTokensCount: undefined,
});

const parseLiteral: ParseLiteral = (tokens) => {
  if (tokens.length === 0) {
    return InvalidExpression();
  }
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
      return InvalidExpression();
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

const parseUnaryOperator: ParseUnaryOperator = (tokens) => {
  if (tokens[0]?.type !== 'Plus' && tokens[0]?.type !== 'Minus') {
    return parseValue(tokens);
  }
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(1));
  if (!expression || !parsedTokensCount) return InvalidExpression();

  if (tokens[0]?.type === 'Plus') {
    return {
      expression: {
        type: 'UnaryPlus',
        expression,
      },
      parsedTokensCount: parsedTokensCount + 1,
    };
  }
  return {
    expression: {
      type: 'UnaryMinus',
      expression,
    },
    parsedTokensCount: parsedTokensCount + 1,
  };
};

// 括弧も含んで処理
const parseParenthesisExpression: ParseParenthesisExpression = (tokens) => {
  if (tokens[0]?.type !== 'LParen') return parseUnaryOperator(tokens);

  const { expression, parsedTokensCount } = parseExpression(tokens.slice(1));

  if (!expression || !parsedTokensCount) return InvalidExpression();
  if (tokens[parsedTokensCount + 1]?.type !== 'RParen') return InvalidExpression();

  return {
    expression,
    parsedTokensCount: parsedTokensCount + 2,
  };
};

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
    if (!expression || !parsedTokensCount) return InvalidArguments();
    args.push(expression);
    readPosition += parsedTokensCount;
  }
  return {
    args,
    parsedTokensCount: readPosition,
  };
};

const parseFunctionCallExpression: ParseFunctionCallExpression = (tokens) => {
  if (tokens[0]?.type !== 'Ident' || tokens[1]?.type !== 'LParen') {
    return parseParenthesisExpression(tokens);
  }

  const argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2));
  if (!argsAndParsedTokensCount.args) return InvalidExpression();

  const { args, parsedTokensCount } = argsAndParsedTokensCount;
  if (tokens[parsedTokensCount + 2]?.type !== 'RParen') return InvalidExpression();

  return {
    expression: {
      type: 'FuncCall',
      name: tokens[0].name,
      arguments: args,
    },
    parsedTokensCount: parsedTokensCount + 3,
  };
};

const parseMulDivExpression: ParseMulDivExpression = (tokens) => {
  const firstExpression = parseFunctionCallExpression(tokens);
  if (!firstExpression.expression) return InvalidExpression();

  let { expression: left, parsedTokensCount: readPosition } = firstExpression;

  while (tokens[readPosition]?.type === 'Asterisk' || tokens[readPosition]?.type === 'Slash') {
    const nextExpression = parseFunctionCallExpression(tokens.slice(readPosition + 1));
    if (!nextExpression.expression) return InvalidExpression();

    const { expression: right, parsedTokensCount: rightTokensCount } = nextExpression;

    if (tokens[readPosition]?.type === 'Asterisk') {
      left = { type: 'Mul', left, right };
    } else {
      left = { type: 'Div', left, right };
    }
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseAddSubExpression: ParseAddSubExpression = (tokens) => {
  const firstExpression = parseMulDivExpression(tokens);
  if (!firstExpression.expression) return InvalidExpression();

  let { expression: left, parsedTokensCount: readPosition } = firstExpression;

  while (tokens[readPosition]?.type === 'Plus' || tokens[readPosition]?.type === 'Minus') {
    const nextExpression = parseMulDivExpression(tokens.slice(readPosition + 1));
    if (!nextExpression.expression) return InvalidExpression();

    const { expression: right, parsedTokensCount: rightTokensCount } = nextExpression;

    if (tokens[readPosition]?.type === 'Plus') {
      left = { type: 'Add', left, right };
    } else {
      left = { type: 'Sub', left, right };
    }
    readPosition += rightTokensCount + 1;
  }
  return { expression: left, parsedTokensCount: readPosition };
};

const parseExpression: ParseExpression = (tokens) => parseAddSubExpression(tokens);
export default parseExpression;
