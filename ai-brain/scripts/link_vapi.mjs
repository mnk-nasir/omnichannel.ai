import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'client-dashboard', '.env.local') });

async function linkTwilioToVapi() {
  const vapiPrivateKey = process.env.VAPI_PRIVATE_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const phoneNumber = '+18704449361';

  if (!vapiPrivateKey || !twilioSid || !twilioAuthToken || !assistantId) {
    console.error("Missing environment variables.");
    return;
  }

  console.log("Linking Twilio Number to Vapi...");

  try {
    const response = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'twilio',
        number: phoneNumber,
        twilioAccountSid: twilioSid,
        twilioAuthToken: twilioAuthToken,
        assistantId: assistantId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
        console.log("SUCCESS! Twilio number linked to Vapi.");
        console.log(data);
    } else {
        console.error("FAILED to link number:", data);
    }
  } catch (err) {
    console.error("Network Error:", err);
  }
}

linkTwilioToVapi();
