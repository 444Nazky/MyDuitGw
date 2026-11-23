-- Run once in Supabase SQL Editor AFTER signing up, replacing the email below.
-- This fills the signed-in account with sample data like the figcraft screenshots.

with target as (
  select id from public.profiles where email = 'you@mail.com'
)
insert into public.transactions (user_id, type, amount, category, note, date)
select id, 'income', 4200, 'Salary', 'Monthly Salary', now() - interval '2 hours' from target
union all select id, 'expense', 12.4, 'Food', 'Coffee & Pastry', now() - interval '5 hours' from target
union all select id, 'expense', 6.8, 'Etc', 'Grab to Office', now() - interval '7 hours' from target
union all select id, 'expense', 86.2, 'Shopping', 'Grocery Run', now() - interval '1 day' from target
union all select id, 'income', 1800, 'Etc', 'Design Project', now() - interval '1 day' from target
union all select id, 'expense', 15.99, 'Bills', 'Netflix Subscription', now() - interval '4 days' from target
union all select id, 'expense', 25, 'Kuota', 'Mobile Data 20GB', now() - interval '6 days' from target
union all select id, 'expense', 59.99, 'Game', 'Steam Wallet Top Up', now() - interval '8 days' from target
union all select id, 'expense', 1200, 'Bills', 'Apartment Rent', now() - interval '11 days' from target
union all select id, 'expense', 340, 'Shopping', 'Zara Jacket', now() - interval '13 days' from target
union all select id, 'income', 4200, 'Salary', 'Monthly Salary', now() - interval '35 days' from target
union all select id, 'expense', 1200, 'Bills', 'Apartment Rent', now() - interval '38 days' from target;

with target as (
  select id from public.profiles where email = 'you@mail.com'
)
insert into public.debts (user_id, borrower_name, borrower_email, amount, loan_date, reason, status)
select id, 'Sarah Lim', 'sarah.j@mail.com', 500, now() - interval '19 days', 'Emergency car repair', 'unpaid' from target
union all select id, 'Daniel Tan', 'daniel.t@mail.com', 320, now() - interval '24 days', 'Concert tickets', 'unpaid' from target
union all select id, 'Aisha Rahman', 'aisha.r@mail.com', 750, now() - interval '33 days', 'Bakery pop-up capital', 'unpaid' from target
union all select id, 'Marcus Lee', 'marcus.l@mail.com', 680, now() - interval '52 days', 'Work laptop down payment', 'paid' from target;
