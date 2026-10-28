import type { Metadata } from "next";
import HomePreview from "./components/home-preview";

export const metadata: Metadata = {
  title: "Process Overview | LittleHorse Business Console",
  description:
    "Processes, orders, user tasks, and business metrics with sample data.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePreview />;
}
