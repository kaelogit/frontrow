import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

export const DEFAULT_OG_IMAGE = "/images/hero-stadium.jpg";

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSocialMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  imagePath = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description?: string;
  path?: string;
  imagePath?: string;
}): Pick<Metadata, "openGraph" | "twitter" | "alternates"> {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);

  return {
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Event Tickets`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  ...buildSocialMetadata({
    title: `${SITE_NAME} — Premium Event Tickets`,
    description: SITE_DESCRIPTION,
    path: "/",
    imagePath: DEFAULT_OG_IMAGE,
  }),
};
