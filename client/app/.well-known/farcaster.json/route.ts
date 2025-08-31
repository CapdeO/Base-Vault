function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjg3OTUzNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEFENzAxMzNhYjVEQ2QwOUQ3NTdDZDdjYjZkM2Q5ZTY2MTIyNUJlRkMifQ",
      payload: "eyJkb21haW4iOiJiYXNlLXZhdWx0LWFsZXBoLnZlcmNlbC5hcHAifQ",
      signature: "MHhiNjVmMzU1ODI2Njc4MWFiODUyYTJhNzc5NjBhYzZmMGUyNDY1YjI2MzY0ZjcyZWIyODgyMmRlODQzYTAyNDNlMDk2MDM4YjE0YzZjZWFmYWUyNTRjNjM4MTMyYjgxNzJmNDgyNjFlMGRhYjY2YzJjNTNiMWRhMTg1OGEzOTE3ODFi",
    },
    frame: withValidProperties({
      version: '1',
      name: "BaseVault",
      subtitle: "Set goals and savely earn USDC",
      description: "Create your first savings goal to start earning yield with Aave and Symbiotic",
      screenshotUrls: [],
      iconUrl: "https://base-vault-aleph.vercel.app/base.webp",
      splashImageUrl: "https://base-vault-aleph.vercel.app/splash.png",
      splashBackgroundColor: "#000000",
      homeUrl: "https://base-vault-aleph.vercel.app",
      webhookUrl: "https://base-vault-aleph.vercel.app/api/webhook",
      primaryCategory: "finance",
      tags: ["lending", "saving", "earn", "usdc", "vault"],
      heroImageUrl: undefined,
      tagline: undefined,
      ogTitle: undefined,
      ogDescription: undefined,
      ogImageUrl: undefined,            
    }),
  });
}