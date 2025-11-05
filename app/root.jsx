import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <SpeedInsights />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let status = 500;
  let message = "An unexpected error occurred";
  let details = null;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || message;
    details = error.data;
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack;
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{status} Error</title>
        <Meta />
        <Links />
        <style>{`
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f6f6f7;
          }
          .error-container {
            max-width: 500px;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            font-size: 72px;
            margin: 0 0 16px 0;
            color: #202223;
          }
          h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #202223;
          }
          p {
            color: #6d7175;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          a {
            display: inline-block;
            padding: 12px 24px;
            background: #008060;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
          }
          a:hover {
            background: #006e52;
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <h1>{status}</h1>
          <h2>{message}</h2>
          <p>
            {status === 404
              ? "The page you're looking for doesn't exist."
              : "We're sorry, but something went wrong. Please try again later."}
          </p>
          <a href="/">Go to Homepage</a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
