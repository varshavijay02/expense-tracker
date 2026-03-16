# Prompt 1:

```

Create an offline desktop personal finance tracker.

Design reference:
Use this Figma design as the UI reference:
Figma Design

Dashboard
https://www.figma.com/make/Yg7rOsusA9I0mUf4p27crD/Personal-Finance-Dashboard?p=f&t=JjqiElbM9g2aWKar-0 

Transactions
https://www.figma.com/make/Yg7rOsusA9I0mUf4p27crD/Personal-Finance-Dashboard?p=f&t=JjqiElbM9g2aWKar-0&preview-route=%2Ftransactions 

Categories
https://www.figma.com/make/Yg7rOsusA9I0mUf4p27crD/Personal-Finance-Dashboard?p=f&t=JjqiElbM9g2aWKar-0&preview-route=%2Fcategories 

Settings
https://www.figma.com/make/Yg7rOsusA9I0mUf4p27crD/Personal-Finance-Dashboard?p=f&t=JjqiElbM9g2aWKar-0&preview-route=%2Fsettings 

Inspect the layout, colors, and spacing from the design.

Tech stack
Electron desktop app
React frontend
Tailwind CSS styling
Recharts for charts
SQLite for local storage

Navigation
Left sidebar with pages:
Dashboard
Transactions
Categories
Settings

Global UI
Dark mode must be default.

Color palette
Background #0F172A
Cards #1E293B
Sidebar #020617
Primary #3B82F6
Text #F1F5F9

Features

Dashboard
- summary cards: total spent, income, savings
- pie chart spending by category
- line chart spending trend
- recent transactions table

Pie chart behavior
- legend on right side
- legend shows category name + percentage
- hover highlights the slice
- tooltip shows category name + percentage
- no overlapping labels

Transactions page
- search transactions
- category filter
- date filter
- table with editable rows
- clicking edit opens modal
- modal allows updating category and amount

Categories page
- list of categories with totals
- bar chart showing spending per category

Settings page
- show connected email
- button to refresh statements
- button to export CSV

Email behavior
No login page.

At the top of the Dashboard:
If email is not stored
show email input and "Connect Gmail" button.

After connection
store the email locally and remember it on next launch.

App must work fully offline.

Database
Use SQLite to store:
transactions
categories
email setting

Generate:
- complete project folder structure
- Electron main process
- React components
- SQLite database setup
- Tailwind configuration
- chart components using Recharts
```

# Prompt 2:

```
Add Gmail email parsing functionality to the existing project.

Do not modify UI layout, architecture, or existing logic.
Only add backend functionality.

Create backend module:

backend/gmail_fetch

Functionality:

Use Gmail API with OAuth2.
Scope: https://www.googleapis.com/auth/gmail.readonly

Steps:

1. Authenticate user Gmail account.
2. Fetch recent emails using Gmail API.
3. Filter emails with subject containing:

"UPI txn"
"Account update for your HDFC Bank A/c"

Retrieve message body text.

Create module:

backend/email_parser

Parse email body text and extract transaction information.

Example patterns:

"INR 450 spent at SWIGGY"
"UPI txn of INR 230 to UBER"

Extract fields using regex:

amount
merchant
date

Example regex:

amount: INR (\d+)
merchant: at ([A-Z]+)
date: (\d{2}-\w+-\d{4})

Create module:

backend/transaction_extractor

Normalize extracted data into:

date
merchant
description
amount

Insert extracted transaction into SQLite transactions table.

Prevent duplicates using source_email_id.

Create module:

backend/csv_export

Generate CSV from SQLite transactions table.

CSV format:

date,merchant,amount,category

Output file:

database/transactions.csv

Add Settings button functionality:

"Fetch new transactions"

When clicked:

1. fetch Gmail emails
2. parse transaction emails
3. insert into SQLite
4. regenerate CSV

Keep all existing UI unchanged.
Only implement Gmail email ingestion pipeline.

```
