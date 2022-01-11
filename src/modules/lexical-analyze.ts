import { Tokens } from '../types/tokenTypes';

function isDigit(char: string) {
  const charCode = char.charCodeAt(0);
  return '0'.charCodeAt(0) <= charCode && charCode <= '9'.charCodeAt(0);
}

function isIdentChar(char: string) {
  const charCode = char.charCodeAt(0);
  return 'a'.charCodeAt(0) <= charCode && charCode <= 'z'.charCodeAt(0);
}

function countDigits(source: string) {
  let readPosition = 0;
  while (readPosition < source.length) {
    if (!isDigit(source[readPosition])) {
      return readPosition;
    }
    readPosition += 1;
  }
  return readPosition;
}

function countIdentChars(source: string) {
  let readPosition = 0;
  while (readPosition < source.length) {
    if (!isIdentChar(source[readPosition])) {
      return readPosition;
    }
    readPosition += 1;
  }
  return readPosition;
}

const lexicalAnalyze = (source: string): Tokens => {
  const tokens: Tokens = [];
  let readPosition = 0;
  while (readPosition < source.length) {
    switch (source[readPosition]) {
      case '+':
        tokens.push({ type: 'Plus' });
        readPosition += 1;
        break;
      case '-':
        tokens.push({ type: 'Minus' });
        readPosition += 1;
        break;
      case '*':
        tokens.push({ type: 'Asterisk' });
        readPosition += 1;
        break;
      case '/':
        tokens.push({ type: 'Slash' });
        readPosition += 1;
        break;
      case '=':
        if (source[readPosition + 1] === '=') {
          if (source[readPosition + 2] === '=') {
            tokens.push({ type: 'EqualEqualEqual' });
            readPosition += 3;
          } else {
            tokens.push({ type: 'EqualEqual' });
            readPosition += 2;
          }
        } else {
          tokens.push({ type: 'Equal' });
          readPosition += 1;
        }
        break;
      case '<':
        if (source[readPosition + 1] === '=') {
          tokens.push({ type: 'LEqual' });
          readPosition += 2;
        } else {
          tokens.push({ type: 'LThan' });
          readPosition += 1;
        }
        break;
      case '!':
        if (source[readPosition + 1] === '=') {
          if (source[readPosition + 2] === '=') {
            tokens.push({ type: 'NotEqualEqual' });
            readPosition += 3;
          } else {
            tokens.push({ type: 'NotEqual' });
            readPosition += 2;
          }
        } else {
          tokens.push({ type: 'Not' });
          readPosition += 1;
        }
        break;
      case '|':
        if (source[readPosition + 1] === '|') {
          tokens.push({ type: 'PipePipe' });
          readPosition += 2;
        } else {
          tokens.push({ type: 'Pipe' });
          readPosition += 1;
        }
        break;
      case '&':
        if (source[readPosition + 1] === '&') {
          tokens.push({ type: 'AndAnd' });
          readPosition += 2;
        } else {
          tokens.push({ type: 'And' });
          readPosition += 1;
        }
        break;
      case '(':
        tokens.push({ type: 'LParen' });
        readPosition += 1;
        break;
      case ')':
        tokens.push({ type: 'RParen' });
        readPosition += 1;
        break;
      case '{':
        tokens.push({ type: 'LBrace' });
        readPosition += 1;
        break;
      case '}':
        tokens.push({ type: 'RBrace' });
        readPosition += 1;
        break;
      case ',':
        tokens.push({ type: 'Comma' });
        readPosition += 1;
        break;
      case ';':
        tokens.push({ type: 'Semicolon' });
        readPosition += 1;
        break;
      case ' ':
      case '\t':
      case '\n':
        readPosition += 1;
        break;
      default:
        if (isDigit(source[readPosition])) {
          const digitsCount = countDigits(source.substring(readPosition));
          tokens.push({
            type: 'Int',
            value: parseInt(source.substring(readPosition, readPosition + digitsCount), 10),
          });
          readPosition += digitsCount;
        } else if (isIdentChar(source[readPosition])) {
          const identCharsCount = countIdentChars(source.substring(readPosition));
          const name = source.substring(readPosition, readPosition + identCharsCount);
          switch (name) {
            case 'if':
              tokens.push({ type: 'If' });
              break;
            case 'else':
              tokens.push({ type: 'Else' });
              break;
            case 'def':
              tokens.push({ type: 'Def' });
              break;
            case 'true':
            case 'false':
              tokens.push({ type: 'Bool', value: name === 'true' });
              break;
            case 'null':
              tokens.push({ type: 'Null' });
              break;
            default:
              tokens.push({ type: 'Ident', name });
          }
          readPosition += identCharsCount;
        } else {
          // 不明な文字
          tokens.push({
            type: 'UnknownCharacter',
            value: source[readPosition],
          });
          readPosition += 1;
        }
    }
  }
  return tokens;
};

export default lexicalAnalyze;
