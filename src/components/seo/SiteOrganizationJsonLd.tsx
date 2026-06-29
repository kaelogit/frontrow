import { JsonLd } from "@/components/seo/JsonLd";
import { buildMarketplaceOrganizationJsonLd } from "@/lib/seo/jsonld";

export function SiteOrganizationJsonLd() {
  return <JsonLd data={buildMarketplaceOrganizationJsonLd()} />;
}
