/* eslint-disable max-classes-per-file */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */

import parseExpression from './expressionParser';
import {
  ParseAssignment,
  ParseBlock,
  ParseCommaSeparatedIdentifiers,
  ParseDefineFunction,
  ParseElseStatement,
  ParseIfStatement,
  ParseSource,
  ParseStatement,
  Statement,
} from '../types/statementTypes';

const InvalidStatements = () => ({ statements: null, parsedTokensCount: undefined });

const InvalidStatement = () => ({ statement: null, parsedTokensCount: undefined });

const InvalidIfStatement = () => ({ ifStatement: null, parsedTokensCount: undefined });

const InvalidAssignment = () => ({ assignment: null, parsedTokensCount: undefined });

const InvalidDefineFunction = () => ({ defineFunction: null, parsedTokensCount: undefined });

const parseBlock: ParseBlock = (tokens) => {
  // console.log('parseBlock', tokens);
  if (tokens[0]?.type !== 'LBrace') return InvalidStatements();

  const statements: Statement[] = [];
  let readPosition = 1;

  while (tokens[readPosition]?.type !== 'RBrace') {
    if (!tokens[readPosition]) return InvalidStatements();
    const {
      statement: stmt,
      parsedTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (!stmt || !parsedTokensCount) return InvalidStatements();

    statements.push(stmt);
    readPosition += parsedTokensCount;
  }

  return {
    statements,
    parsedTokensCount: readPosition + 1,
  };
};

const parseIfStatement: ParseIfStatement = (tokens) => {
  if (tokens[0]?.type !== 'If') return InvalidIfStatement();
  const {
    expression: condition,
    parsedTokensCount: parsedExpressionTokensCount,
  } = parseExpression(tokens.slice(1));
  if (!condition || !parsedExpressionTokensCount) return InvalidIfStatement();
  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedExpressionTokensCount + 1));
  if (!statements || !parsedBlockTokensCount) return InvalidIfStatement();

  const parsedElseStmt = parseElseStatement(
    tokens.slice(parsedExpressionTokensCount + parsedBlockTokensCount + 1),
  );
  if (parsedElseStmt.isError) return InvalidIfStatement();

  if (parsedElseStmt.elseStatement) {
    return {
      ifStatement: {
        type: 'If',
        condition,
        ifStatements: statements,
        elseStatements: parsedElseStmt.elseStatement.statements,
      },
      parsedTokensCount: parsedExpressionTokensCount
      + parsedBlockTokensCount
      + parsedElseStmt.parsedTokensCount
      + 1,
    };
  }

  return {
    ifStatement: {
      type: 'If',
      condition,
      ifStatements: statements,
      elseStatements: [],
    },
    parsedTokensCount: parsedExpressionTokensCount + parsedBlockTokensCount + 1,
  };
};

const parseElseStatement: ParseElseStatement = (tokens) => {
  // console.log(tokens);
  if (tokens[0]?.type !== 'Else') {
    return {
      elseStatement: null,
      isError: false,
      parsedTokensCount: undefined,
    };
  }

  const { ifStatement, parsedTokensCount } = parseIfStatement(tokens.slice(1));
  if (ifStatement && parsedTokensCount) {
    return {
      elseStatement: {
        type: 'Else',
        statements: [ifStatement],
      },
      isError: false,
      parsedTokensCount: parsedTokensCount + 1,
    };
  }

  const {
    statements,
    parsedTokensCount: blockTokensCount,
  } = parseBlock(tokens.slice(1));
  if (!statements || !blockTokensCount) {
    return {
      elseStatement: null,
      isError: true,
      parsedTokensCount: undefined,
    };
  }

  return {
    elseStatement: {
      type: 'Else',
      statements,
    },
    isError: false,
    parsedTokensCount: blockTokensCount + 1,
  };
};

const parseAssignment: ParseAssignment = (tokens) => {
  if (tokens[0]?.type !== 'Ident' || tokens[1]?.type !== 'Equal') return InvalidAssignment();
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(2));
  if (!expression || !parsedTokensCount) return InvalidAssignment();
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
  if (parsedExpressionTokensCount && expression && tokens[parsedExpressionTokensCount]?.type === 'Semicolon') {
    return {
      statement: expression,
      parsedTokensCount: parsedExpressionTokensCount + 1,
    };
  }

  const { assignment, parsedTokensCount: parsedAssignmentTokensCount } = parseAssignment(tokens);
  if (parsedAssignmentTokensCount && assignment && tokens[parsedAssignmentTokensCount]?.type === 'Semicolon') {
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

  return InvalidStatement();
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
    return InvalidDefineFunction();
  }
  const {
    names: args,
    parsedTokensCount: parsedArgumentTokensCount,
  } = parseCommaSeparatedIdentifiers(tokens.slice(3));
  if (tokens[parsedArgumentTokensCount + 3]?.type !== 'RParen') return InvalidDefineFunction();

  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedArgumentTokensCount + 4));
  if (!statements || !parsedBlockTokensCount) return InvalidDefineFunction();

  return {
    defineFunction: {
      type: 'FuncDef',
      name: tokens[1].name,
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
