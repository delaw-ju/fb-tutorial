module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiKey: process.env.PUBLIC_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_HOST || '',
    projectId: process.env.PROJECT_ID || '',
  },
};
