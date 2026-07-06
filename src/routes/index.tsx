import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayClarity — AI Compliance Copilot for Pay Transparency" },
      {
        name: "description",
        content:
          "PayClarity guides HR teams through EU pay transparency compliance with an AI copilot — from CSV to audit-ready report in hours, not weeks.",
      },
    ],
  }),
  component: LandingPage,
});