# Social Login Setup Guide

This guide explains how to set up social login providers (Apple, Google, Facebook) for your application.

## Overview

The application supports the following social login providers:
- **Apple Sign In** - For iOS/macOS users
- **Google OAuth 2.0** - Universal provider
- **Facebook Login** - Universal provider (ready for implementation)

Social logins are automatically enabled/disabled based on the presence of required environment variables. If a provider's credentials are not configured, it won't appear on the login/signup forms.

## Apple Sign In Setup

### Prerequisites
- Apple Developer Account ($99/year)
- Access to Apple Developer Portal

### Step 1: Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to create a new identifier
3. Select "App IDs" and click "Continue"
4. Choose "App" and click "Continue"
5. Fill in:
   - Description: Your app name
   - Bundle ID: `com.yourcompany.yourapp` (explicit)
6. Under "Capabilities", check "Sign In with Apple"
7. Click "Continue" and "Register"

### Step 2: Create Services ID
1. Go back to Identifiers and click "+"
2. Select "Services IDs" and click "Continue"
3. Fill in:
   - Description: Your service name
   - Identifier: `com.yourcompany.yourapp.service` (this becomes your `APPLE_CLIENT_ID`)
4. Click "Continue" and "Register"
5. Click on your new Services ID to configure it
6. Check "Sign In with Apple" and click "Configure"
7. Add your domains and return URLs:
   - Primary App Domain: `yourdomain.com`
   - Return URLs: `https://yourdomain.com/auth/apple/callback`
   - For development: `http://localhost:5000/api/auth/apple/callback`

### Step 3: Create Private Key
1. Go to "Keys" section in Apple Developer Portal
2. Click "+" to create a new key
3. Fill in:
   - Key Name: "Apple Sign In Key"
   - Check "Sign In with Apple"
4. Click "Configure" and select your primary App ID
5. Click "Save", "Continue", and "Register"
6. **Download the .p8 file immediately** (you can't download it again)
7. Note the Key ID shown on the download page

### Step 4: Configure Environment Variables
Add these to your `.env` file:

```bash
# Apple Sign In Configuration
APPLE_CLIENT_ID=com.yourcompany.yourapp.service  # Your Services ID
APPLE_TEAM_ID=ABCD123456  # Found in Apple Developer Account membership
APPLE_KEY_ID=XYZ9876543  # From Step 3
APPLE_PRIVATE_KEY_PATH=./certs/AuthKey_XYZ9876543.p8  # Path to your .p8 file
APPLE_CALLBACK_URL=https://yourdomain.com/auth/apple/callback
```

### Step 5: Store Private Key
1. Create a `certs` directory in your project root: `mkdir certs`
2. Move your downloaded `.p8` file to `certs/AuthKey_[YOUR_KEY_ID].p8`
3. Update `APPLE_PRIVATE_KEY_PATH` to match the file location

## Google OAuth 2.0 Setup

### Prerequisites
- Google account
- Access to Google Cloud Console

### Step 1: Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name and click "Create"

### Step 2: Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for most applications
   - Fill in app name, user support email, and developer contact
   - Add scopes: `../auth/userinfo.profile` and `../auth/userinfo.email`
   - Add test users if in development
4. For the OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: Your app name
   - Authorized redirect URIs:
     - `https://yourdomain.com/auth/google/callback`
     - For development: `http://localhost:5000/api/auth/google/callback`
5. Click "Create"
6. Copy the Client ID and Client Secret

### Step 4: Configure Environment Variables
Add these to your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

## Facebook Login Setup

### Prerequisites
- Facebook account
- Access to Facebook Developers

### Step 1: Create App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" and click "Next"
4. Fill in app name and contact email
5. Click "Create App"

### Step 2: Add Facebook Login
1. In your app dashboard, click "Add a Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your site URL: `https://yourdomain.com`
5. Go to "Facebook Login" → "Settings"
6. Add Valid OAuth Redirect URIs:
   - `https://yourdomain.com/auth/facebook/callback`
   - For development: `http://localhost:5000/api/auth/facebook/callback`

### Step 3: Get App Credentials
1. Go to "Settings" → "Basic"
2. Copy your App ID and App Secret

### Step 4: Configure Environment Variables
Add these to your `.env` file:

```bash
# Facebook OAuth Configuration  
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://yourdomain.com/auth/facebook/callback
```

## Development vs Production

### Development
- Use `http://localhost:5000` URLs in your callback configurations
- Test with development credentials
- Apple requires HTTPS for production but allows HTTP for localhost

### Production
- Use your actual domain with HTTPS
- Update all callback URLs in provider dashboards
- Ensure SSL certificates are properly configured
- Update environment variables for production

## Security Best Practices

1. **Never commit credentials to version control**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate keys regularly**
   - Change credentials periodically
   - Monitor for any unauthorized access

3. **Use HTTPS in production**
   - Required by most providers
   - Protects user data in transit

4. **Validate redirect URLs**
   - Only allow your authorized domains
   - Check provider configurations regularly

## Troubleshooting

### Common Issues

**Apple Sign In**
- "invalid_client": Check your Services ID and Team ID
- "invalid_key": Ensure .p8 file path is correct and accessible
- "invalid_scope": Apple only supports 'name' and 'email' scopes

**Google OAuth**
- "redirect_uri_mismatch": Check callback URL matches exactly
- "access_denied": User cancelled or app not approved
- "invalid_client": Check Client ID and Secret

**General**
- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure callback URLs match between provider config and environment variables

### Testing

Test each provider by:
1. Setting up the environment variables
2. Restarting your server
3. Attempting login through the frontend
4. Checking server logs for any errors

## Provider Status

You can check which providers are enabled by making a GET request to `/api/auth/providers`:

```bash
curl http://localhost:5000/api/auth/providers
```

Response:
```json
{
  "providers": {
    "apple": true,
    "google": true,
    "facebook": false
  }
}
```

Only enabled providers will show login buttons on the frontend.