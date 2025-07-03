import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "../src/context/AuthContext";
import MainLayout from "../src/components/Layout/MainLayout";
import { useRouter } from "next/router";
import { Global, css } from "@emotion/react";

// Import des styles CSS personnalisés
import "../src/styles/calendar-custom.css";
import "../src/styles/list-custom.css";
import "../src/styles/gantt-custom.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Liste des pages qui ne doivent pas utiliser le layout principal
  const noLayoutPages = ['/login', '/register', '/reset-password'];
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);

  return (
    <AuthProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Global
          styles={css`
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.1);
                opacity: 0.9;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        />
        <Notifications position="top-right" zIndex={2000} />
        {shouldUseLayout ? (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </MantineProvider>
    </AuthProvider>
  );
}
