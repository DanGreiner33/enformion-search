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

        // Build the request body
        const searchBody = {
            FirstName: firstName,
            LastName: lastName,
            Page: 1,
            ResultsPerPage: 25,
            Includes: [
                "Addresses",
                "PhoneNumbers", 
                "EmailAddresses",
                "Relatives",
                "Associates",
                "Age"
            ]
        };

        // Add city/state if provided
        if (city || state) {
            searchBody.Addresses = [{
                AddressLine2: [city, state].filter(Boolean).join(', ')
            }];
        }

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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('EnformionGO API Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `API request failed: ${response.statusText}`,
                details: errorText
            });
        }

        const data = await response.json();
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
        configured: !!(ENFORMION_AP_NAME && ENFORMION_AP_PASSWORD)
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API credentials configured: ${!!(ENFORMION_AP_NAME && ENFORMION_AP_PASSWORD)}`);
});
