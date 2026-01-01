async function checkApi() {
    const url = 'https://ccyrwgfnvrilqmxlllrd.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjeXJ3Z2ZudnJpbHFteGxsbHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTgwMjgsImV4cCI6MjA4Mjc3NDAyOH0.G8cPsGFnhomgCPAxQm-YAl_i7KEQZTfgPy3XKBBeRA0';

    try {
        const res = await fetch(url, { headers: { apikey } });
        const data = await res.json();
        console.log('Available tables:');
        if (data.definitions) {
            console.log(Object.keys(data.definitions).join(', '));
        } else {
            console.log('No definitions found in OpenAPI spec.');
        }
    } catch (e) {
        console.error(e);
    }
}

checkApi();
