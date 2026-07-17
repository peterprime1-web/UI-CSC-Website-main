const SUPABASE_URL = "https://jitrrylswqeiltkngnag.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdHJyeWxzd3FlaWx0a25nbmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDkyOTQsImV4cCI6MjA5OTM4NTI5NH0._5qIfkMkZdBvoSWcU-M7didFyz1s5gyxhBTYhljZ-QM";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log(client);

window.supabaseClient = client;