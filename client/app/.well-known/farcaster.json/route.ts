function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

// TODO: use real values from:
// {
//   "frame": {
//     "name": "BaseVault",
//     "version": "1",
//     "iconUrl": "https://base-vault-aleph.vercel.app/base.webp",
//     "homeUrl": "https://base-vault-aleph.vercel.app",
//     "splashImageUrl": "https://base-vault-aleph.vercel.app/splash.png",
//     "splashBackgroundColor": "#000000",
//     "subtitle": "Set goals and savely earn USDC",
//     "description": "Create your first savings goal to start earning yield with Aave and Symbiotic",
//     "primaryCategory": "finance",
//     "tags": [
//       "lending",
//       "saving",
//       "earn",
//       "usdc",
//       "vault"
//     ]
//   },
//   "accountAssociation": {
//     "header": "eyJmaWQiOjg3OTUzNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEFENzAxMzNhYjVEQ2QwOUQ3NTdDZDdjYjZkM2Q5ZTY2MTIyNUJlRkMifQ",
//     "payload": "eyJkb21haW4iOiJiYXNlLXZhdWx0LWFsZXBoLnZlcmNlbC5hcHAifQ",
//     "signature": "MHhiNjVmMzU1ODI2Njc4MWFiODUyYTJhNzc5NjBhYzZmMGUyNDY1YjI2MzY0ZjcyZWIyODgyMmRlODQzYTAyNDNlMDk2MDM4YjE0YzZjZWFmYWUyNTRjNjM4MTMyYjgxNzJmNDgyNjFlMGRhYjY2YzJjNTNiMWRhMTg1OGEzOTE3ODFi"
//   }
// }


export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: '1',
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,            
    }),
  });
}