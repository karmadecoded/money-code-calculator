export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { licenseKey, productSecret } = req.body;
    
    // Call Payhip License API
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
    
    if (payhipResult.success && payhipResult.data.valid) {
      res.status(200).json({ 
        valid: true,
        customerEmail: payhipResult.data.customer_email 
      });
    } else {
      res.status(400).json({ 
        valid: false,
        error: 'Invalid license key' 
      });
    }
    
  } catch (error) {
    console.error('License verification error:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Verification failed' 
    });
  }
}
