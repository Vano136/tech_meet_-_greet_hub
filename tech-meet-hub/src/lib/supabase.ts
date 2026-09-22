import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cmpqflkbkavrupfvngsa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcHFmbGtia2F2cnVwZnZuZ3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDA1MzcsImV4cCI6MjEwNTIxNjUzN30.G6ey3Sk3ZjxPDmCQUZjN8828NQFs_75KmBZiIgHbwG8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
