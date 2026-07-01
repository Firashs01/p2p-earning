 Refactor to JSON-Only Frontend
Context: I have a small personal project currently using a backend with @vercel/postgres and Drizzle ORM. I want to remove all backend/database code and switch to reading data from a local JSON file.
Task: Refactor the project so that:
Delete all backend code:
Remove all API routes (e.g., app/api/, pages/api/, or wherever your backend routes live)
Remove all database-related files (db/, drizzle/, schema files, migrations)
Remove all backend dependencies: @vercel/postgres, drizzle-orm, pg, and any other DB-related packages
Remove DATABASE_URL and any DB-related environment variables from .env.local and Vercel project settings
Clean up package.json scripts if any are backend-specific
Create a db/ folder at the project root with a JSON data file:
Create db/data.json containing the same data structure my app currently uses
Use realistic placeholder data that matches my current schema
Update the frontend to read from the JSON file:
Replace all database queries with imports/reads from db/data.json
Since this is a small personal project, it's fine to import the JSON directly at build time:
JavaScript
import data from '@/db/data.json';
Or if runtime reads are needed, use fetch('/db/data.json') with the file in the public/ folder (move a copy there if needed for client-side fetching)
Ensure the JSON file is accessible:
If using Next.js App Router: place db/data.json in the project root and import it in Server Components
If client components need the data, either pass it as props from a Server Component or place a copy in public/db/data.json and fetch it
Update any types/interfaces to match the JSON structure instead of Drizzle schema types
Clean up unused imports and code throughout the project
Output: A fully frontend-only project where all data lives in db/data.json, with zero backend dependencies.
