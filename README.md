# CSV to JSON Converter API

A Node.js REST API that reads a CSV file, converts it into nested JSON objects using dot notation, imports the data into PostgreSQL in batches, and computes age distribution analytics.

---

## ✨ Features

- **Custom CSV Parsing**
  - Handles quoted fields
  - Supports commas inside quoted values
  - Supports escaped quotes (`"Bob ""The Builder"""`)
  - No csv-to-json NPM libraries used

- **Dot Notation → Nested JSON**
  - Converts keys like `address.city` into:
    ```json
    { "address": { "city": "..." } }
    ```
  - Supports arbitrary depth: `meta.audit.createdBy` → `{ meta: { audit: { createdBy: ... }}}`

- **Batch Import to PostgreSQL**
  - Efficient insertion using batches of records (configurable, default 1000)
  - Designed to handle large CSV files (50,000+ records) without loading entire file into memory

- **Age Distribution Analytics**
  - Computes percentage distribution across age groups:
    - `< 20`
    - `20 – 40`
    - `40 – 60`
    - `> 60`
  - Prints a simple age-group distribution table to the console

- **Simple REST API**
  - `POST /api/import` to trigger CSV import
  - `GET /health` for health checks

---

## 🧰 Tech Stack

- **Runtime**: Node.js 14+
- **Framework**: Express
- **Database**: PostgreSQL 12+ (local, default port 5432)
- **Driver**: `pg` (no ORM)
- **Config Management**: `dotenv`

---

## ✅ Prerequisites

- Node.js v14 or higher  
- PostgreSQL (running locally on port 5432)  
- `npm` (comes with Node)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd kelp_csv_to_json_converter_api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` in the project root

```env
PORT=5000
CSV_FILE_PATH=./data/users.csv

PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=kelp_db
PG_USER=postgres
PG_PASSWORD=your_postgres_password
```

Replace `your_postgres_password` with your actual PostgreSQL password.

### 4. Create PostgreSQL database and table

#### On Windows (Command Prompt/PowerShell):

```bash
psql -U postgres -d postgres
```

Inside psql:

```sql
CREATE DATABASE kelp_db;
\c kelp_db
\q
```

Then run:

```bash
psql -U postgres -d kelp_db -f sql\createTable.sql
```

#### On macOS/Linux:

```bash
psql -U postgres -d postgres
```

Inside psql:

```sql
CREATE DATABASE kelp_db;
\c kelp_db
\q
```

Then run:

```bash
psql -U postgres -d kelp_db -f sql/createTable.sql
```

---

## 📁 Project Structure

```text
kelp_csv_to_json_converter_api/
├── src/
│   ├── utils/
│   │   ├── csvParser.js              # CSV line parser with quote handling
│   │   └── dotNotation.js            # Flat-to-nested object converter
│   ├── routes/
│   │   └── importRoute.js            # POST /api/import endpoint
│   ├── tests/
│   │   ├── test-csvParser.js         # CSV parser unit test
│   │   └── test-dotNotation.js       # Dot-notation conversion test
│   ├── db.js                         # PostgreSQL connection pool
│   └── importServices.js             # Core import logic (CSV → DB → age stats)
├── sql/
│   └── createTable.sql               # Database schema
├── data/
│   └── users.csv                     # Sample CSV file
├── .env                              # Environment variables (not in Git)
├── .gitignore                        # Git ignore rules
├── index.js                          # Express server entry point
├── package.json                      # Project dependencies
└── README.md                         # This file
```

---

## ▶️ Usage

### 1. Start the Server

**Windows (Command Prompt/PowerShell):**

```bash
node index.js
```

**macOS/Linux:**

```bash
node index.js
```

Expected output:

```text
Server is running on port 5000
```

### 2. Trigger CSV Import

```bash
curl -X POST http://localhost:5000/api/import
```

**Example Response (200 OK):**

```json
{
  "message": "Import completed successfully.",
  "stats": {
    "total": 10,
    "groups": [
      { "label": " < 20", "percent": 20 },
      { "label": "20 - 40", "percent": 40 },
      { "label": "40 - 60", "percent": 20 },
      { "label": " > 60", "percent": 20 }
    ]
  }
}
```

**Console Output (same time):**

```text
Age-Group % Distribution
------------------------
  < 20    : 20%
 20 - 40  : 40%
 40 - 60  : 20%
  > 60    : 20%
