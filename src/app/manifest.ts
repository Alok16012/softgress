import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Softgress: Software Development & Digital Marketing, Pune",
    short_name: "Softgress",
    description: "Software development and digital marketing company in Pimpri-Chinchwad, Pune, India.",
    start_url: "/",
    display: "standalone",
    background_color: "#04060F",
    theme_color: "#04060F",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
