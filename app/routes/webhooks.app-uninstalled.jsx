import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop } = await authenticate.webhook(request);

  // Only process if this is actually an APP_UNINSTALLED event
  if (topic !== "APP_UNINSTALLED") {
    console.log(`[WEBHOOK] Received ${topic} webhook for shop: ${shop} - ignoring`);
    return new Response();
  }

  console.log(`[WEBHOOK] App uninstalled for shop: ${shop}`);

  // Clean up shop data when app is uninstalled
  try {
    // Delete sessions for this shop
    await prisma.session.deleteMany({
      where: { shop },
    });

    // Delete usage records for this shop
    await prisma.tryonUsage.deleteMany({
      where: { shop },
    });

    console.log(`[WEBHOOK] Cleaned up data for shop: ${shop}`);
  } catch (error) {
    console.error(`[WEBHOOK ERROR] Failed to clean up data for shop ${shop}:`, error);
  }

  return new Response();
};