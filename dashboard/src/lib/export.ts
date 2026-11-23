import { formatMoney, toAmount } from './format';
import type { DebtRow, TransactionRow } from './types';

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(transactions: TransactionRow[], debts: DebtRow[]) {
  const header = 'kind,id,type,amount,category,note,date,borrowerName,reason,status';
  const row = (values: string[]) => values.map(csvCell).join(',');
  const lines = [
    ...transactions.map((transaction) =>
      row([
        'transaction',
        transaction.id,
        transaction.type,
        toAmount(transaction.amount).toFixed(2),
        transaction.category,
        transaction.note ?? '',
        transaction.date,
        '',
        '',
        '',
      ]),
    ),
    ...debts.map((debt) =>
      row([
        'debt',
        debt.id,
        '',
        toAmount(debt.amount).toFixed(2),
        '',
        '',
        debt.loan_date,
        debt.borrower_name,
        debt.reason,
        debt.status,
      ]),
    ),
  ];
  download('my-duit-gw-data.csv', [header, ...lines].join('\n'), 'text/csv;charset=utf-8');
}

export function exportJson(transactions: TransactionRow[], debts: DebtRow[]) {
  download(
    'my-duit-gw-data.json',
    JSON.stringify({ transactions, debts }, null, 2),
    'application/json',
  );
}

export function receiptFileName(path: string | null): string {
  if (!path) return 'receipt';
  return path.split('/').pop() ?? 'receipt';
}

export function moneyLabel(amount: number, currency: 'USD' | 'IDR'): string {
  return formatMoney(amount, currency);
}
