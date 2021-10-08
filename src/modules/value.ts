import {
  NullValue,
  IntValue,
  BoolValue,
  Environment,
} from '../types/valueTypes';

export const nullValue: NullValue = {
  type: 'NullValue',
  value: null,
};

export const intValue = (value: number): IntValue => ({
  type: 'IntValue',
  value,
});

export const boolValue = (value: boolean): BoolValue => ({
  type: 'BoolValue',
  value,
});

export const emptyEnvironment: Environment = {
  variables: new Map(),
  functions: new Map(),
};
