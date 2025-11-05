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
  List
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Check if metafield definition exists
  let hasMetafieldDefinition = false;
  try {
    const response = await admin.graphql(
      `#graphql
      query CheckMetafieldDefinition {
        metafieldDefinitions(first: 100, ownerType: PRODUCT) {
          edges {
            node {
              id
              namespace
              key
              type {
                name
              }
            }
          }
        }
      }`
    );

    const data = await response.json();
    hasMetafieldDefinition = data.data?.metafieldDefinitions?.edges?.some(
      edge => edge.node.namespace === "custom" && edge.node.key === "virtual_tryon_enabled"
    );
  } catch (error) {
    console.error("Error checking metafield:", error);
  }

  // Get shop domain for theme editor link
  let shopDomain = "";
  try {
    const shopResponse = await admin.graphql(
      `#graphql
      query {
        shop {
          myshopifyDomain
        }
      }`
    );
    const shopData = await shopResponse.json();
    shopDomain = shopData.data?.shop?.myshopifyDomain || "";
  } catch (error) {
    console.error("Error fetching shop domain:", error);
  }

  return json({
    hasMetafieldDefinition,
    shopDomain
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(
      `#graphql
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      {
        variables: {
          definition: {
            name: "Banana Try-On Enabled",
            namespace: "custom",
            key: "virtual_tryon_enabled",
            description: "Whether virtual try-on is enabled for this product",
            type: "boolean",
            ownerType: "PRODUCT",
            validations: [
              {
                name: "default_value",
                value: "true"
              }
            ]
          }
        }
      }
    );

    const responseJson = await response.json();

    if (responseJson?.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
      const errors = responseJson.data.metafieldDefinitionCreate.userErrors;
      if (errors.some(err => err.code === 'TAKEN')) {
        return json({ success: true });
      }
      return json({ success: false, errors });
    }

    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
};

export default function Index() {
  const { hasMetafieldDefinition, shopDomain } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <Page title="Banana Try-On">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Metafield warning banner */}
            {!hasMetafieldDefinition && (
              <Banner
                title="Setup Required"
                tone="warning"
                action={{
                  content: "Create Metafield",
                  onAction: () => {
                    fetcher.submit({}, { method: "post" });
                  }
                }}
              >
                <Text>
                  The Banana Try-On metafield needs to be created to manage product settings.
                </Text>
              </Banner>
            )}

            {/* Simple instructions card */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Add Banana Try-On to Your Store
                </Text>

                <Text>
                  To display the Banana Try-On button on your product pages:
                </Text>

                <List type="number">
                  <List.Item>Go to Online Store → Themes</List.Item>
                  <List.Item>Click "Customize" on your active theme</List.Item>
                  <List.Item>Navigate to a product page template</List.Item>
                  <List.Item>Click "Add block" in the product information section</List.Item>
                  <List.Item>Select "Banana Try-On" from the Apps section</List.Item>
                  <List.Item>Position the button and save</List.Item>
                </List>

                <Button
                  primary
                  onClick={() => {
                    window.open(`https://${shopDomain}/admin/themes/current/editor?context=templates/product`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Open Theme Editor
                </Button>
              </BlockStack>
            </Card>

            {/* Product management info */}
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Managing Products
                </Text>

                <Text>
                  Banana Try-On is enabled for all products by default. To disable it for specific products:
                </Text>

                <List>
                  <List.Item>Go to the product admin page</List.Item>
                  <List.Item>Find the "Banana Try-On" section</List.Item>
                  <List.Item>Uncheck "Enable virtual try-on for this product"</List.Item>
                  <List.Item>Save the product</List.Item>
                </List>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}