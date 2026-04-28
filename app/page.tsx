import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { TechStack } from './components/TechStack';
import { Portfolio } from './components/Portfolio';
import { Process } from './components/Process';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Testimonials } from './components/Testimonials';
import { EngagementModels } from './components/EngagementModels';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <TopBar />
      <Hero />
      <Services />
      <TechStack />
      <Portfolio />
      <Process />
      <WhyChooseUs />
      <Testimonials />
      <EngagementModels />
      <Contact />
      <Footer />
    </div>
  );
}

