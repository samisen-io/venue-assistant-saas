import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Testing profiles fetch...')
const { error } = await supabase
    .from('profiles')
    .select(`*`)
    .limit(1)

if (error) {
    console.error('SQL Error (profiles):', JSON.stringify(error, null, 2))
} else {
    console.log('Success, profiles found')
}
