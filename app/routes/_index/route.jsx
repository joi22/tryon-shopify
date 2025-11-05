import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Banana Try-On: Virtual Try-On for Your Store</h1>
        <p className={styles.text}>
          Let your customers visualize how clothing and accessories look on them with AI-powered virtual try-on technology, increasing conversion and reducing returns.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>AI-Powered Virtual Try-On</strong>. Advanced Google Vertex AI technology lets customers see how products look on them before purchasing.
          </li>
          <li>
            <strong>Easy Integration</strong>. Add a try-on button to your product pages with just a few clicks - no coding required.
          </li>
          <li>
            <strong>Increase Conversions</strong>. Help customers make confident purchase decisions, boosting sales and reducing returns.
          </li>
        </ul>
      </div>
    </div>
  );
}
