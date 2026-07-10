import type { Metadata } from "next";

import { MarketingHomePage } from "@/components/marketing-home-page";
import { HomePageGate } from "@/components/home-page-gate";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to My Blog.",
};

export default function Home() {
  return (
    <HomePageGate>
      <MarketingHomePage />
    </HomePageGate>
  );
}
