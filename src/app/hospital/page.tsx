import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HospitalPageClient from "@/app/hospital/HospitalPageClient";
import AffiliatedHospitalsSection from "@/components/AffiliatedHospitalsSection";
import fs from "fs";
import path from "path";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: 'Hospital Wing',
  description: 'Book appointments at our partner eye care hospitals. Specialist ophthalmology consultations and treatments across India.',
  path: '/hospital',
});

export default function HospitalPage() {
  let isPublic = false;
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/settings.json"), "utf-8"));
    isPublic = settings?.hospitalWing?.isPublic === true;
  } catch { /* default false */ }

  if (!isPublic) redirect("/");

  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/hospital.json"), "utf-8"));

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <HospitalPageClient data={data} />
        </Suspense>
        <AffiliatedHospitalsSection />
      </main>
      <Footer />
    </>
  );
}
