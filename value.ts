import {
  NullValue,
  IntValue,
  BoolValue,
  Environment,
} from './valueTypes';

export const nullValue: NullValue = {
  type: 'NullValue',
  isError: false,
  value: null
};

export const intValue = (value: number): IntValue => ({
  type: 'IntValue',
  isError: false,
  value,
});

export const boolValue = (value: boolean): BoolValue => ({
  type: 'BoolValue',
  isError: false,
  value,
});

export const emptyEnvironment: Environment = {
  variables: new Map(),
  functions: new Map(),
};
