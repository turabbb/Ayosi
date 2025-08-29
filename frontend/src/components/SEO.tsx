import { Helmet } from "react-helmet-async";

export const SEO = ({
  title = "Luxury Jewellery Store | Jewel Shine",
  description = "Discover luxury jewellery – rings, necklaces, earrings and more. Premium craftsmanship, modern shopping experience.",
  canonical = "/",
}: {
  title?: string;
  description?: string;
  canonical?: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
  </Helmet>
);
