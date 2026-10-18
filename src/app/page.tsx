import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { WhatYouGet } from "@/components/WhatYouGet";
import { HowItWorks } from "@/components/HowItWorks";
import { ForWhom } from "@/components/ForWhom";
import { Offer } from "@/components/Offer";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main id="conteudo">
      <Hero />
      <Problem />
      <Solution />
      <WhatYouGet />
      <HowItWorks />
      <ForWhom />
      <Offer />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
