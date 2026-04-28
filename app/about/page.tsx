import { TopBar } from '../components/TopBar';
import { About } from '../components/About';
import { Footer } from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <About />
      <Footer />
    </div>
  );
}

