"use strict";
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */
Object.defineProperty(exports, "__esModule", { value: true });
var parseLiteral = function (tokens) {
    var head = tokens[0];
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
var parseValue = function (tokens) {
    var head = tokens[0];
    if ((head === null || head === void 0 ? void 0 : head.type) === 'Ident') {
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
var parseParenthesisExpression = function (tokens) {
    var _a, _b;
    // そもそも括弧がないから処理しない
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'LParen')
        return parseValue(tokens);
    // 括弧の中身を式にする
    var _c = parseExpression(tokens.slice(1)), expression = _c.expression, parsedTokensCount = _c.parsedTokensCount;
    // 式が無効か、閉じ括弧が存在しないから処理しない
    if (!expression || !parsedTokensCount || ((_b = tokens[parsedTokensCount + 1]) === null || _b === void 0 ? void 0 : _b.type) !== 'RParen')
        return parseValue(tokens);
    return {
        expression: expression,
        parsedTokensCount: parsedTokensCount + 2,
    };
};
var parseCommaSeparatedExpressions = function (tokens) {
    var _a;
    var _b = parseExpression(tokens), firstExpression = _b.expression, firstParsedTokensCount = _b.parsedTokensCount;
    if (!firstExpression || !firstParsedTokensCount) {
        return {
            args: [],
            parsedTokensCount: 0,
        };
    }
    var args = [firstExpression];
    var readPosition = firstParsedTokensCount;
    while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Comma') {
        readPosition += 1;
        var _c = parseExpression(tokens.slice(readPosition)), expression = _c.expression, parsedTokensCount = _c.parsedTokensCount;
        if (!expression || !parsedTokensCount) {
            return null;
        }
        args.push(expression);
        readPosition += parsedTokensCount;
    }
    return {
        args: args,
        parsedTokensCount: readPosition,
    };
};
function parseUnaryOperator(tokens) {
    var _a, _b;
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) === 'Plus' || ((_b = tokens[0]) === null || _b === void 0 ? void 0 : _b.type) === 'Minus') {
        var _c = parseUnaryOperator(tokens.slice(1)), left = _c.expression, parsedTokensCount = _c.parsedTokensCount;
        if (left === null) {
            return { expression: null };
        }
        if (tokens[0].type === 'Plus') {
            return { expression: { type: 'Mul', left: left }, parsedTokensCount: parsedTokensCount + 1 };
        }
        return {
            type: 'UnaryMinus',
            value: expression,
        };
    }
    return parseExpression(tokens);
}
var parseFunctionCallExpression = function (tokens) {
    var _a, _b;
    var name = tokens[0];
    // 関数ではないので処理しない
    if ((name === null || name === void 0 ? void 0 : name.type) !== 'Ident' || ((_a = tokens[1]) === null || _a === void 0 ? void 0 : _a.type) !== 'LParen') {
        return parseParenthesisExpression(tokens);
    }
    var argsAndParsedTokensCount = parseCommaSeparatedExpressions(tokens.slice(2));
    if (argsAndParsedTokensCount === null) {
        return parseParenthesisExpression(tokens);
    }
    var args = argsAndParsedTokensCount.args, parsedTokensCount = argsAndParsedTokensCount.parsedTokensCount;
    if (((_b = tokens[parsedTokensCount + 2]) === null || _b === void 0 ? void 0 : _b.type) !== 'RParen') {
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
var parseMulDivExpression = function (tokens) {
    var _a;
    // 優先度の高い、関数がないか確認
    var _b = parseFunctionCallExpression(tokens), left = _b.expression, readPosition = _b.parsedTokensCount;
    // 無効な式なのでinvalidExpressionで返却
    if (!left || !readPosition)
        return { expression: left, parsedTokensCount: readPosition };
    while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Asterisk') {
        // 演算子の右側に
        var _c = parseFunctionCallExpression(tokens.slice(readPosition + 1)), right = _c.expression, rightTokensCount = _c.parsedTokensCount;
        if (!right || !rightTokensCount) {
            return { expression: null };
        }
        left = { type: 'Mul', left: left, right: right };
        readPosition += rightTokensCount + 1;
    }
    return { expression: left, parsedTokensCount: readPosition };
};
var parseAddSubExpression = function (tokens) {
    var _a;
    // 優先度の高い、乗除算がないか確認
    var _b = parseMulDivExpression(tokens), left = _b.expression, readPosition = _b.parsedTokensCount;
    if (!left || !readPosition)
        return { expression: left, parsedTokensCount: readPosition };
    while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Plus') {
        var _c = parseFunctionCallExpression(tokens.slice(readPosition + 1)), right = _c.expression, rightTokensCount = _c.parsedTokensCount;
        if (!right || !rightTokensCount) {
            return { expression: null };
        }
        left = { type: 'Add', left: left, right: right };
        readPosition += rightTokensCount + 1;
    }
    return { expression: left, parsedTokensCount: readPosition };
};
var parseExpression = function (tokens) { return parseAddSubExpression(tokens); };
var parseBlock = function (tokens) {
    var _a, _b;
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'LBrace') {
        return { statements: null };
    }
    var statements = [];
    var readPosition = 1;
    while (((_b = tokens[readPosition]) === null || _b === void 0 ? void 0 : _b.type) !== 'RBrace') {
        if (tokens[readPosition] === undefined) {
            return { statements: null };
        }
        var _c = parseStatement(tokens.slice(readPosition)), stmt = _c.statement, parsedTokensCount = _c.parsedTokensCount;
        if (stmt === null) {
            return { statements: null };
        }
        statements.push(stmt);
        readPosition += parsedTokensCount;
    }
    return {
        statements: statements,
        parsedTokensCount: readPosition + 2,
    };
};
var parseIfStatement = function (tokens) {
    var _a, _b, _c;
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'If' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'LParen') {
        return { ifStatement: null };
    }
    var _d = parseExpression(tokens.slice(2)), condition = _d.expression, parsedExpressionTokensCount = _d.parsedTokensCount;
    if (!condition
        || ((_c = tokens[parsedExpressionTokensCount + 2]) === null || _c === void 0 ? void 0 : _c.type) !== 'RParen') {
        return { ifStatement: null };
    }
    var _e = parseBlock(tokens.slice(parsedExpressionTokensCount + 3)), statements = _e.statements, parsedBlockTokensCount = _e.parsedTokensCount;
    if (!statements) {
        return { ifStatement: null };
    }
    return {
        ifStatement: {
            type: 'If',
            condition: condition,
            statements: statements,
        },
        parsedTokensCount: parsedExpressionTokensCount + parsedBlockTokensCount + 3,
    };
};
var parseAssignment = function (tokens) {
    var _a, _b;
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'Ident' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'Equal') {
        return { assignment: null };
    }
    var _c = parseExpression(tokens.slice(2)), expression = _c.expression, parsedTokensCount = _c.parsedTokensCount;
    if (!expression) {
        return { assignment: null };
    }
    return {
        assignment: {
            type: 'Assignment',
            name: tokens[0].name,
            expression: expression,
        },
        parsedTokensCount: parsedTokensCount + 2,
    };
};
var parseStatement = function (tokens) {
    var _a, _b;
    var _c = parseExpression(tokens), expression = _c.expression, parsedExpressionTokensCount = _c.parsedTokensCount;
    if (expression && ((_a = tokens[parsedExpressionTokensCount]) === null || _a === void 0 ? void 0 : _a.type) === 'Semicolon') {
        return {
            statement: expression,
            parsedTokensCount: parsedExpressionTokensCount + 1,
        };
    }
    var _d = parseAssignment(tokens), assignment = _d.assignment, parsedAssignmentTokensCount = _d.parsedTokensCount;
    if (assignment && ((_b = tokens[parsedAssignmentTokensCount]) === null || _b === void 0 ? void 0 : _b.type) === 'Semicolon') {
        return {
            statement: assignment,
            parsedTokensCount: parsedAssignmentTokensCount + 1,
        };
    }
    var _e = parseIfStatement(tokens), ifStatement = _e.ifStatement, parsedIfTokensCount = _e.parsedTokensCount;
    if (ifStatement) {
        return {
            statement: ifStatement,
            parsedTokensCount: parsedIfTokensCount,
        };
    }
    return { statement: null };
};
var parseCommaSeparatedIdentifiers = function (tokens) {
    var _a;
    var head = tokens[0];
    if ((head === null || head === void 0 ? void 0 : head.type) !== 'Ident') {
        return {
            names: [],
            parsedTokensCount: 0,
        };
    }
    var names = [head.name];
    var readPosition = 1;
    while (((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) === 'Comma') {
        readPosition += 1;
        var next = tokens[readPosition];
        if (next.type !== 'Ident') {
            break;
        }
        names.push(next.name);
        readPosition += 1;
    }
    return {
        names: names,
        parsedTokensCount: readPosition,
    };
};
var parseDefineFunction = function (tokens) {
    var _a, _b, _c, _d;
    if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'Def' || ((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.type) !== 'Ident' || ((_c = tokens[2]) === null || _c === void 0 ? void 0 : _c.type) !== 'LParen') {
        return { define: null };
    }
    var name = tokens[1].name;
    var _e = parseCommaSeparatedIdentifiers(tokens.slice(3)), args = _e.names, parsedArgumentTokensCount = _e.parsedTokensCount;
    if (((_d = tokens[parsedArgumentTokensCount + 3]) === null || _d === void 0 ? void 0 : _d.type) !== 'RParen') {
        return { define: null };
    }
    var _f = parseBlock(tokens.slice(parsedArgumentTokensCount + 4)), statements = _f.statements, parsedBlockTokensCount = _f.parsedTokensCount;
    if (!statements) {
        return { define: null };
    }
    return {
        defineFunction: {
            type: 'FuncDef',
            name: name,
            arguments: args,
            statements: statements,
        },
        parsedTokensCount: parsedArgumentTokensCount + parsedBlockTokensCount + 4,
    };
};
var parseSource = function (tokens) {
    var _a;
    var statements = [];
    var readPosition = 0;
    while (readPosition < tokens.length) {
        var _b = parseStatement(tokens.slice(readPosition)), stmt = _b.statement, parsedExpressionTokensCount = _b.parsedTokensCount;
        if (stmt) {
            statements.push(stmt);
            readPosition += parsedExpressionTokensCount;
            continue;
        }
        var _c = parseDefineFunction(tokens.slice(readPosition)), defineFunction = _c.defineFunction, parsedDefineFunctionTokensCount = _c.parsedTokensCount;
        if (defineFunction) {
            statements.push(defineFunction);
            readPosition += parsedDefineFunctionTokensCount;
            continue;
        }
        return {
            type: 'SyntaxError',
            message: "\u4E88\u671F\u3057\u306A\u3044\u30C8\u30FC\u30AF\u30F3`" + ((_a = tokens[readPosition]) === null || _a === void 0 ? void 0 : _a.type) + "`\u304C\u6E21\u3055\u308C\u307E\u3057\u305F",
            headToken: tokens[readPosition],
        };
    }
    return {
        type: 'Source',
        statements: statements,
    };
};
module.exports.parse = parseSource;
