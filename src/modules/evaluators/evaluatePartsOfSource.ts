import { EvaluatePartsOfSource } from '../../types/evaluatorTypes';
import { BoolValue, IntValue, NullValue } from '../../types/valueTypes';
import evaluate from '../evaluator';
import { nullValue } from '../value';

const evaluatePartsOfSource: EvaluatePartsOfSource = (partsOfSource, environment) => {
  let result: IntValue | BoolValue | NullValue = nullValue;
  let env = environment;
  // forEachではreturnを使って値を返せないので書きづらく、
  // またreduceでは条件分岐が複雑になり書きづらいので、for文を使って処理しています
  // eslint-disable-next-line no-restricted-syntax
  for (const part of partsOfSource) {
    const evalResult = evaluate(part, env);
    if (evalResult.isError) {
      return evalResult;
    }
    result = evalResult.result;
    env = evalResult.environment;
  }
  return {
    result,
    isError: false,
    environment: env,
  };
};

export default evaluatePartsOfSource;
