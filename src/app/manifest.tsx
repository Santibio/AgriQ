import type { MetadataRoute } from "next";

export default function manifest() {
  return {
    name: "AgriQ",
    short_name: "AgriQ",
    description: "Un aplicacion mobile para dar seguimiento a productos",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "images/icon.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "images/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}