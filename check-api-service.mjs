async function checkApi() {
    const restUrl = process.env.SUPABASE_REST_URL || (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/` : undefined);
    const apikey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!restUrl || !apikey) {
        console.error('Environment variables SUPABASE_URL (or SUPABASE_REST_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
        process.exit(1);
    }

    try {
        const res = await fetch(restUrl, { headers: { apikey } });
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
