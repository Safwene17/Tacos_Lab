const fs = require('fs');

// Platform env vars win; loadEnvFile never overrides them.
if (fs.existsSync('.env')) process.loadEnvFile('.env');

const key = process.env.GOOGLE_MAPS_API_KEY;
if (!key) {
  const msg = 'GOOGLE_MAPS_API_KEY is not set (see .env.example).';
  if (process.env.CI || process.env.NODE_ENV === 'production') throw new Error(msg);
  console.warn(`Warning: ${msg} The map will not load.`);
}

fs.writeFileSync(
  'src/environments/keys.ts',
  `export const googleMapsEmbedApiKey = ${JSON.stringify(key ?? '')};\n`,
);
