import type { PriorityFilterValue } from '../../types';

export type PriorityFilterOption = {
  value: PriorityFilterValue;
  label: string;
};

export type PriorityFilterProps = {
  value: PriorityFilterValue;
  onChange: (value: PriorityFilterValue) => void;
};
