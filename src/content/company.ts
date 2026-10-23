// Public company details shown across the site. Taken from the Softgress Pvt Ltd
// Google Business Profile. The public contact email lives in CONTACT_EMAIL and the
// WhatsApp number in WHATSAPP_NUMBER (.env); keep WHATSAPP_NUMBER in sync with phone.

export const office = {
  name: "Softgress Pvt Ltd",
  /** Display lines, top to bottom. */
  lines: ["Akurdi Chowk, Shubhashri Residency", "Ganga Nagar, Akurdi", "Pimpri-Chinchwad, Maharashtra 411035"],
  postal: {
    streetAddress: "Akurdi Chowk, Shubhashri Residency, Ganga Nagar, Akurdi",
    addressLocality: "Pimpri-Chinchwad",
    addressRegion: "Maharashtra",
    postalCode: "411035",
    addressCountry: "IN",
  },
  phone: { display: "+91 74472 07700", tel: "+917447207700" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Softgress+Pvt+Ltd+Akurdi+Chowk+Shubhashri+Residency+Pimpri-Chinchwad+411035",
};

/** schema.org PostalAddress for JSON-LD. */
export const officeLd = { "@type": "PostalAddress", ...office.postal };

/** wa.me link for a WhatsApp number such as "+917447207700". */
export const whatsappUrl = (n: string) => `https://wa.me/${n.replace(/^\+/, "")}`;
