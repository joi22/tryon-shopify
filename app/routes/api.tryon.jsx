import { json } from "@remix-run/node";
import { callVertexAI } from '../services/vertex-ai.service.js';

export const action = async ({ request }) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const formData = await request.formData();
    const personImage = formData.get('personImage');
    const productImage = formData.get('productImage');

    if (!personImage || !productImage) {
      console.error('Missing images:', {
        personImage: !!personImage,
        productImage: !!productImage
      });
      return json({ error: "Missing required images" }, { status: 400, headers });
    }

    // Convert user image to base64
    const userImageBase64 = Buffer.from(await personImage.arrayBuffer()).toString('base64');

    // Process product image
    let url = productImage;
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (!url.startsWith('http')) {
      url = 'https:' + url;
    }

    // Fetch and convert product image to base64
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch product image: ${url}`);
      throw new Error('Failed to fetch product image');
    }
    const productImageBase64 = Buffer.from(await response.arrayBuffer()).toString('base64');

    // Call Vertex AI with single product image
    const tryOnResult = await callVertexAI(userImageBase64, productImageBase64);

    return json({
      resultImage: `data:image/png;base64,${tryOnResult}`
    }, { headers });

  } catch (error) {
    console.error('Try-on error:', error.message);
    return json({
      error: error.message || "Failed to process try-on"
    }, { status: 500, headers });
  }
};