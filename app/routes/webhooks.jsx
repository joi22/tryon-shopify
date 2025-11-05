import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!admin && topic !== "SHOP_REDACT") {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    // The SHOP_REDACT webhook will be fired up to 48 hours after a shop uninstalls the app.
    // Because an app may be re-installed during this time, the webhook does not receive admin context.
    // Therefore, we don't need to check the admin context for the SHOP_REDACT topic.
    throw new Response();
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration

  switch (topic) {
    case "APP_INSTALLED":
      // Create metafield definition on app installation
      if (admin) {
        try {
          const response = await admin.graphql(
            `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
              metafieldDefinitionCreate(definition: $definition) {
                createdDefinition {
                  id
                  name
                  namespace
                  key
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
            {
              variables: {
                definition: {
                  name: "Disable Virtual Try-On",
                  namespace: "banana-tryon",
                  key: "disabled",
                  type: "boolean",
                  ownerType: "PRODUCT"
                }
              }
            }
          );

          const result = await response.json();

          if (result.data?.metafieldDefinitionCreate?.createdDefinition) {
            console.log("Metafield definition created successfully:", result.data.metafieldDefinitionCreate.createdDefinition);
          } else if (result.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
            // It's okay if it already exists
            console.log("Metafield definition might already exist:", result.data.metafieldDefinitionCreate.userErrors);
          }
        } catch (error) {
          console.error("Failed to create metafield definition on install:", error);
          // Don't throw - we don't want to fail the installation
        }
      }

      if (session) {
        await db.session.deleteMany({ where: { shop } });
        await db.session.create({
          data: {
            id: session.id,
            shop: session.shop,
            state: session.state,
            isOnline: session.isOnline,
            scope: session.scope,
            expires: session.expires,
            accessToken: session.accessToken,
            userId: session.onlineAccessInfo?.associated_user?.id,
          }
        });
      }
      break;

    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // Handle privacy webhooks
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};