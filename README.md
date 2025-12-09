# Contact Finder - Internal People Search Tool

A sleek, internal people search application powered by the EnformionGO API. Search for contact information including phone numbers, email addresses, and physical addresses.

![Contact Finder Screenshot](screenshot.png)

## Features

- 🔍 Search by name and location (city/state)
- 📞 View phone numbers
- 📧 View email addresses
- 📍 View address history
- 🎨 Modern, dark-themed UI
- 🚀 Ready for Railway deployment

## Prerequisites

1. An EnformionGO account with API access
2. API credentials (Access Profile Name and Password)
3. Node.js 18+ (for local development)

## Getting Your EnformionGO API Credentials

1. Create an account at [https://accounts.enformion.com/Join/](https://accounts.enformion.com/Join/)
2. Log in to your dashboard at [https://api.enformion.com](https://api.enformion.com)
3. Navigate to the **Keys** tab
4. Copy your **Access Profile Name** and **Password**

## Deploy to Railway

### Quick Deploy

1. Push this code to a GitHub repository
2. Go to [Railway.app](https://railway.app) and create a new project
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables in Railway:
   - `ENFORMION_AP_NAME` - Your EnformionGO access profile name
   - `ENFORMION_AP_PASSWORD` - Your EnformionGO access profile password
6. Railway will automatically deploy and provide you with a URL

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ENFORMION_AP_NAME` | Your EnformionGO API access profile name | Yes |
| `ENFORMION_AP_PASSWORD` | Your EnformionGO API access profile password | Yes |
| `PORT` | Server port (Railway sets this automatically) | No |

## Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd enformion-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your EnformionGO credentials:
   ```
   ENFORMION_AP_NAME=your_access_profile_name
   ENFORMION_AP_PASSWORD=your_access_profile_password
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### POST /api/search
Search for a person by name and location.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "city": "Los Angeles",
  "state": "CA"
}
```

**Response:** Returns matching persons with their contact information.

### GET /api/health
Health check endpoint. Returns API configuration status.

## Security Notes

- This is designed for **internal use only**
- API credentials are stored server-side and never exposed to the client
- Consider adding authentication if deploying to a public URL
- Review EnformionGO's terms of service for permitted use cases

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **API:** EnformionGO Person Search API
- **Hosting:** Railway (recommended)

## License

Internal use only. See EnformionGO's terms of service for data usage restrictions.
