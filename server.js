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

// Helper function to make EnformionGO API calls
async function callEnformionAPI(searchBody, searchType) {
    console.log(`=== EnformionGO API Request (${searchType}) ===`);
    console.log('Body:', JSON.stringify(searchBody, null, 2));

    const response = await fetch(ENFORMION_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'galaxy-ap-name': ENFORMION_AP_NAME,
            'galaxy-ap-password': ENFORMION_AP_PASSWORD,
            'galaxy-search-type': searchType
        },
        body: JSON.stringify(searchBody)
    });

    console.log('Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${responseText}`);
    }

    return JSON.parse(responseText);
}

// STEP 1: Teaser Search - Returns list of people with basic info (no charge or lower charge)
// Used for initial search results list
app.post('/api/search', async (req, res) => {
    try {
        const { firstName, lastName, city, state } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ 
                error: 'First name and last name are required' 
            });
        }

        if (!ENFORMION_AP_NAME || !ENFORMION_AP_PASSWORD) {
            return res.status(500).json({ 
                error: 'API credentials not configured.' 
            });
        }

        const searchBody = {
            FirstName: firstName,
            LastName: lastName,
            Page: 1,
            ResultsPerPage: 25
        };

        if (city || state) {
            searchBody.Addresses = [{
                AddressLine2: [city, state].filter(Boolean).join(', ')
            }];
        }

        // Use "Teaser" search type for list view - shows basic info only
        const data = await callEnformionAPI(searchBody, 'Teaser');
        res.json(data);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your search',
            details: error.message 
        });
    }
});

// STEP 2: Full Person Details - Called when user clicks on a person
// This is the billable call that returns complete contact info
app.post('/api/person-details', async (req, res) => {
    try {
        const { tahoeId, firstName, lastName, city, state, dob } = req.body;

        if (!ENFORMION_AP_NAME || !ENFORMION_AP_PASSWORD) {
            return res.status(500).json({ 
                error: 'API credentials not configured.' 
            });
        }

        // Build search body to find this specific person
        const searchBody = {
            FirstName: firstName,
            LastName: lastName,
            Page: 1,
            ResultsPerPage: 1
        };

        // Add location if available
        if (city || state) {
            searchBody.Addresses = [{
                AddressLine2: [city, state].filter(Boolean).join(', ')
            }];
        }

        // Add DOB if available for more precise matching
        if (dob) {
            searchBody.Dob = dob;
        }

        // Use "Person" search type for full details - this is the billable call
        const data = await callEnformionAPI(searchBody, 'Person');
        
        // Return the first (best match) person
        const persons = data.persons || data.Persons || [];
        if (persons.length > 0) {
            res.json(persons[0]);
        } else {
            res.status(404).json({ error: 'Person not found' });
        }

    } catch (error) {
        console.error('Person details error:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching person details',
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
    console.log(`API credentials configured: ${!!(ENFORMION_AP_NAME && ENFORMION_AP_PASSWORD)}`);
});
