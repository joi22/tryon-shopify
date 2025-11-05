import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'shopify-tryon';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL_ID = 'virtual-try-on-preview-08-04';

export async function callVertexAI(userImageBase64, productImageBase64) {
  // Initialize authentication
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Construct endpoint URL
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

  // Prepare request body - API expects array but with only 1 image
  const requestBody = {
    instances: [{
      personImage: {
        image: {
          bytesBase64Encoded: userImageBase64
        }
      },
      productImages: [{
        image: {
          bytesBase64Encoded: productImageBase64
        }
      }]
    }],
    parameters: {
      sampleCount: 1,
      baseSteps: 32,
      personGeneration: "allow_all"
    }
  };

  // Make API call
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex AI error (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();

  // Extract image from response
  if (data.predictions?.[0]?.bytesBase64Encoded) {
    return data.predictions[0].bytesBase64Encoded;
  }

  throw new Error('No image returned from Vertex AI');
}