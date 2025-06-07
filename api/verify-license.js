export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { licenseKey, productSecret } = req.body;
    
    console.log('Verifying license:', licenseKey);
    
    // Call Payhip License API with updated format
    const payhipResponse = await fetch('https://payhip.com/api/v1/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_secret_key: productSecret,
        license_key: licenseKey
      })
    });
    
    const payhipResult = await payhipResponse.json();
    console.log('Payhip response:', payhipResult);
    
    // Check multiple possible response formats
    if (payhipResult.success || payhipResult.valid || (payhipResult.data && payhipResult.data.valid)) {
      res.status(200).json({ 
        valid: true,
        customerEmail: payhipResult.data?.customer_email || payhipResult.customer_email
      });
    } else {
      res.status(400).json({ 
        valid: false,
        error: payhipResult.message || 'Invalid license key'
      });
    }
    
  } catch (error) {
    console.error('License verification error:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Verification failed: ' + error.message
    });
  }
}
