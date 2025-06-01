// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://heptpfmpovklxqaqwzjd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcHRwZm1wb3ZrbHhxYXF3empkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTY5MDUsImV4cCI6MjA2NDM3MjkwNX0.U3JYsHNUqSXChvWdEJDaLr6QD9JI5rTWoNqQvVa4TvI'

export const supabase = createClient(supabaseUrl, supabaseKey)
