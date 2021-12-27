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
  ParseForStatement,
  ParseIfStatement,
  ParseSource,
  ParseStatement,
  Statement,
} from '../types/statementTypes';

const InvalidStatements = () => ({ statements: null, parsedTokensCount: undefined });

const InvalidStatement = () => ({ statement: null, parsedTokensCount: undefined });

const InvalidIfStatement = () => ({ ifStatement: null, parsedTokensCount: undefined });

const InvalidAssignment = () => ({ assignment: null, parsedTokensCount: undefined });

const InvalidForStatement = () => ({ forStatement: null, parsedTokensCount: undefined });

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

const parseForStatement: ParseForStatement = (tokens) => {
  if (tokens[0]?.type !== 'for' || tokens[1]?.type !== 'LParen') return InvalidForStatement();
  let readPosition = 2;
  const {
    statement: initialization,
    parsedTokensCount: initializeTokensCount,
  } = parseStatement(tokens.slice(readPosition));
  if (!initialization || !initializeTokensCount) return InvalidForStatement();
  readPosition += initializeTokensCount + 1;

  const {
    expression: termination,
    parsedTokensCount: terminationTokensCount,
  } = parseExpression(tokens.slice(readPosition));
  if (!termination || !terminationTokensCount) return InvalidForStatement();
  readPosition += terminationTokensCount + 1;

  const {
    statement: increment,
    parsedTokensCount: incrementParsedTokensCount,
  } = parseStatement(tokens.slice(readPosition));
  if (!increment || !incrementParsedTokensCount) return InvalidForStatement();
  readPosition += incrementParsedTokensCount + 1;
  if (tokens[readPosition]?.type !== 'RParen') return InvalidForStatement();
  readPosition += 1;

  const {
    statements,
    parsedTokensCount,
  } = parseBlock(tokens.slice(readPosition));
  if (!statements || !parsedTokensCount) return InvalidForStatement();
  return {
    forStatement: {
      type: 'For',
      initialization,
      termination,
      increment,
      statements,
    },
    parsedTokensCount: readPosition + parsedTokensCount,
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

  const { forStatement, parsedTokensCount: parsedForTokensCount } = parseForStatement(tokens);
  if (forStatement && parsedForTokensCount) {
    return {
      statement: forStatement,
      parsedTokensCount: parsedForTokensCount,
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
