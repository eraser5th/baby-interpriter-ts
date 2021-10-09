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
} from '../types/statementTypes';

const InvalidStatements = () => ({ statements: null, parsedTokensCount: undefined });

const InvalidStatement = () => ({ statement: null, parsedTokensCount: undefined });

const InvalidIfStatement = () => ({ ifStatement: null, parsedTokensCount: undefined });

const InvalidAssignment = () => ({ assignment: null, parsedTokensCount: undefined });

const InvalidDefineFunction = () => ({ defineFunction: null, parsedTokensCount: undefined });

const parseBlock: ParseBlock = (tokens) => {
  // Blockでは無いので無効な文配列を返す
  if (tokens[0]?.type !== 'LBrace') return InvalidStatements();

  const statements: Statement[] = [];
  let readPosition = 1;

  while (tokens[readPosition]?.type !== 'RBrace') {
    // 閉じ括弧がなかったので無効な文配列を返す
    if (!tokens[readPosition]) return InvalidStatements();

    // 文を取得
    const {
      statement: stmt,
      parsedTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (!stmt || !parsedTokensCount) return InvalidStatements();

    statements.push(stmt);
    readPosition += parsedTokensCount;
  }

  // 正常な文配列を返却
  return {
    statements,
    parsedTokensCount: readPosition + 2,
  };
};

const parseIfStatement: ParseIfStatement = (tokens) => {
  // If文でない
  if (tokens[0]?.type !== 'If') return InvalidIfStatement();

  // If文の条件式を取得
  const {
    expression: condition,
    parsedTokensCount: parsedExpressionTokensCount,
  } = parseExpression(tokens.slice(1));
  if (!condition || !parsedExpressionTokensCount) return InvalidIfStatement();

  // If文の実行部分を取得
  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedExpressionTokensCount + 1));
  if (!statements || !parsedBlockTokensCount) return InvalidIfStatement();

  // 正常なIf文を返却
  return {
    ifStatement: {
      type: 'If',
      condition,
      statements,
    },
    parsedTokensCount: parsedExpressionTokensCount + parsedBlockTokensCount + 1,
  };
};

const parseAssignment: ParseAssignment = (tokens) => {
  // 代入文でない
  if (tokens[0]?.type !== 'Ident' || tokens[1]?.type !== 'Equal') return InvalidAssignment();

  // 代入する値、式を取得
  const { expression, parsedTokensCount } = parseExpression(tokens.slice(2));
  if (!expression || !parsedTokensCount) return InvalidAssignment();

  // 正常な代入文を返却
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
  // 式であるか検証
  const { expression, parsedTokensCount: parsedExpressionTokensCount } = parseExpression(tokens);
  if (parsedExpressionTokensCount && expression && tokens[parsedExpressionTokensCount]?.type === 'Semicolon') {
    return {
      statement: expression,
      parsedTokensCount: parsedExpressionTokensCount + 1,
    };
  }

  // 代入文であるか検証
  const { assignment, parsedTokensCount: parsedAssignmentTokensCount } = parseAssignment(tokens);
  if (parsedAssignmentTokensCount && assignment && tokens[parsedAssignmentTokensCount]?.type === 'Semicolon') {
    return {
      statement: assignment,
      parsedTokensCount: parsedAssignmentTokensCount + 1,
    };
  }

  // If文であるか検証
  const { ifStatement, parsedTokensCount: parsedIfTokensCount } = parseIfStatement(tokens);
  if (ifStatement && parsedIfTokensCount) {
    return {
      statement: ifStatement,
      parsedTokensCount: parsedIfTokensCount,
    };
  }

  // どれでもないので無効な文を返す
  return InvalidStatement();
};

const parseCommaSeparatedIdentifiers: ParseCommaSeparatedIdentifiers = (tokens) => {
  // 第一仮引数を取得
  const head = tokens[0];
  if (head?.type !== 'Ident') {
    return {
      names: [],
      parsedTokensCount: 0,
    };
  }

  const names = [head.name];
  let readPosition = 1;

  // 第一仮引数以降を取得
  while (tokens[readPosition]?.type === 'Comma') {
    readPosition += 1;
    const next = tokens[readPosition];
    if (next.type !== 'Ident') {
      break;
    }
    names.push(next.name);
    readPosition += 1;
  }

  // 仮引数たちを返却
  return {
    names,
    parsedTokensCount: readPosition,
  };
};

const parseDefineFunction: ParseDefineFunction = (tokens) => {
  if (tokens[0]?.type !== 'Def' || tokens[1]?.type !== 'Ident' || tokens[2]?.type !== 'LParen') {
    return InvalidDefineFunction();
  }

  // 仮引数を取得
  const {
    names: args,
    parsedTokensCount: parsedArgumentTokensCount,
  } = parseCommaSeparatedIdentifiers(tokens.slice(3));
  if (tokens[parsedArgumentTokensCount + 3]?.type !== 'RParen') return InvalidDefineFunction();

  // 実行部分を取得
  const {
    statements,
    parsedTokensCount: parsedBlockTokensCount,
  } = parseBlock(tokens.slice(parsedArgumentTokensCount + 4));
  if (!statements || !parsedBlockTokensCount) return InvalidDefineFunction();

  // 正常な関数宣言を返却
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
    // 文を取得
    const {
      statement: stmt,
      parsedTokensCount: parsedExpressionTokensCount,
    } = parseStatement(tokens.slice(readPosition));
    if (stmt && parsedExpressionTokensCount) {
      partsOfSource.push(stmt);
      readPosition += parsedExpressionTokensCount;
      continue;
    }

    // 関数宣言を取得
    const {
      defineFunction,
      parsedTokensCount: parsedDefineFunctionTokensCount,
    } = parseDefineFunction(tokens.slice(readPosition));
    if (defineFunction && parsedDefineFunctionTokensCount) {
      partsOfSource.push(defineFunction);
      readPosition += parsedDefineFunctionTokensCount;
      continue;
    }

    // どちらでもないので、SyntaxErrorを返却
    return {
      type: 'SyntaxError',
      message: `予期しないトークン\`${tokens[readPosition]?.type}\`が渡されました`,
      headToken: tokens[readPosition],
    };
  }

  // 正常なソースを返却
  return {
    type: 'Source',
    partsOfSource,
  };
};

export default parseSource;
