import "./App.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import Demo from "./components/Demo";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Demo />
      </main>

      <Footer />
    </div>
  );
}

export default App;