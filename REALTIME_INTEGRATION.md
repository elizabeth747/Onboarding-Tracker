# Real-Time Integration Guide

This guide shows how to integrate Supabase real-time updates into your existing `index.html`.

## Overview

Your app currently stores data in localStorage. We're replacing that with Supabase, which:
- ✅ Syncs data across all browsers/devices
- ✅ Sends real-time updates to everyone viewing the page
- ✅ Persists data on a remote server
- ✅ No refresh needed - changes appear instantly

## Key Changes

### 1. Import Supabase Client

Add this to the top of your script section in `index.html`:

```html
<script type="module">
  import * as db from './supabase-client.js';
  window.db = db;
  // Rest of your code here
</script>
```

### 2. Replace localStorage with Supabase Calls

**Old way (localStorage):**
```javascript
const data = JSON.parse(localStorage.getItem('tracker-data'))
```

**New way (Supabase):**
```javascript
const data = await db.fetchClients()
```

### 3. Load Data on Page Open

Instead of loading from localStorage on page load, fetch from Supabase:

```javascript
async function initializeApp() {
  // Load clients from Supabase
  const clients = await db.fetchClients()
  
  // Load tags
  const tags = await db.fetchAllTags()
  
  // Update UI
  renderClients(clients)
  renderTags(tags)
  
  // Set up real-time listeners
  setupRealTimeSync()
}

initializeApp()
```

### 4. Real-Time Sync Setup

Add this function to listen for changes from other users:

```javascript
function setupRealTimeSync() {
  // Listen for client changes
  db.subscribeToClients((payload) => {
    console.log('Clients updated:', payload)
    // Refresh the clients list
    refreshClientsView()
  })
  
  // Listen for tag changes
  db.subscribeToTags((payload) => {
    console.log('Tags updated:', payload)
    // Refresh tags
    refreshTagsView()
  })
}
```

### 5. Update Create/Edit Functions

**Creating a client:**

```javascript
async function addClient(name, date) {
  const newClient = await db.createClient(name, date)
  // The real-time subscription will automatically update the UI
  return newClient
}
```

**Updating a task:**

```javascript
async function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId)
  await db.updateTask(taskId, { completed: !task.completed })
  // The subscription will refresh the UI
}
```

**Updating a client name:**

```javascript
async function updateClientName(clientId, newName) {
  await db.updateClient(clientId, { name: newName })
  // Real-time update sent to all viewers
}
```

### 6. Handling Drag-and-Drop Reordering

When reordering tasks, update the display_order:

```javascript
async function reorderTasks(phaseId, tasksInOrder) {
  for (let i = 0; i < tasksInOrder.length; i++) {
    await db.updateTask(tasksInOrder[i].id, { display_order: i })
  }
}
```

## Data Migration

If you have existing data in localStorage:

```javascript
// Load old data
const oldData = JSON.parse(localStorage.getItem('tracker-data'))

// Migrate to Supabase
for (const client of oldData.clients) {
  const newClient = await db.createClient(client.name, client.startDate)
  
  // Migrate phases
  for (const phase of client.phases) {
    const newPhase = await db.createPhase(newClient.id, phase.name)
    
    // Migrate tasks
    for (const task of phase.tasks) {
      await db.createTask(newPhase.id, task.name)
    }
  }
}

// Clear old data
localStorage.removeItem('tracker-data')
```

## State Management

Keep your app's state minimal:

```javascript
let currentState = {
  clients: [],
  phases: {},      // { clientId: [phases] }
  tasks: {},       // { phaseId: [tasks] }
  tags: [],
  subscriptions: [] // Store subscription references
}
```

## Error Handling

Always wrap database calls in try-catch:

```javascript
async function safeCreateClient(name) {
  try {
    const client = await db.createClient(name)
    return client
  } catch (error) {
    console.error('Failed to create client:', error)
    showErrorMessage('Failed to create client')
    return null
  }
}
```

## Sync Status Indicator

Add visual feedback for real-time sync:

```javascript
let isSynced = true

function setSyncStatus(status) {
  isSynced = status
  const indicator = document.getElementById('sync-status')
  indicator.classList.remove('saving', 'saved', 'updated')
  
  if (status === 'saving') {
    indicator.classList.add('saving')
  } else if (status === 'saved') {
    indicator.classList.add('saved')
  } else if (status === 'updated') {
    indicator.classList.add('updated')
  }
}

// When user makes a change
async function updateSomething() {
  setSyncStatus('saving')
  try {
    await db.updateTask(taskId, updates)
    setSyncStatus('saved')
    setTimeout(() => setSyncStatus(null), 2000)
  } catch (error) {
    setSyncStatus('error')
  }
}
```

## Performance Tips

1. **Debounce text input**: Don't save on every keystroke
   ```javascript
   const debounce = (fn, delay) => {
     let timeout
     return (...args) => {
       clearTimeout(timeout)
       timeout = setTimeout(() => fn(...args), delay)
     }
   }
   
   input.addEventListener('input', debounce(async (e) => {
     await db.updateTask(taskId, { name: e.target.value })
   }, 500))
   ```

2. **Batch updates**: Update multiple items in one operation
   ```javascript
   // Instead of multiple updates, use a transaction
   await Promise.all([
     db.updateTask(task1.id, updates1),
     db.updateTask(task2.id, updates2)
   ])
   ```

3. **Lazy load**: Only fetch data when needed
   ```javascript
   async function expandPhase(phaseId) {
     if (!tasksCache[phaseId]) {
       tasksCache[phaseId] = await db.fetchTasksByPhase(phaseId)
     }
     return tasksCache[phaseId]
   }
   ```

## Troubleshooting

### Changes not appearing in real-time
- Check that replication is enabled in Supabase
- Check browser console for errors
- Verify the subscription is active: `db.subscribeToClients()`

### Database connection fails
- Verify your URL and API key are correct
- Check that Supabase project is running
- Check your network connection

### Performance issues
- Reduce the number of subscriptions
- Implement query pagination for large datasets
- Use debouncing for frequent updates

## Next: Deploy

Once everything works locally:

1. Deploy your app (GitHub Pages, Vercel, Netlify, etc.)
2. Update CORS settings in Supabase if needed
3. Share the URL with your team
4. Everyone can now edit in real-time!
