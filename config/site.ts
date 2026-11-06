export const siteConfig = {
  name: "Zunora",
  tagline: "Premium Dry Fruits, Delivered Fresh",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
    phone: "+91 98765 43210",
    email: "hello@zunora.example",
    whatsapp: "919876543210",
    address: "2nd Floor, Wellness Market, Mumbai, Maharashtra 400001"
  },
  social: {
    instagram: "https://instagram.com/nutrinest",
    facebook: "https://facebook.com/nutrinest",
    x: "https://x.com/nutrinest"
  },
  shipping: {
    freeAbove: 999,
    flatFee: 79,
    gstRate: 0.05
  }
} as const;

export type SiteConfig = typeof siteConfig;
