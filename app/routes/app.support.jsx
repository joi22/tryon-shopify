import { Page, Layout, Card, Text, Link } from "@shopify/polaris";

export default function Support() {
  return (
    <Page title="Support">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="bodyMd">
              For support, please email us at <Link url="mailto:contact@bananatryon.com">contact@bananatryon.com</Link>
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}