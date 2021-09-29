/* eslint-disable no-use-before-define */
function parseLiteral(tokens) {
  const head = tokens[0]
  switch (head === null || head === void 0 ? void 0 : head.type) {
    case 'Int':
      return {
        expression: {
          type: 'IntLiteral',
          value: head.value,
        },
        parsedTokensCount: 1,
      }
    case 'Bool':
      return {
        expression: {
          type: 'BoolLiteral',
          value: head.value,
        },
        parsedTokensCount: 1,
      }
    case 'Null':
      return {
        expression: {
          type: 'NullLiteral',
        },
        parsedTokensCount: 1,
      }
    default:
      return {
        expression: null,
      }
  }
}
function parseValue(tokens) {
  const head = tokens[0]
  if ((head === null || head === void 0 ? void 0 : head.type) === 'Ident') {
    return {
      expression: {
        type: 'Variable',
        name: head.value,
      },
      parsedTokensCount: 1,
    }
  }
  return parseLiteral(tokens)
}
function parseParenthesisExpression(tokens) {
  let _a; let
    _b
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) === 'LParen') {
    // eslint-disable-next-line no-use-before-define
    const _c = parseExpression(tokens.slice(1)); const { expression } = _c; const
      { parsedTokensCount } = _c
    if (((_b = tokens[parsedTokensCount + 1]) === null || _b === void 0 ? void 0 : _b.type) === 'RParen') {
      return { expression, parsedTokensCount: parsedTokensCount + 2 }
    }
  }
  return parseValue(tokens)
}
function parseCommaSeparatedExpressions(tokens) {
  let _a
  const _b = parseExpression(tokens); const firstExpression = _b.expression; const
    firstParsedTokensCount = _b.parsedTokensCount
  if (firstExpression === null) {
    return {
      args: [],
      parsedTokensCount: 0,
    }
  }
  const args = [firstExpression]
  let readPosition = firstParsedTokensCount
  while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Comma') {
    readPosition += 1
    // eslint-disable-next-line no-use-before-define
    const _c = parseExpression(tokens.slice(readPosition)); const { expression } = _c; const
      { parsedTokensCount } = _c
    if (expression === null) {
      return null
    }
    args.push(expression)
    readPosition += parsedTokensCount
  }
  return {
    args,
    parsedTokensCount: readPosition,
  }
}
function parseFunctionCallExpression(tokens) {
  let _a; let
    _b
  const name = tokens[0]
  const _c = parseUnaryOperator(tokens)
  if ((name === null || name === void 0 ? void 0 : name.type) !== 'Ident' || ((_a = tokens[1]) === null || _a === void 0 ? void 0 : _a.type) !== 'LParen') {
    return parseParenthesisExpression(tokens)
  }
  const argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2))
  if (argsAndParsedTokensCount === null) {
    return parseParenthesisExpression(tokens)
  }
  const { args } = argsAndParsedTokensCount; const
    { parsedTokensCount } = argsAndParsedTokensCount
  if (((_b = tokens[parsedTokensCount + 2]) === null || _b === void 0 ? void 0 : _b.type) !== 'RParen') {
    return parseParenthesisExpression(tokens)
  }
  return {
    expression: {
      type: 'FuncCall',
      name: name.value,
      arguments: args,
    },
    parsedTokensCount: parsedTokensCount + 3,
  }
}
function parseAddSubExpression(tokens) {
  let _a
  const _b = parseMulDivExpression(tokens); let left = _b.expression; let
    readPosition = _b.parsedTokensCount
  while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Plus') {
    const _c = parseFunctionCallExpression(tokens.slice(readPosition + 1)); const right = _c.expression; const
      rightTokensCount = _c.parsedTokensCount
    if (right === null) {
      return { expression: null }
    }
    left = { type: 'Add', left, right }
    readPosition += rightTokensCount + 1
  }
  return { expression: left, parsedTokensCount: readPosition }
}
function parseMulDivExpression(tokens) {
  let _a
  const _b = parseFunctionCallExpression(tokens); let left = _b.expression; let
    readPosition = _b.parsedTokensCount
  while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Asterisk') {
    const _c = parseFunctionCallExpression(tokens.slice(readPosition + 1)); const right = _c.expression; const
      rightTokensCount = _c.parsedTokensCount
    if (right === null) {
      return { expression: null }
    }
    left = { type: 'Mul', left, right }
    readPosition += rightTokensCount + 1
  }
  return { expression: left, parsedTokensCount: readPosition }
}
function parseUnaryOperator(tokens) {
  let _a; let
    _b
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) === 'Plus' || ((_b = tokens[0]) === null || _b === void 0 ? void 0 : _b.type) === 'Minus') {
    const _c = parseUnaryOperator(tokens.slice(1)); const left = _c.expression; const
      { parsedTokensCount } = _c
    if (left === null) {
      return { expression: null }
    }
    if (tokens[0].type === 'Plus') {
      return { expression: { type: 'Mul', left }, parsedTokensCount: parsedTokensCount + 1 }
    }
    return {
      type: 'UnaryMinus',
      value: expression,
    }
  }
  return parseExpression(tokens)
}
function parseExpression(tokens) {
  return parseAddSubExpression(tokens)
}
function parseBlock(tokens) {
  let _a; let
    _b
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'LBrace') {
    return { statements: null }
  }
  const statements = []
  let readPosition = 1
  while (((_b = tokens[readPosition]) === null || _b === void 0 ? void 0 : _b.type) !== 'RBrace') {
    if (tokens[readPosition] === undefined) {
      return { statements: null }
    }
    const _c = parseStatement(tokens.slice(readPosition)); const stmt = _c.statement; const
      { parsedTokensCount } = _c
    if (stmt === null) {
      return { statements: null }
    }
    statements.push(stmt)
    readPosition += parsedTokensCount
  }
  return {
    statements,
    parsedTokensCount: readPosition + 2,
  }
}
function parseIfStatement(tokens) {
  let _a; let _b; let
    _c
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'If' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'LParen') {
    return { ifStatement: null }
  }
  const _d = parseExpression(tokens.slice(2)); const condition = _d.expression; const
    parsedExpressionTokensCount = _d.parsedTokensCount
  if (!condition
        || ((_c = tokens[parsedExpressionTokensCount + 2]) === null || _c === void 0 ? void 0 : _c.type) !== 'RParen') {
    return { ifStatement: null }
  }
  const _e = parseBlock(tokens.slice(parsedExpressionTokensCount + 3)); const { statements } = _e; const
    parsedBlockTokensCount = _e.parsedTokensCount
  if (!statements) {
    return { ifStatement: null }
  }
  return {
    ifStatement: {
      type: 'If',
      condition,
      statements,
    },
    parsedTokensCount: parsedExpressionTokensCount + parsedBlockTokensCount + 3,
  }
}
function parseAssignment(tokens) {
  let _a; let
    _b
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'Ident' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'Equal') {
    return { assignment: null }
  }
  const _c = parseExpression(tokens.slice(2)); const { expression } = _c; const
    { parsedTokensCount } = _c
  if (!expression) {
    return { assignment: null }
  }
  return {
    assignment: {
      type: 'Assignment',
      name: tokens[0].value,
      expression,
    },
    parsedTokensCount: parsedTokensCount + 2,
  }
}
function parseStatement(tokens) {
  let _a; let
    _b
  const _c = parseExpression(tokens); const { expression } = _c; const
    parsedExpressionTokensCount = _c.parsedTokensCount
  if (expression && ((_a = tokens[parsedExpressionTokensCount]) === null || _a === void 0 ? void 0 : _a.type) === 'Semicolon') {
    return {
      statement: expression,
      parsedTokensCount: parsedExpressionTokensCount + 1,
    }
  }
  const _d = parseAssignment(tokens); const { assignment } = _d; const
    parsedAssignmentTokensCount = _d.parsedTokensCount
  if (assignment && ((_b = tokens[parsedAssignmentTokensCount]) === null || _b === void 0 ? void 0 : _b.type) === 'Semicolon') {
    return {
      statement: assignment,
      parsedTokensCount: parsedAssignmentTokensCount + 1,
    }
  }
  const _e = parseIfStatement(tokens); const { ifStatement } = _e; const
    parsedIfTokensCount = _e.parsedTokensCount
  if (ifStatement) {
    return {
      statement: ifStatement,
      parsedTokensCount: parsedIfTokensCount,
    }
  }
  return { statement: null }
}
function parseCommaSeparatedIdentfiers(tokens) {
  let _a
  const head = tokens[0]
  if ((head === null || head === void 0 ? void 0 : head.type) !== 'Ident') {
    return {
      names: [],
      parsedTokensCount: 0,
    }
  }
  const names = [head.value]
  let readPosition = 1
  while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Comma') {
    readPosition += 1
    // eslint-disable-next-line no-use-before-define
    const next = tokens[readPosition]
    if (next.type !== 'Ident') {
      break
    }
    names.push(next.value)
    readPosition += 1
  }
  return {
    names,
    parsedTokensCount: readPosition,
  }
}
function parseDefineFunction(tokens) {
  let _a; let _b; let _c; let
    _d
  if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'Def' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'Ident' || ((_c = tokens[2]) === null || _c === void 0 ? void 0 : _c.type) !== 'LParen') {
    return { define: null }
  }
  const name = tokens[1].value
  const _e = parseCommaSeparatedIdentfiers(tokens.slice(3)); const args = _e.names; const
    parsedArgumentTokensCount = _e.parsedTokensCount
  if (((_d = tokens[parsedArgumentTokensCount + 3]) === null || _d === void 0 ? void 0 : _d.type) !== 'RParen') {
    return { define: null }
  }
  const _f = parseBlock(tokens.slice(parsedArgumentTokensCount + 4)); const { statements } = _f; const
    parsedBlockTokensCount = _f.parsedTokensCount
  if (!statements) {
    return { define: null }
  }
  return {
    defineFunction: {
      type: 'FuncDef',
      name,
      arguments: args,
      statements,
    },
    parsedTokensCount: parsedArgumentTokensCount + parsedBlockTokensCount + 4,
  }
}
function parseSource(tokens) {
  let _a
  const statements = []
  let readPosition = 0
  while (readPosition < tokens.length) {
    const _b = parseStatement(tokens.slice(readPosition)); const stmt = _b.statement; const
      parsedExpressionTokensCount = _b.parsedTokensCount
    if (stmt) {
      statements.push(stmt)
      readPosition += parsedExpressionTokensCount
      // eslint-disable-next-line no-continue
      continue
    }
    const _c = parseDefineFunction(tokens.slice(readPosition)); const { defineFunction } = _c; const
      parsedDefineFunctionTokensCount = _c.parsedTokensCount
    if (defineFunction) {
      statements.push(defineFunction)
      readPosition += parsedDefineFunctionTokensCount
      // eslint-disable-next-line no-continue
      continue
    }
    return {
      type: 'SyntaxError',
      message: `\u4E88\u671F\u3057\u306A\u3044\u30C8\u30FC\u30AF\u30F3\`${(_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type}\`\u304C\u6E21\u3055\u308C\u307E\u3057\u305F`,
      headToken: tokens[readPosition],
    }
  }
  return {
    type: 'Source',
    statements,
  }
}
module.exports.parse = parseSource
