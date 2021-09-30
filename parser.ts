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
  // Statement & Assignment
  ParseBlock,
  ParseAssignment,
  ParseCommaSeparatedExpressions,
  ParseCommaSeparatedIdentifiers,
  ParseDefineFunction,
  ParseIfStatement,
  ParseSource,
  ParseStatement,
  InvalidExpression,
  Expression,
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
  if (tokens[0]?.type !== 'LParen') return parseValue(tokens);
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(1));
  if (!expression || !parsedTokensCount || tokens[parsedTokensCount + 1]?.type !== 'RParen') return parseValue(tokens);
  return {
    expression,
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

const parseFunctionCallExpression: ParseFunctionCallExpression = (tokens) => {
  const name = tokens[0];
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
  let { expression: left, parsedTokensCount: readPosition } = parseFunctionCallExpression(tokens);
  if (!left || !readPosition) return { expression: left, parsedTokensCount: readPosition };
  while (tokens[readPosition]?.type === 'Asterisk') {
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

const parseBlock: ParseBlock = (tokens) => {
  if (tokens[0]?.type !== 'LBrace') {
    return { statements: null };
  }
  const statements = [];
  let readPosition = 1;
  while (tokens[readPosition]?.type !== 'RBrace') {
    if (tokens[readPosition] === undefined) {
      return { statements: null };
    }
    const {
      statement: stmt,
      parsedTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (stmt === null) {
      return { statements: null };
    }
    statements.push(stmt);
    readPosition += parsedTokensCount;
  }
  return {
    statements,
    parsedTokensCount: readPosition + 2,
  };
};

const parseIfStatement: ParseIfStatement = (tokens) => {
  if (tokens[0]?.type !== 'If' || tokens[1]?.type !== 'LParen') {
    return { ifStatement: null };
  }
  const {
    expression: condition,
    parsedTokensCount: parsedExpressionTokensCount,
  } = parseExpression(tokens.slice(2));
  if (
    !condition
    || tokens[parsedExpressionTokensCount + 2]?.type !== 'RParen') {
    return { ifStatement: null };
  }
  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedExpressionTokensCount + 3));
  if (!statements) {
    return { ifStatement: null };
  }
  return {
    ifStatement: {
      type: 'If',
      condition,
      statements,
    },
    parsedTokensCount: parsedExpressionTokensCount + parsedBlockTokensCount + 3,
  };
};

const parseAssignment: ParseAssignment = (tokens) => {
  if (tokens[0]?.type !== 'Ident' || tokens[1]?.type !== 'Equal') {
    return { assignment: null };
  }
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(2));
  if (!expression) {
    return { assignment: null };
  }
  return {
    assignment: {
      type: 'Assignment',
      name: tokens[0].name,
      expression,
    },
    parsedTokensCount: parsedTokensCount + 2,
  };
};

const parseStatement: ParseStatement = (tokens) => {
  const { expression, parsedTokensCount: parsedExpressionTokensCount } = parseExpression(tokens);
  if (expression && tokens[parsedExpressionTokensCount]?.type === 'Semicolon') {
    return {
      statement: expression,
      parsedTokensCount: parsedExpressionTokensCount + 1,
    };
  }
  const { assignment, parsedTokensCount: parsedAssignmentTokensCount } = parseAssignment(tokens);
  if (assignment && tokens[parsedAssignmentTokensCount]?.type === 'Semicolon') {
    return {
      statement: assignment,
      parsedTokensCount: parsedAssignmentTokensCount + 1,
    };
  }
  const { ifStatement, parsedTokensCount: parsedIfTokensCount } = parseIfStatement(tokens);
  if (ifStatement) {
    return {
      statement: ifStatement,
      parsedTokensCount: parsedIfTokensCount,
    };
  }
  return { statement: null };
};

const parseCommaSeparatedIdentifiers: ParseCommaSeparatedIdentifiers = (tokens) => {
  const head = tokens[0];
  if (head?.type !== 'Ident') {
    return {
      names: [],
      parsedTokensCount: 0,
    };
  }
  const names = [head.name];
  let readPosition = 1;
  while (tokens[readPosition]?.type === 'Comma') {
    readPosition += 1;
    const next = tokens[readPosition];
    if (next.type !== 'Ident') {
      break;
    }
    names.push(next.name);
    readPosition += 1;
  }
  return {
    names,
    parsedTokensCount: readPosition,
  };
};

const parseDefineFunction: ParseDefineFunction = (tokens) => {
  if (tokens[0]?.type !== 'Def' || tokens[1]?.type !== 'Ident' || tokens[2]?.type !== 'LParen') {
    return { define: null };
  }
  const { name } = tokens[1];
  const {
    names: args,
    parsedTokensCount: parsedArgumentTokensCount,
  } = parseCommaSeparatedIdentifiers(tokens.slice(3));
  if (tokens[parsedArgumentTokensCount + 3]?.type !== 'RParen') {
    return { define: null };
  }
  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedArgumentTokensCount + 4));
  if (!statements) {
    return { define: null };
  }
  return {
    defineFunction: {
      type: 'FuncDef',
      name,
      arguments: args,
      statements,
    },
    parsedTokensCount: parsedArgumentTokensCount + parsedBlockTokensCount + 4,
  };
};

const parseSource: ParseSource = function (tokens) {
  const statements = [];
  let readPosition = 0;
  while (readPosition < tokens.length) {
    const {
      statement: stmt,
      parsedTokensCount: parsedExpressionTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (stmt) {
      statements.push(stmt);
      readPosition += parsedExpressionTokensCount;
      continue;
    }
    const {
      defineFunction,
      parsedTokensCount: parsedDefineFunctionTokensCount,
    } = parseDefineFunction(tokens.slice(readPosition));
    if (defineFunction) {
      statements.push(defineFunction);
      readPosition += parsedDefineFunctionTokensCount;
      continue;
    }
    return {
      type: 'SyntaxError',
      message: `予期しないトークン\`${tokens[readPosition]?.type}\`が渡されました`,
      headToken: tokens[readPosition],
    };
  }
  return {
    type: 'Source',
    statements,
  };
};

module.exports.parse = parseSource;
