import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { isPriorityFilterValue, PRIORITY_LABEL, PRIORITIES } from '../../types';
import type { PriorityFilterOption, PriorityFilterProps } from './types';

const FILTERS: PriorityFilterOption[] = [
  { value: 'all', label: 'Все' },
  ...PRIORITIES.map((priority) => ({
    value: priority,
    label: PRIORITY_LABEL[priority],
  })),
];

export const PriorityFilter = ({ value, onChange }: PriorityFilterProps) => {
  const handleChange = (_event: MouseEvent<HTMLElement>, next: string | null) => {
    if (!next || !isPriorityFilterValue(next)) {
      return;
    }

    onChange(next);
  };

  return (
    <Box component="search" aria-label="Фильтр по приоритету" sx={{ mb: 2 }}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        aria-label="Приоритет"
        sx={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {FILTERS.map((filter) => (
          <ToggleButton key={filter.value} value={filter.value}>
            {filter.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
