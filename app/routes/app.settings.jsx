import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Banner,
  InlineStack
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Get the current app installation and check global disable setting
  let globallyDisabled = false;
  try {
    const response = await admin.graphql(
      `#graphql
      query GetAppInstallation {
        currentAppInstallation {
          id
          metafield(namespace: "settings", key: "globally_disabled") {
            value
          }
        }
      }`
    );

    const data = await response.json();
    const metafieldValue = data.data?.currentAppInstallation?.metafield?.value;
    globallyDisabled = metafieldValue === "true";
  } catch (error) {
    console.error("Error fetching global disable setting:", error);
  }

  return json({ globallyDisabled });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    // Get current app installation ID
    const installationResponse = await admin.graphql(
      `#graphql
      query GetAppInstallation {
        currentAppInstallation {
          id
        }
      }`
    );

    const installationData = await installationResponse.json();
    const appInstallationId = installationData.data?.currentAppInstallation?.id;

    if (!appInstallationId) {
      return json({ success: false, error: "Could not find app installation" });
    }

    // Set the metafield based on action
    const newValue = action === "disable" ? "true" : "false";

    const response = await admin.graphql(
      `#graphql
      mutation SetGlobalDisable($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              ownerId: appInstallationId,
              namespace: "settings",
              key: "globally_disabled",
              type: "boolean",
              value: newValue
            }
          ]
        }
      }
    );

    const responseJson = await response.json();

    if (responseJson?.data?.metafieldsSet?.userErrors?.length > 0) {
      const errors = responseJson.data.metafieldsSet.userErrors;
      return json({ success: false, errors });
    }

    return json({ success: true, globallyDisabled: newValue === "true" });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
};

export default function Settings() {
  const { globallyDisabled } = useLoaderData();
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state === "submitting";
  const actionData = fetcher.data;

  return (
    <Page
      title="Settings"
      backAction={{ content: "Home", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {actionData?.success && (
              <Banner tone="success" onDismiss={() => {}}>
                Setting updated successfully
              </Banner>
            )}

            {actionData?.error && (
              <Banner tone="critical">
                Error: {actionData.error}
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Global App Control
                  </Text>
                  <Text tone="subdued">
                    Disable the Banana Try-On button for all products across your store.
                  </Text>
                </BlockStack>

                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text variant="headingS" as="h3">
                        Current Status
                      </Text>
                      <Text>
                        The app is currently <Text as="span" fontWeight="bold" tone={globallyDisabled ? "critical" : "success"}>
                          {globallyDisabled ? "disabled" : "enabled"}
                        </Text> for all products.
                      </Text>
                    </BlockStack>

                    <fetcher.Form method="post">
                      <input
                        type="hidden"
                        name="action"
                        value={globallyDisabled ? "enable" : "disable"}
                      />
                      <Button
                        variant="primary"
                        tone={globallyDisabled ? "success" : "critical"}
                        submit
                        loading={isSubmitting}
                      >
                        {globallyDisabled ? "Enable for All Products" : "Disable for All Products"}
                      </Button>
                    </fetcher.Form>
                  </InlineStack>
                </BlockStack>

                <Banner tone="info">
                  <BlockStack gap="200">
                    <Text fontWeight="semibold">How this works:</Text>
                    <Text>
                      • When disabled globally, the try-on button will not appear on any product pages
                    </Text>
                    <Text>
                      • This setting works independently from per-product settings
                    </Text>
                    <Text>
                      • Individual product disable settings will still be respected when the app is globally enabled
                    </Text>
                  </BlockStack>
                </Banner>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
