const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// EnformionGO API configuration
// CORRECT endpoint: https://devapi.enformion.com/PersonSearch
const ENFORMION_API_URL = 'https://devapi.enformion.com/PersonSearch';
const ENFORMION_AP_NAME = process.env.ENFORMION_AP_NAME;
const ENFORMION_AP_PASSWORD = process.env.ENFORMION_AP_PASSWORD;

// Person Search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { firstName, lastName, city, state } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ 
                error: 'First name and last name are required' 
            });
        }

        // Check if API credentials are configured
        if (!ENFORMION_AP_NAME || !ENFORMION_AP_PASSWORD) {
            return res.status(500).json({ 
                error: 'API credentials not configured. Please set ENFORMION_AP_NAME and ENFORMION_AP_PASSWORD environment variables.' 
            });
        }

        // Build the request body according to EnformionGO docs
        const searchBody = {
            FirstName: firstName,
            LastName: lastName,
            Page: 1,
            ResultsPerPage: 25
        };

        // Add city/state if provided - format as AddressLine2: "City, ST"
        if (city || state) {
            searchBody.Addresses = [{
                AddressLine2: [city, state].filter(Boolean).join(', ')
            }];
        }

        console.log('=== EnformionGO API Request ===');
        console.log('URL:', ENFORMION_API_URL);
        console.log('Headers:', {
            'galaxy-ap-name': ENFORMION_AP_NAME,
            'galaxy-ap-password': '***hidden***',
            'galaxy-search-type': 'Person'
        });
        console.log('Body:', JSON.stringify(searchBody, null, 2));

        const response = await fetch(ENFORMION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'galaxy-ap-name': ENFORMION_AP_NAME,
                'galaxy-ap-password': ENFORMION_AP_PASSWORD,
                'galaxy-search-type': 'Person'
            },
            body: JSON.stringify(searchBody)
        });

        console.log('=== EnformionGO API Response ===');
        console.log('Status:', response.status, response.statusText);

        const responseText = await response.text();
        console.log('Response body:', responseText.substring(0, 500));

        if (!response.ok) {
            console.error('EnformionGO API Error:', response.status, responseText);
            return res.status(response.status).json({ 
                error: `API request failed: ${response.statusText}`,
                details: responseText
            });
        }

        // Parse the response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            return res.status(500).json({
                error: 'Failed to parse API response',
                details: responseText.substring(0, 200)
            });
        }

        res.json(data);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your search',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        configured: !!(ENFORMION_AP_NAME && ENFORMION_AP_PASSWORD),
        apiUrl: ENFORMION_API_URL
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: ${ENFORMION_API_URL}`);
    console.log(`API credentials configured: ${!!(ENFORMION_AP_NAME && ENFORMION_AP_PASSWORD)}`);
});
