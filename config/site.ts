const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const  siteConfig = {
  name: "Zunora",
  tagline: "Premium Dry Fruits, Delivered Fresh",
  url: siteUrl.replace(/\/+$/, ""),
  gstNo: "27ABCDE1234F1Z5",
  fssaiNo: "10019022009876",
  currency: "INR",
  colors: {
    cream: "#fbf6ec",
    brown: "#3d2618",
    gold: "#d89822",
    olive: "#5b6f3a"
  },
  logo: {
    text: "Zunora",
    mark: "Z"
  },
  contact: {
    phone: "+91 9180580677",
    email: "zuora99@gmail.example",
    whatsapp: "9180580677",
    address: "Belagavi, Karataka 591109"
  },
  social: {
    instagram: "https://instagram.com/zunora_101126?srtk=b3EwcmFmYXc4aXVp",
    facebook: "https://facebook.com/nutrinest",
    x: "https://x.com/nutrinest"
  },
  shipping: {
    freeAbove: 100,
    flatFee: 79,
    gstRate: 0.05
  }
} as const;

export type SiteConfig = typeof siteConfig;
