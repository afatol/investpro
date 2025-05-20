// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fkjglcimmaomxdmhmled.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramdsY2ltbWFvbXhkbWhtbGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDIwODksImV4cCI6MjA2MTQxODA4OX0.u7pzHGRwpLzCNbpyoeK1fysTtlZ7lpeZw4AdDmWu9oM'

export const supabase = createClient(supabaseUrl, supabaseKey)
