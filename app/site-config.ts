export const siteConfig = {
  contactEmails: (process.env.NEXT_PUBLIC_CONTACT_EMAILS || "technervaislive@gmail.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
};
