import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HeroTransition } from "../components/HeroTransition";
import { Challenge } from "../components/Challenge";
import { Solution } from "../components/Solution";
import { LearningExperience } from "../components/LearningExperience";
import { MentorshipStudio } from "../components/MentorshipStudio";
import { Ecosystem } from "../components/Ecosystem";
import { Partnerships } from "../components/Partnerships";
import { GlobalAdoption } from "../components/GlobalAdoption";
import { ImpactMetrics } from "../components/ImpactMetrics";
import { Investment } from "../components/Investment";
import { Research } from "../components/Research";
import { Leadership } from "../components/Leadership";
import { Partners } from "../components/Partners";
import { Vision } from "../components/Vision";
import { FinalCTA } from "../components/FinalCTA";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";

export default function Home() {
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="A New Category of Creative Education" description="CCDP is redefining creative higher education — integrating academic excellence, education technology, AI, industry mentorship, global collaboration, and lifelong career development into one connected ecosystem." />
      <Navbar />
      <main>
        <Hero />
        <HeroTransition />
        <Challenge />
        <Solution />
        <LearningExperience />
        <MentorshipStudio />
        <Ecosystem />
        <Partnerships />
        <GlobalAdoption />
        <ImpactMetrics />
        <Investment />
        <Research />
        <Leadership />
        <Partners />
        <Vision />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
