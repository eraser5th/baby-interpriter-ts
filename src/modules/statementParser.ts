/* eslint-disable max-classes-per-file */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import parseExpression from './expressionParser';
import {
  ParseAssignment,
  ParseBlock,
  ParseCommaSeparatedIdentifiers,
  ParseDefineFunction,
  ParseIfStatement,
  ParseSource,
  ParseStatement,
  Statement,
} from '../types/statementAssignmentTypes';

class InvalidStatements {
  statements: null

  parsedTokensCount: undefined

  constructor() {
    this.statements = null;
    this.parsedTokensCount = undefined;
  }
}

class InvalidStatement {
  statement: null

  parsedTokensCount: undefined

  constructor() {
    this.statement = null;
    this.parsedTokensCount = undefined;
  }
}

class InvalidIfStatement {
  ifStatement: null

  parsedTokensCount: undefined

  constructor() {
    this.ifStatement = null;
    this.parsedTokensCount = undefined;
  }
}

class InvalidAssignment {
  assignment: null

  parsedTokensCount: undefined

  constructor() {
    this.assignment = null;
    this.parsedTokensCount = undefined;
  }
}

class InvalidDefineFunction {
  defineFunction: null

  parsedTokensCount: undefined

  constructor() {
    this.defineFunction = null;
    this.parsedTokensCount = undefined;
  }
}

const parseBlock: ParseBlock = (tokens) => {
  // Blockでは無いので無効な文配列を返す
  if (tokens[0]?.type !== 'LBrace') {
    return new InvalidStatements();
  }
  const statements: Statement[] = [];
  let readPosition = 1;
  while (tokens[readPosition]?.type !== 'RBrace') {
    // 閉じ括弧がなかったので無効な文配列を返す
    if (!tokens[readPosition]) {
      return new InvalidStatements();
    }
    const {
      statement: stmt,
      parsedTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    // 無効な文なので無効な文配列を返す
    if (!stmt || !parsedTokensCount) {
      return new InvalidStatements();
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
  // If文でない
  if (tokens[0]?.type !== 'If' || tokens[1]?.type !== 'LParen') {
    return new InvalidIfStatement();
  }
  // If文の条件式を取得
  const {
    expression: condition,
    parsedTokensCount: parsedExpressionTokensCount,
  } = parseExpression(tokens.slice(2));
  if (!condition || !parsedExpressionTokensCount) {
    return new InvalidIfStatement();
  }
  if (tokens[parsedExpressionTokensCount + 2]?.type !== 'RParen') {
    return new InvalidIfStatement();
  }

  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedExpressionTokensCount + 3));
  if (!statements || !parsedBlockTokensCount) {
    return new InvalidIfStatement();
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
    return new InvalidAssignment();
  }
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(2));
  if (!expression || !parsedTokensCount) {
    return new InvalidAssignment();
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
  if (!expression || !parsedExpressionTokensCount) {
    return new InvalidStatement();
  }
  if (expression && tokens[parsedExpressionTokensCount]?.type === 'Semicolon') {
    return {
      statement: expression,
      parsedTokensCount: parsedExpressionTokensCount + 1,
    };
  }

  const { assignment, parsedTokensCount: parsedAssignmentTokensCount } = parseAssignment(tokens);
  if (!expression || !parsedAssignmentTokensCount) {
    return new InvalidStatement();
  }
  if (assignment && tokens[parsedAssignmentTokensCount]?.type === 'Semicolon') {
    return {
      statement: assignment,
      parsedTokensCount: parsedAssignmentTokensCount + 1,
    };
  }

  const { ifStatement, parsedTokensCount: parsedIfTokensCount } = parseIfStatement(tokens);
  if (ifStatement && parsedIfTokensCount) {
    return {
      statement: ifStatement,
      parsedTokensCount: parsedIfTokensCount,
    };
  }

  return new InvalidStatement();
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
    return new InvalidDefineFunction();
  }
  const { name } = tokens[1];
  const {
    names: args,
    parsedTokensCount: parsedArgumentTokensCount,
  } = parseCommaSeparatedIdentifiers(tokens.slice(3));
  if (tokens[parsedArgumentTokensCount + 3]?.type !== 'RParen') {
    return new InvalidDefineFunction();
  }

  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedArgumentTokensCount + 4));
  if (!statements || !parsedBlockTokensCount) {
    return new InvalidDefineFunction();
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

const parseSource: ParseSource = (tokens) => {
  const partsOfSource = [];
  let readPosition = 0;
  while (readPosition < tokens.length) {
    const {
      statement: stmt,
      parsedTokensCount: parsedExpressionTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (stmt && parsedExpressionTokensCount) {
      partsOfSource.push(stmt);
      readPosition += parsedExpressionTokensCount;
      continue;
    }

    const {
      defineFunction,
      parsedTokensCount: parsedDefineFunctionTokensCount,
    } = parseDefineFunction(tokens.slice(readPosition));
    if (defineFunction && parsedDefineFunctionTokensCount) {
      partsOfSource.push(defineFunction);
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
    partsOfSource,
  };
};

export default parseSource;
