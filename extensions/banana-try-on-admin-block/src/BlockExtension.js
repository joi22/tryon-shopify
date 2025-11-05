import {
  extend,
  AdminBlock,
  BlockStack,
  Checkbox,
  Form
} from '@shopify/ui-extensions/admin';

const TARGET = 'admin.product-details.block.render';

extend(TARGET, (root, api) => {
  const productGid = api.data.selected?.[0]?.id;

  if (!productGid) {
    return;
  }

  // Default to true for new products (enabled by default)
  let currentValue = true;

  const checkbox = root.createComponent(Checkbox, {
    name: 'virtualTryOn',
    label: 'Enable Banana Try-On for this product',
    checked: true,
    onChange: (value) => {
      currentValue = value;
    }
  });

  const form = root.createComponent(Form, {
    onSubmit: async () => {
      try {
        const result = await api.query(
          `mutation UpdateProductMetafield($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
                metafield(namespace: "custom", key: "virtual_tryon_enabled") {
                  value
                }
              }
              userErrors {
                field
                message
              }
            }
          }`,
          {
            variables: {
              input: {
                id: productGid,
                metafields: [
                  {
                    namespace: "custom",
                    key: "virtual_tryon_enabled",
                    type: "boolean",
                    value: currentValue.toString()
                  }
                ]
              }
            }
          }
        );

        if (result?.data?.productUpdate?.userErrors?.length > 0) {
          const error = result.data.productUpdate.userErrors[0];
          return { status: "error", errors: [{ message: error.message }] };
        }

        checkbox.updateProps({
          defaultValue: currentValue
        });

        return { status: "success" };
      } catch (error) {
        return { status: "error", errors: [{ message: "Failed to save settings" }] };
      }
    }
  });

  const stack = root.createComponent(BlockStack, { gap: "base" });
  stack.appendChild(checkbox);
  form.appendChild(stack);

  const adminBlock = root.createComponent(AdminBlock, {
    title: "Banana Try-On"
  });
  adminBlock.appendChild(form);
  root.appendChild(adminBlock);

  api.query(
    `query GetProductMetafield($id: ID!) {
      product(id: $id) {
        metafield(namespace: "custom", key: "virtual_tryon_enabled") {
          value
        }
      }
    }`,
    {
      variables: {
        id: productGid
      }
    }
  ).then(result => {
    const metafield = result?.data?.product?.metafield;
    // Default to true (enabled) when metafield doesn't exist
    // Only set to false when explicitly set to "false"
    const isEnabled = !metafield || metafield.value !== "false";

    currentValue = isEnabled;

    checkbox.updateProps({
      checked: isEnabled,
      defaultValue: isEnabled
    });
  });
});