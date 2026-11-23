import type { TransactionCategory } from './types';

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Kuota: '#7C5CFF',
  Shopping: '#FF5F5F',
  Food: '#FFB020',
  Salary: '#7C5CFF',
  Bills: '#5EA8FF',
  Game: '#C77DFF',
  Etc: '#8E8E96',
};

export const TONE_COLORS = {
  income: '#4ADE80',
  expense: '#FF6B6B',
  debt: '#FFB020',
} as const;
