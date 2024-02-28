const config = {
  STRIPE_PUBLIC_KEY: "pk_test_51OYabUDQM8goeywJKgIY0hYReAm5YFburHlJqiCC20VlSm1PPldQREmsEseqAADMMW4ZZRHt7rzLkeK4dXtx7uO700spmXMb0Z",
  // Backend config
  s3: {
    REGION: import.meta.env.VITE_REGION,
    BUCKET: import.meta.env.VITE_BUCKET,
  },
  apiGateway: {
    REGION: import.meta.env.VITE_REGION,
    URL: import.meta.env.VITE_API_URL,
  },
  cognito: {
    REGION: import.meta.env.VITE_REGION,
    USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    APP_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    IDENTITY_POOL_ID: import.meta.env.VITE_IDENTITY_POOL_ID,
  },
};

export default config;