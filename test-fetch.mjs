import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccyrwgfnvrilqmxlllrd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjeXJ3Z2ZudnJpbHFteGxsbHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5ODAyOCwiZXhwIjoyMDgyNzc0MDI4fQ.-NuPxuLNijOhpHnacHE1D0TGkzAGtI8dzE0xw9R4Ylk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetch() {
    console.log('Testing profiles fetch...')
    const { data, error } = await supabase
        .from('profiles')
        .select(`*`)
        .limit(1)

    if (error) {
        console.error('SQL Error (profiles):', JSON.stringify(error, null, 2))
    } else {
        console.log('Success, profiles found')
    }
}

testFetch()
