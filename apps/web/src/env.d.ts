/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale: "en" | "id";
  }
}

interface Window {
  L?: {
    map: (...args: unknown[]) => unknown;
    tileLayer: (...args: unknown[]) => unknown;
    circleMarker: (...args: unknown[]) => unknown;
    latLngBounds: (...args: unknown[]) => unknown;
  };
  __nusaLeaflet?: Promise<Window["L"]>;
}
