/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import parseExpression from './expressionParser';
import {
  // Statement & Assignment
  ParseBlock,
  ParseAssignment,
  ParseCommaSeparatedIdentifiers,
  ParseDefineFunction,
  ParseIfStatement,
  ParseSource,
  ParseStatement,
  InvalidExpression,
  Expression,
} from './types';

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
