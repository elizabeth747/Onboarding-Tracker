// Supabase Real-Time Client Configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const SUPABASE_URL = 'YOUR_SUPABASE_URL' // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===== CLIENTS =====
export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error fetching clients:', error)
  return data || []
}

export async function createClient(name, startDate) {
  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name,
        start_date: startDate || new Date().toISOString()
      }
    ])
    .select()
  
  if (error) console.error('Error creating client:', error)
  return data?.[0]
}

export async function updateClient(clientId, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
  
  if (error) console.error('Error updating client:', error)
  return data?.[0]
}

export async function archiveClient(clientId) {
  return updateClient(clientId, {
    archived: true,
    archived_date: new Date().toISOString()
  })
}

// ===== PHASES =====
export async function fetchPhasesByClient(clientId) {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('client_id', clientId)
    .order('display_order', { ascending: true })
  
  if (error) console.error('Error fetching phases:', error)
  return data || []
}

export async function createPhase(clientId, name) {
  const { data, error } = await supabase
    .from('phases')
    .insert([{ client_id: clientId, name }])
    .select()
  
  if (error) console.error('Error creating phase:', error)
  return data?.[0]
}

export async function updatePhase(phaseId, updates) {
  const { data, error } = await supabase
    .from('phases')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', phaseId)
    .select()
  
  if (error) console.error('Error updating phase:', error)
  return data?.[0]
}

// ===== TASKS =====
export async function fetchTasksByPhase(phaseId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('phase_id', phaseId)
    .order('display_order', { ascending: true })
  
  if (error) console.error('Error fetching tasks:', error)
  return data || []
}

export async function createTask(phaseId, name) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ phase_id: phaseId, name }])
    .select()
  
  if (error) console.error('Error creating task:', error)
  return data?.[0]
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
  
  if (error) console.error('Error updating task:', error)
  return data?.[0]
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) console.error('Error deleting task:', error)
}

// ===== TAGS =====
export async function fetchAllTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) console.error('Error fetching tags:', error)
  return data || []
}

export async function createTag(name, color) {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, color }])
    .select()
  
  if (error) console.error('Error creating tag:', error)
  return data?.[0]
}

// ===== TASK TAGS =====
export async function addTagToTask(taskId, tagId) {
  const { error } = await supabase
    .from('task_tags')
    .insert([{ task_id: taskId, tag_id: tagId }])
  
  if (error) console.error('Error adding tag to task:', error)
}

export async function removeTagFromTask(taskId, tagId) {
  const { error } = await supabase
    .from('task_tags')
    .delete()
    .eq('task_id', taskId)
    .eq('tag_id', tagId)
  
  if (error) console.error('Error removing tag from task:', error)
}

// ===== CLIENT TAGS =====
export async function addTagToClient(clientId, tagId) {
  const { error } = await supabase
    .from('client_tags')
    .insert([{ client_id: clientId, tag_id: tagId }])
  
  if (error) console.error('Error adding tag to client:', error)
}

export async function removeTagFromClient(clientId, tagId) {
  const { error } = await supabase
    .from('client_tags')
    .delete()
    .eq('client_id', clientId)
    .eq('tag_id', tagId)
  
  if (error) console.error('Error removing tag from client:', error)
}

// ===== DRIVE LINKS =====
export async function updateDriveLink(clientId, url) {
  const { data: existing } = await supabase
    .from('drive_links')
    .select('id')
    .eq('client_id', clientId)
    .single()
  
  if (existing) {
    const { data, error } = await supabase
      .from('drive_links')
      .update({ url, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .select()
    
    if (error) console.error('Error updating drive link:', error)
    return data?.[0]
  } else {
    const { data, error } = await supabase
      .from('drive_links')
      .insert([{ client_id: clientId, url }])
      .select()
    
    if (error) console.error('Error creating drive link:', error)
    return data?.[0]
  }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
export function subscribeToClients(callback) {
  return supabase
    .channel('clients-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'clients'
    }, (payload) => {
      callback(payload)
    })
    .subscribe()
}

export function subscribeToPhases(clientId, callback) {
  return supabase
    .channel(`phases-${clientId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'phases',
      filter: `client_id=eq.${clientId}`
    }, (payload) => {
      callback(payload)
    })
    .subscribe()
}

export function subscribeToTasks(phaseId, callback) {
  return supabase
    .channel(`tasks-${phaseId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `phase_id=eq.${phaseId}`
    }, (payload) => {
      callback(payload)
    })
    .subscribe()
}

export function subscribeToTags(callback) {
  return supabase
    .channel('tags-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tags'
    }, (payload) => {
      callback(payload)
    })
    .subscribe()
}
