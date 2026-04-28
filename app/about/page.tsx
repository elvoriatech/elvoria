import { TopBar } from '../components/TopBar';
import { About } from '../components/About';
import { Footer } from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <TopBar />
      <About />
      <Footer />
    </div>
  );
}

