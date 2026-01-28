
const fs = require('fs');
const path = require('path');
const https = require('https');

// Manually parse .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error('Could not read .env.local:', e.message);
}

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

console.log('Testing OpenRouter API...');
console.log('API Key present:', !!API_KEY);
console.log('Model:', MODEL);

if (!API_KEY) {
    console.error('Error: OPENROUTER_API_KEY not found in .env.local');
    process.exit(1);
}

const data = JSON.stringify({
    model: MODEL,
    messages: [
        { role: 'user', content: 'Hello, are you working?' }
    ],
});

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Success! Response:');
            console.log(JSON.parse(body));
        } else {
            console.error('API Error Response:');
            console.error(body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
