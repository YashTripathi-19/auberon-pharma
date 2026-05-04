import { getProducts } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import StatsCounter from "@/components/landing/StatsCounter";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import AboutSection from "@/components/landing/AboutSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import Testimonials from "@/components/landing/Testimonials";
import NewsletterBanner from "@/components/landing/NewsletterBanner";
import NewsletterSection from "@/components/home/NewsletterSection";
import HospitalTeaser from "@/components/landing/HospitalTeaser";
import EyeHealthTools from "@/components/landing/EyeHealthTools";
import LazySection from "@/components/LazySection";

export default function Home() {
  const products = getProducts().filter((p) => p.isActive);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsCounter />
        <FeaturedProducts products={products} />
        <AboutSection />
        <WhyChooseUs />
        <LazySection>
          <Testimonials />
        </LazySection>
        <LazySection>
          <HospitalTeaser />
        </LazySection>
        <LazySection>
          <NewsletterBanner />
        </LazySection>
        <LazySection>
          <EyeHealthTools />
        </LazySection>
        <LazySection>
          <NewsletterSection />
        </LazySection>
      </main>
      <Footer />
    </>
  );
}
