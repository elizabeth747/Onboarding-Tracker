# Supabase Real-Time Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or log in
3. Create a new project:
   - Give it a name (e.g., "Onboarding Tracker")
   - Set a strong database password
   - Choose your region
4. Wait for the project to initialize (2-3 minutes)

## Step 2: Get Your API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** - Copy this
   - **Anon Public Key** - Copy this
3. Save them somewhere secure

## Step 3: Set Up the Database

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase-setup.sql`
4. Click **Run**
5. Wait for all tables to be created

## Step 4: Update Configuration

1. Open `supabase-client.js`
2. Replace these lines with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL' // Replace with your URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY' // Replace with your key
   ```

## Step 5: Update index.html

1. Open `index.html`
2. Add this import at the top of your script section:
   ```html
   <script type="module">
     import * as db from './supabase-client.js';
     window.db = db; // Make it global for use in console
   </script>
   ```

## Step 6: Enable Real-Time Replication (Optional but Recommended)

1. Go to Supabase **Database** → **Replication**
2. Enable replication for these tables:
   - `clients`
   - `phases`
   - `tasks`
   - `tags`
   - `task_tags`
   - `client_tags`
   - `drive_links`

This enables real-time updates across all connected clients.

## Step 7: Test the Connection

1. Open your browser console (F12)
2. Try this command:
   ```javascript
   await db.fetchClients()
   ```
3. If it returns an empty array `[]`, you're connected!

## Usage Examples

### Create a new client:
```javascript
await db.createClient('Acme Corp', new Date().toISOString())
```

### Listen for real-time updates:
```javascript
const subscription = db.subscribeToClients((payload) => {
  console.log('Clients updated:', payload)
})
```

### Stop listening:
```javascript
await subscription.unsubscribe()
```

## Security Notes

- The current setup uses public access policies
- For production, implement proper authentication:
  - Use Supabase Auth (social login, email, etc.)
  - Create row-level security (RLS) policies based on user ID
  - Never expose real API keys in frontend code

## Real-Time How It Works

1. When user A edits a client, it updates in Supabase
2. Supabase broadcasts the change to all subscribed clients
3. User B's browser receives the update instantly
4. Your app re-renders with the new data
5. Everyone sees the same state in real-time

## Next Steps

1. Integrate the database functions into your existing JavaScript code
2. Replace localStorage calls with Supabase calls
3. Add subscriptions to listen for changes
4. Update the UI when changes are received

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Real-Time Docs](https://supabase.com/docs/guides/realtime)
