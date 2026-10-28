import type { Metadata } from "next";
import HomePreview from "./components/home-preview";

export const metadata: Metadata = {
  title: "Workflow Overview | LittleHorse Business Console",
  description:
    "Workflows, user tasks, public variables, WorkflowEvents, and business metrics with sample data.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePreview />;
}
