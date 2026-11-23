import test from 'node:test';
import assert from 'node:assert/strict';
import {
  USD_TO_IDR,
  formatAmountInput,
  formatMoney,
  initialsOf,
  isCurrentMonth,
  isToday,
  isYesterday,
  parseAmountInput,
} from '../lib/format.ts';

test('USD money groups thousands and keeps two decimals', () => {
  assert.equal(formatMoney(1234.5, 'USD'), '$1,234.50');
  assert.equal(formatMoney(-1234.5, 'USD'), '$1,234.50');
});

test('IDR money groups with dots and no decimals', () => {
  assert.equal(formatMoney(50000 / USD_TO_IDR, 'IDR'), 'Rp 50.000');
});

test('IDR amount input treats a dot as a thousands separator', () => {
  const display = formatAmountInput('50.000', 'IDR');
  assert.equal(display, '50.000');
  assert.equal(parseAmountInput(display, 'IDR'), 50000);
});

test('USD amount input keeps a decimal point', () => {
  const display = formatAmountInput('1234.56', 'USD');
  assert.equal(display, '1,234.56');
  assert.equal(parseAmountInput(display, 'USD'), 1234.56);
});

test('date helpers use local day and month boundaries', () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  assert.equal(isToday(now), true);
  assert.equal(isYesterday(yesterday), true);
  assert.equal(isToday(yesterday), false);
  assert.equal(isCurrentMonth(now), true);
  assert.equal(isCurrentMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)), false);
});

test('initials handle empty and multi word names', () => {
  assert.equal(initialsOf('   '), '?');
  assert.equal(initialsOf('Josh Hill'), 'JH');
  assert.equal(initialsOf('Madonna'), 'MA');
});
