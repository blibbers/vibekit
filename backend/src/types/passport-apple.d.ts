declare module '@nicokaiser/passport-apple' {
  export interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    key: string | Buffer;
    scope?: string[];
    callbackURL?: string;
  }

  export interface AppleProfile {
    id: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
    emailVerified?: boolean;
  }

  export class Strategy {
    constructor(
      options: AppleStrategyOptions,
      verify: (accessToken: string, refreshToken: string, profile: AppleProfile, done: any) => void
    );
    authenticate(req: any, options?: any): any;
  }
}