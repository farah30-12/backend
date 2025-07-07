declare module 'keycloak-js' {
  namespace Keycloak {
    interface KeycloakInstance {
      token?: string;
      refreshToken?: string;
      tokenParsed?: {
        exp?: number;
        realm_access?: {
          roles: string[];
        };
      };
      authenticated?: boolean;
      init(options: KeycloakInitOptions): Promise<boolean>;
      login(options?: KeycloakLoginOptions): Promise<void>;
      logout(options?: KeycloakLogoutOptions): Promise<void>;
      updateToken(minValidity: number): Promise<boolean>;
      clearToken(): void;
    }

    interface KeycloakInitOptions {
      onLoad?: 'login-required' | 'check-sso';
      checkLoginIframe?: boolean;
      checkLoginIframeInterval?: number;
      responseMode?: string;
      flow?: string;
      adapter?: string;
      redirectUri?: string;
      silentCheckSsoRedirectUri?: string;
    }

    interface KeycloakLoginOptions {
      redirectUri?: string;
      prompt?: string;
      maxAge?: number;
      loginHint?: string;
      scope?: string;
      idpHint?: string;
      locale?: string;
      cordovaOptions?: {
        pkceMethod?: string;
      };
    }

    interface KeycloakLogoutOptions {
      redirectUri?: string;
    }
  }

  export default function Keycloak(config: string | object): Keycloak.KeycloakInstance;
}
