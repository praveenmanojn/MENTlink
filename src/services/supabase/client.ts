import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxjsbevhmufkkagfxxyu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4anNiZXZobXVma2thZ2Z4eHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTA0NTEsImV4cCI6MjEwMTA4NjQ1MX0.Ogs-LmXS0-agzg23lCiiNcyW1LBZuOnbmPlp4_cI4mE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
