# Expense Tracker (Offline Desktop App)

⚠️ Project Status: Work in Progress

This project is currently under active development.
Features may change, some components may be incomplete, and the architecture may evolve as the system matures.



A desktop expense tracker that automatically imports bank statements, extracts transactions, categorizes them using a **TF-IDF + Logistic Regression classifier**, and displays spending insights.

The application runs fully offline using **Electron, React, SQLite, and Python ML models**.

---

# AI-Assisted Development

This project was **AI-assisted ("vibe coded")** using modern AI development tools.

The development process involved describing system requirements and architecture to AI systems and iteratively refining the generated code.

Tools used during development:

* **ChatGPT** – architecture planning, backend pipeline design, ML pipeline design, debugging
* **Cursor IDE** – AI-assisted code generation and refactoring
* **Figma Make AI** – UI layout generation and rapid UI prototyping
* **GitHub** – version control and project hosting

The goal was to **rapidly prototype a functional MVP using AI-assisted software development workflows** while still validating and refining the generated code.

---

# Features

## Automatic Statement Import

* Connect Gmail once
* Fetch bank statement PDFs
* Convert PDFs to structured transactions

## Transaction Categorization

Transactions are categorized using a **hybrid system**:

1. **Rule engine**

   * swiggy → Food
   * uber → Travel

2. **Machine learning fallback**

   * TF-IDF vectorization
   * Logistic Regression classifier

## Dashboard Insights

* Total spending summary
* Category pie chart
* Spending trend graph
* Recent transactions list

## Transaction Management

Users can:

* Edit transaction category
* Search transactions
* Filter by category or date

## Offline Desktop Application

Runs locally with:

* Electron
* SQLite database
* Local ML inference

No external server is required.

---

# Tech Stack

## Frontend

* Electron
* React
* Tailwind CSS
* Recharts

## Backend

* Node.js
* SQLite

## Machine Learning

* Python
* scikit-learn
* TF-IDF Vectorizer
* Logistic Regression Classifier

---

# System Architecture

Gmail API
↓
PDF Statements
↓
PDF Parser
↓
CSV Conversion
↓
Transaction Extraction
↓
TF-IDF Vectorizer
↓
Logistic Regression Classifier
↓
SQLite Database
↓
Dashboard UI

---

# Project Structure

```
expense-tracker
│
├─ electron
│   ├─ main.js
│   ├─ preload.js
│   └─ sqlite.js
│
├─ src
│   ├─ components
│   │   ├─ Sidebar.jsx
│   │   ├─ SummaryCard.jsx
│   │   └─ EditTransactionModal.jsx
│   │
│   ├─ components/charts
│   │   ├─ CategoryBarChart.jsx
│   │   ├─ SpendingByCategoryPie.jsx
│   │   └─ SpendingTrendLine.jsx
│   │
│   ├─ pages
│   │   ├─ Dashboard.jsx
│   │   ├─ Transactions.jsx
│   │   ├─ Categories.jsx
│   │   └─ Settings.jsx
│   │
│   ├─ App.jsx
│   ├─ main.jsx
│   └─ index.css
│
├─ backend
│   ├─ gmail_fetch
│   ├─ pdf_parser
│   ├─ csv_parser
│   └─ ml_classifier
│
├─ dataset
│   └─ dataset.csv
│
├─ model
│   ├─ vectorizer.pkl
│   └─ classifier.pkl
│
├─ package.json
└─ README.md
```

---

# Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
```

Install dependencies:

```
npm install
```

Run the application:

```
npm run dev
npm start
```

---

# Machine Learning Model

The classifier is trained using:

* **TF-IDF vectorization** of transaction descriptions
* **Logistic Regression classification**

Training pipeline:

```
dataset.csv
↓
text preprocessing
↓
TF-IDF vectorization
↓
logistic regression training
↓
vectorizer.pkl
classifier.pkl
```

The trained model is loaded locally for inference when new transactions are imported.

---

# Future Improvements

* automatic dataset generation from imported transactions
* improved rule engine
* subscription detection
* budget alerts
* automated statement detection

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.
