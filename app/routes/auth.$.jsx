import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  console.log("[AUTH] auth.$.jsx - handling auth callback");
  console.log("[AUTH] Request URL:", request.url);

  try {
    const result = await authenticate.admin(request);

    // authenticate.admin can return a Response (redirect) that should be returned directly
    if (result instanceof Response) {
      return result;
    }

    console.log("[AUTH] Token exchange successful");
    console.log("[AUTH] Session created for shop:", result.session?.shop);

    // Redirect to the app after successful authentication
    const url = new URL(request.url);
    const redirectUrl = url.searchParams.get("shopify-reload") || "/app";
    throw redirect(redirectUrl);
  } catch (error) {
    // If it's a redirect or Response, return it
    if (error instanceof Response) {
      return error;
    }

    console.error("[AUTH] Authentication error:", error);
    throw error;
  }
};
