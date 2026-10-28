import type { Metadata } from "next";
import HomePreview from "./components/home-preview";

export const metadata: Metadata = {
  title: "Home concept | LittleHorse Business Console",
  description:
    "An interactive home page concept with fictional business process data.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePreview />;
}