```

### 3. Health Check Endpoint

```bash
curl http://localhost:5000/health
```

Response:

```json
{ "status": "ok" }
```

---

## 🧪 Testing

### Test CSV Parser

```bash
node src\tests\test-csvParser.js
```

**Windows (Command Prompt/PowerShell):**

```bash
node src\tests\test-csvParser.js
```

**macOS/Linux:**

```bash
node src/tests/test-csvParser.js
```

Expected output:

```text
headers: [ 'id', 'name', 'meta.age', 'meta.city' ]
row 1 object: {
  "id": "1",
  "name": "Alice, A",
  "meta": { "age": "30", "city": "New York" }
}
row 2 object: {
  "id": "2",
  "name": "Bob \"The Builder\"",
  "meta": { "age": "25", "city": "Paris" }
}
```

### Test Dot-Notation Conversion

**Windows:**

```bash
node src\tests\test-dotNotation.js
```

**macOS/Linux:**

```bash
node src/tests/test-dotNotation.js
```

Expected output:

```json
{
  "a": {
    "b": {
      "c": 1,
      "d": 2
    }
  },
  "x": "y",
  "arr": {
    "0": "first",
    "1": "second"
  }
}
```

---

## 📄 CSV Format

The CSV file uses **dot notation** to represent nested fields:

```csv
name.firstName,name.lastName,age,address.line1,address.city,address.state,gender,occupation,hobbies.list.item1,hobbies.list.item2,meta.createdBy
Rohit,Prasad,25,A-563 Rakshak Society,Mumbai,Maharashtra,Male,Engineer,Chess,Reading,system
Ananya,Sharma,19,12 Park View,Pune,Maharashtra,Female,Student,Painting,Dancing,admin
Harshit,Verma,42,23 Sector C,Delhi,Delhi,Male,Project Manager,Photography,Cycling,user
```

**Field Mapping:**

| CSV Key | Database Column | Notes |
|---------|-----------------|-------|
| `name.firstName`, `name.lastName` | `name` | Concatenated with space: `"Rohit Prasad"` (required) |
| `age` | `age` | Must be numeric (required) |
| `address.*` | `address` (JSONB) | Any field starting with `address.` |
| Other fields | `additional_info` (JSONB) | All other dot-notation fields |

### Supported CSV Features

* **Quoted fields with commas:**
  ```csv
  "Alice, A"
  ```

* **Escaped quotes:**
  ```csv
  "Bob ""The Builder"""
  ```

* **Empty values:**
  ```csv
  name.firstName,name.lastName,age
  John,,30
  ```
  Empty `name.lastName` will be stored as empty string or omitted.

---

## 🗄 Database Schema

```sql
CREATE TABLE public.users (
  id serial4 PRIMARY KEY,
  name varchar NOT NULL,
  age int4 NOT NULL,
  address jsonb NULL,
  additional_info jsonb NULL
);
```

**Column Details:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `serial4` | NO | Auto-increment primary key |
| `name` | `varchar` | NO | Concatenated `firstName + " " + lastName` |
| `age` | `int4` | NO | User age; used for age distribution stats |
| `address` | `jsonb` | YES | JSON object with all `address.*` fields |
| `additional_info` | `jsonb` | YES | JSON object with extra fields |

---

## 🔧 API Reference

### POST /api/import

Imports CSV file to PostgreSQL and returns age distribution statistics.

**Request:**

```bash
curl -X POST http://localhost:5000/api/import
```

**Response (200 OK):**

```json
{
  "message": "Import completed successfully.",
  "stats": {
    "total": 10,
    "groups": [
      { "label": " < 20", "percent": 20 },
      { "label": "20 - 40", "percent": 40 },
      { "label": "40 - 60", "percent": 20 },
      { "label": " > 60", "percent": 20 }
    ]
  }
}
```

**Response (500 Error):**

```json
{
  "error": "Import failed.",
  "details": "ENOENT: no such file or directory"
}
```

---

### GET /health

Health check endpoint.

**Request:**

```bash
curl http://localhost:5000/health
```

**Response (200 OK):**

```json
{ "status": "ok" }
```

---

## 🛠 Troubleshooting

### 1. PostgreSQL Connection Failed

**Error:**

```text
password authentication failed for user "postgres"
```

**Solution:**

1. Verify `.env` has correct `PG_PASSWORD`:
   ```env
   PG_PASSWORD=your_actual_password
   ```

2. Test connection manually:
   ```bash
   psql -U postgres -d kelp_db
   ```

3. If you forgot the password, reset it:
   ```bash
   psql -U postgres -d postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   ```
   Then update `.env` with the new password.

---

### 2. psql Command Not Found

**Error (Windows):**

```text
'psql' is not recognized as an internal or external command
```

**Solution:**

1. Add PostgreSQL `bin` folder to Windows PATH:
   - Press Windows key → type "Edit the system environment variables" → Enter
   - Click "Environment Variables..." → Select "Path" (User variables) → Click "Edit..."
   - Click "New" → Paste: `C:\Program Files\PostgreSQL\<version>\bin` (e.g., version 16)
   - Click OK → OK → OK
   - Restart terminal and retry

2. Or use full path:
   ```bash
   "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kelp_db
   ```

---

### 3. CSV File Not Found

**Error:**

```text
Import failed. ... ENOENT: no such file or directory
```

**Solution:**

1. Verify `CSV_FILE_PATH` in `.env` is correct and file exists:
   ```bash
   dir data\users.csv
   ```

2. Use relative path from project root:
   ```env
   CSV_FILE_PATH=./data/users.csv
   ```

---

### 4. Records Skipped During Import

**Symptom:**

```text
Skipping invalid record at line 5
```

**Possible Causes:**

* Missing `name.firstName` or `name.lastName` columns
* Non-numeric or empty `age` value
* CSV header does not match expected dot-notation keys

**Solution:**

1. Verify CSV header includes:
   ```csv
   name.firstName,name.lastName,age,...
   ```

2. Ensure all `age` values are numeric:
   ```csv
   name.firstName,name.lastName,age
   John,Doe,30
   Jane,Smith,25
   ```

3. Check that data rows are not missing mandatory fields.

---

## 📊 Design Decisions

### CSV Processing

* **Streaming**: Uses `readline` interface; entire file is **not** loaded into memory
* **Batch Size**: Records inserted in batches of 1,000 (configurable)
* **Mandatory Fields**: `name.firstName`, `name.lastName`, `age` required per record

### Data Mapping

* `name.firstName` + `name.lastName` → concatenated `name` column
* `address.*` → JSONB `address` column
* All other fields → JSONB `additional_info` column

### Age Groups

* `< 20` → `age < 20`
* `20 - 40` → `20 ≤ age < 40`
* `40 - 60` → `40 ≤ age ≤ 60`
* `> 60` → `age > 60`

### Error Handling

* Invalid rows (missing fields, bad age) → logged and skipped
* DB errors → logged to console and returned in API response
* Missing CSV file → 500 error with clear message

---

## 🔮 Future Enhancements

- Add pagination & GET endpoints to fetch imported users
- Make batch size configurable via `.env`
- Add more comprehensive unit tests
- Implement structured logging (Winston/Bunyan)
- Support CSV uploads via multipart/form-data
- Add data validation and transformation rules

---
