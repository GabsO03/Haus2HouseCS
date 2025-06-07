const fs = require('fs');
require('dotenv').config();

const envConfig = `
export const environment = {
  production: true,
  baseURL: '${process.env.BASE_URL_PROD || 'https://haus2houseapi.onrender.com/api'}',
  stripePublicKey: '${process.env.STRIPE_PUBLIC_KEY || 'pk_test_51R4hk3I1vsstshh6aPYhn0EMySVkxMP4p0lA2LyHH7t7Oza2Ij8x8khTST91XcHMKw1N0AcQw4NEbImKCY5rFCwq00NfN8YnOL'}',
  cryptoServiceKey: '${process.env.CRYPTO_KEY || 'x9k3m7p2q8w4z6t1r5y0u2n4b6v8j0l5'}'
};
`;

fs.writeFileSync('src/app/environments/environment.prod.ts', envConfig);