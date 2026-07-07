import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website', 
  schemas = [] 
}) => {
  const location = useLocation();
  const siteName = 'Sterling Kart';
  const siteUrl = 'https://sterlingkart.in';
  
  const currentUrl = url || `${siteUrl}${location.pathname}`;
  const defaultImage = `${siteUrl}/giftcard.png`; // Fallback Open Graph image
  const defaultDescription = 'Premium 925 Sterling Silver Jewellery Store. Crafted in Silver. Worn with Love. Shop rings, earrings, necklaces, bracelets and more.';
  
  // Construct the final title (unless it already ends with the site name)
  const finalTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Structured Data (JSON-LD) */}
      {schemas.length > 0 && schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  schemas: PropTypes.arrayOf(PropTypes.object)
};

export default SEO;
