import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormBuilder } from "./form-builder";

export const metadata: Metadata = {
  title: "User Task Form Builder | LittleHorse Business Console",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.LH_FORM_BUILDER_DEMO !== "1"
  )
    notFound();
  return <FormBuilder />;
}
