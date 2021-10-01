import {
  NullValue,
  IntValue,
  BoolValue,
  EmptyEnvironment,
} from './valueTypes';

export const nullValue: NullValue = {
  type: 'NullValue',
  isError: false,
};

export const intValue = (value: number): IntValue => ({
  type: 'IntValue',
  isError: false,
  value,
});

export const boolBalue = (value: boolean): BoolValue => ({
  type: 'BoolValue',
  isError: false,
  value,
});

export const emptyEnvironment: EmptyEnvironment = {
  variables: new Map(),
  functions: new Map(),
};
