To complete the setup, you'll need to:

1. Apple Developer Account Setup:
   - Register an App ID with "Sign in with Apple" capability
   - Register a Services ID (this becomes your APPLE_CLIENT_ID)
   - Register a Key and download the .p8 file
   - Configure the domain and return URLs
2. Environment Configuration:
   - Copy the Apple credentials to your .env file
   - Place the .p8 private key file in your certs directory
   - Update the callback URL to match your domain
3. Frontend Environment:
   - The frontend already has VITE_API_URL configured correctly
