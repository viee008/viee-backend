# viee-backend

RSS feeds → Article extraction → OpenAI summary → Supabase

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env
```bash
cp .env.example .env
```
Fill in: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

### 3. Set up database
Go to Supabase → SQL Editor → paste schema.sql → Run

### 4. Run the pipeline
```bash
npm run pipeline
```

### 5. Start the server
```bash
npm run dev
```

API live at: http://localhost:3001

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/articles | All articles |
| GET | /api/articles?category=tech | Filter by category |
| GET | /api/articles?limit=10&offset=0 | Pagination |
| POST | /api/pipeline/run | Trigger pipeline manually |

## Pipeline schedule
Runs automatically at 6am, 12pm, 6pm Paris time.
