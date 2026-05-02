import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { SovereigntyBar } from './components/SovereigntyBar';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { TechStack } from './components/TechStack';
import { EngagementModels } from './components/EngagementModels';
import { Analytics } from '@vercel/analytics/next';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <TopBar />
      <Analytics />
      <Hero />
      <SovereigntyBar />
      <About />
      <Portfolio />
      <Services />
      <TechStack />
      <EngagementModels />
      <Contact />
      <Footer />
    </div>
  );
}

