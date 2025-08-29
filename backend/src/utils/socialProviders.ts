export interface SocialProvider {
  name: string;
  enabled: boolean;
  requiredEnvVars: string[];
}

export interface SocialProvidersStatus {
  apple: boolean;
  google: boolean;
  facebook: boolean;
}

export const checkSocialProviders = (): SocialProvidersStatus => {
  const providers: SocialProvidersStatus = {
    apple: false,
    google: false,
    facebook: false,
  };

  // Check Apple Sign In
  const appleVars = [
    'APPLE_CLIENT_ID',
    'APPLE_TEAM_ID', 
    'APPLE_KEY_ID',
    'APPLE_PRIVATE_KEY_PATH'
  ];
  providers.apple = appleVars.every(envVar => 
    process.env[envVar] && process.env[envVar].trim() !== ''
  );

  // Check Google OAuth
  const googleVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  providers.google = googleVars.every(envVar => 
    process.env[envVar] && process.env[envVar].trim() !== ''
  );

  // Check Facebook OAuth (when implemented)
  const facebookVars = [
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET'
  ];
  providers.facebook = facebookVars.every(envVar => 
    process.env[envVar] && process.env[envVar].trim() !== ''
  );

  return providers;
};

export const getEnabledProviders = (): string[] => {
  const status = checkSocialProviders();
  return Object.entries(status)
    .filter(([_, enabled]) => enabled)
    .map(([provider, _]) => provider);
};