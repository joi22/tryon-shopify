import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  console.log('[AUTH] app.jsx loader - authenticating request');
  console.log('[AUTH] Request URL:', request.url);
  console.log('[AUTH] Headers authorization:', request.headers.get('authorization') ? 'present' : 'missing');

  try {
    const result = await authenticate.admin(request);

    console.log('[AUTH] Authentication successful');
    console.log('[AUTH] Shop:', result.session?.shop);
    console.log('[AUTH] Session ID:', result.session?.id);
    console.log('[AUTH] Is online:', result.session?.isOnline);
    console.log('[AUTH] Access token present:', !!result.session?.accessToken);

    return {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop: result.session?.shop || null
    };
  } catch (error) {
      console.error('[AUTH ERROR] Authentication failed:', error);
      console.error('[AUTH ERROR] Error type:', error?.constructor?.name);
      console.error('[AUTH ERROR] Error message:', error?.message);

    // Re-throw to trigger proper error boundary handling
    throw error;
  }
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/settings">
          Settings
        </Link>
        <Link to="/app/support">
          Support
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
