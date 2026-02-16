import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Sterling & Partners | Boekhouder Amsterdam — ZZP, MKB & BV",
  description:
    "Boekhouder in Amsterdam voor ZZP'ers, MKB en BV's. BTW-aangifte, salarisadministratie, jaarrekening en fiscaal advies. NOAB-gecertificeerd. Gratis kennismaking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "AccountingService",
                "name": "Sterling & Partners",
                "description":
                  "Boekhouder in Amsterdam voor ZZP'ers, MKB en BV's. BTW-aangifte, salarisadministratie, jaarrekening en fiscaal advies.",
                "url": "https://sterlingpartners.nl",
                "telephone": "+31201234567",
                "email": "info@sterlingpartners.nl",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Gustav Mahlerlaan 1",
                  "addressLocality": "Amsterdam",
                  "postalCode": "1082 MS",
                  "addressCountry": "NL",
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 52.3389,
                  "longitude": 4.8738,
                },
                "areaServed": {
                  "@type": "Country",
                  "name": "Nederland",
                },
                "priceRange": "€€",
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  "opens": "08:30",
                  "closes": "17:30",
                },
                "sameAs": [],
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Boekhouddiensten",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "ZZP Basis Boekhouding",
                        "description":
                          "Boekhouding, BTW-aangifte en IB voor zelfstandigen",
                      },
                      "price": "99",
                      "priceCurrency": "EUR",
                      "priceSpecification": {
                        "@type": "UnitPriceSpecification",
                        "billingDuration": "P1M",
                      },
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "MKB Groei Boekhouding",
                        "description":
                          "Boekhouding, jaarrekening, VPB en salarisadministratie voor MKB",
                      },
                      "price": "299",
                      "priceCurrency": "EUR",
                      "priceSpecification": {
                        "@type": "UnitPriceSpecification",
                        "billingDuration": "P1M",
                      },
                    },
                  ],
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Voor welk type ondernemer werken jullie?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Wij werken met ZZP'ers, freelancers, MKB-bedrijven en BV's. Of u nu net begint als eenmanszaak of een gevestigd bedrijf heeft met 50+ medewerkers — ons dienstenpakket schaalt mee met uw behoeften.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Hoe verschilt Sterling van een standaard boekhoudkantoor?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Elke klant werkt met een vaste, ervaren boekhouder — niet met wisselende juniors. Wij combineren persoonlijke aandacht met moderne software en proactief fiscaal advies. Wij zijn NOAB-gecertificeerd, wat staat voor kwaliteit en continue bijscholing.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Wat houdt het gratis kennismakingsgesprek in?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Een vrijblijvend gesprek van 30 minuten met een senior boekhouder. Wij bespreken uw huidige situatie, identificeren bespaarkansen en geven een eerste indicatie van de kosten. Geen verplichtingen.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Kan ik de 30%-regeling voor expats via jullie regelen?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Jazeker. Wij begeleiden het volledige 30%-regelingtraject: van de eerste aanvraag bij de Belastingdienst tot de jaarlijkse aangifte. Onze adviseurs zijn ervaren met internationale werknemers en kennen de voorwaarden en valkuilen.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Wanneer is een BV voordeliger dan een eenmanszaak?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Over het algemeen wordt een BV-structuur fiscaal interessant bij een winst vanaf circa €100.000 per jaar. Maar het hangt af van uw persoonlijke situatie, risicoprofiel en toekomstplannen. Wij maken graag een persoonlijke berekening voor u.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Hoe werkt de overstap van een andere boekhouder?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Heel eenvoudig. Wij regelen de volledige overdracht: opvragen van administratie bij uw vorige boekhouder, inrichten van de software, en naadloos overnemen. De meeste klanten merken niets van de transitie.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} grain antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
