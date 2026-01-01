async function checkApi() {
    const url = 'https://ccyrwgfnvrilqmxlllrd.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjeXJ3Z2ZudnJpbHFteGxsbHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5ODAyOCwiZXhwIjoyMDgyNzc0MDI4fQ.-NuPxuLNijOhpHnacHE1D0TGkzAGtI8dzE0xw9R4Ylk';

    try {
        const res = await fetch(url, { headers: { apikey } });
        const data = await res.json();
        console.log('Available tables (service role):');
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
