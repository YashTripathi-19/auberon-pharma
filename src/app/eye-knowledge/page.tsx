import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import EyeKnowledgeClient from "./EyeKnowledgeClient"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
  title: 'Eye Health Knowledge Hub',
  description: 'Explore interactive eye health education — 3D eye anatomy, condition guides, vision correction comparisons and an eye health quiz.',
  path: '/eye-knowledge',
})

export default function EyeKnowledgePage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
        <EyeKnowledgeClient />
      </main>
      <Footer />
    </>
  )
}
