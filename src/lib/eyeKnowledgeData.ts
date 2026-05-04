export interface Condition {
  id: string
  name: string
  tagline: string
  color: string
  description: string
  symptoms: string[]
  causes: string[]
  treatments: string[]
  prevention: string[]
  funFact: string
}

export interface VisionCorrection {
  id: string
  name: string
  icon: string
  description: string
  howItWorks: string
  pros: string[]
  cons: string[]
  eligibility: string[]
  costRange: string
  duration: string
}

export const EYE_CONDITIONS: Condition[] = [
  {
    id: "myopia",
    name: "Myopia",
    tagline: "Nearsightedness — seeing close clearly, far blurry",
    color: "#2563eb",
    description: "Myopia occurs when the eyeball is too long or the cornea is too curved, causing light to focus in front of the retina instead of directly on it. This makes distant objects appear blurry while nearby objects remain clear.",
    symptoms: [
      "Blurry vision when looking at distant objects",
      "Squinting to see clearly",
      "Headaches from eye strain",
      "Difficulty seeing while driving especially at night",
      "Needing to sit closer to screens or boards"
    ],
    causes: [
      "Genetics — parents with myopia increase risk",
      "Excessive near work — reading, screens",
      "Insufficient time outdoors",
      "Elongated eyeball shape",
      "Increased corneal curvature"
    ],
    treatments: [
      "Corrective glasses or contact lenses",
      "LASIK laser eye surgery",
      "PRK (Photorefractive Keratectomy)",
      "Orthokeratology (overnight contact lenses)",
      "Atropine eye drops for children to slow progression"
    ],
    prevention: [
      "Spend at least 2 hours outdoors daily",
      "Follow the 20-20-20 rule when using screens",
      "Maintain proper reading distance (30cm minimum)",
      "Regular eye check-ups especially for children",
      "Adequate lighting when reading"
    ],
    funFact: "Myopia has doubled in prevalence over the last 50 years, now affecting nearly 30% of the global population — largely attributed to increased screen time and reduced outdoor activity."
  },
  {
    id: "hyperopia",
    name: "Hyperopia",
    tagline: "Farsightedness — seeing far clearly, close blurry",
    color: "#16a34a",
    description: "Hyperopia occurs when the eyeball is too short or the cornea has too little curvature, causing light to focus behind the retina. This makes nearby objects appear blurry. Young people can often compensate with their natural lens but this becomes harder with age.",
    symptoms: [
      "Blurry vision when looking at nearby objects",
      "Eye strain and headaches after reading",
      "Squinting at close objects",
      "Burning or aching eyes",
      "Difficulty with close work like reading or sewing"
    ],
    causes: [
      "Eyeball that is shorter than normal",
      "Cornea with insufficient curvature",
      "Genetic factors",
      "Age-related loss of lens flexibility (presbyopia)",
      "Less common than myopia"
    ],
    treatments: [
      "Corrective glasses with convex lenses",
      "Contact lenses",
      "LASIK surgery (for moderate hyperopia)",
      "Lens replacement surgery",
      "Conductive keratoplasty"
    ],
    prevention: [
      "Regular eye examinations",
      "No proven prevention — largely genetic",
      "Manage eye strain with adequate lighting",
      "Reading glasses as needed with age",
      "Early detection in children is important"
    ],
    funFact: "Almost all newborns are born hyperopic — babies' eyes are shorter than adult eyes. Most children naturally grow out of it as their eyes lengthen during development."
  },
  {
    id: "conjunctivitis",
    name: "Conjunctivitis",
    tagline: "Pink Eye — inflammation of the eye's outer layer",
    color: "#dc2626",
    description: "Conjunctivitis is inflammation of the conjunctiva — the thin transparent layer covering the white of the eye and inner eyelids. It causes redness, discharge, and irritation. It can be caused by infection, allergies, or irritants.",
    symptoms: [
      "Redness in one or both eyes",
      "Itching or burning sensation",
      "Discharge that may crust overnight",
      "Increased tearing",
      "Sensitivity to light",
      "Blurred vision from discharge"
    ],
    causes: [
      "Bacterial infection — Staphylococcus, Streptococcus",
      "Viral infection — Adenovirus, Herpes",
      "Allergic reaction — pollen, dust, pet dander",
      "Chemical irritants — chlorine, smoke",
      "Contact lens irritation"
    ],
    treatments: [
      "Antibiotic eye drops for bacterial type",
      "Antiviral medication for viral type",
      "Antihistamine drops for allergic type",
      "Cold or warm compresses for comfort",
      "Artificial tears for lubrication",
      "Moxifloxacin or Ciprofloxacin eye drops (bacterial)"
    ],
    prevention: [
      "Wash hands frequently",
      "Avoid touching your eyes",
      "Do not share towels or pillowcases",
      "Change contact lenses regularly",
      "Avoid allergen exposure if allergic type"
    ],
    funFact: "Viral conjunctivitis is one of the most contagious eye conditions — a single sneeze near the eye can transmit it. It spreads faster than the common cold in school and workplace settings."
  },
  {
    id: "cataract",
    name: "Cataract",
    tagline: "Clouding of the eye's natural lens",
    color: "#7c3aed",
    description: "A cataract is a clouding of the normally clear lens of the eye. The lens sits behind the iris and pupil and works like a camera lens, focusing light onto the retina. When proteins in the lens clump together, they cause cloudy areas that scatter light and reduce vision clarity.",
    symptoms: [
      "Cloudy or blurry vision",
      "Fading or yellowing of colours",
      "Increased sensitivity to glare",
      "Halos around lights at night",
      "Double vision in one eye",
      "Frequent changes in glasses prescription"
    ],
    causes: [
      "Age-related changes in lens proteins",
      "Diabetes mellitus",
      "Prolonged UV radiation exposure",
      "Smoking and alcohol use",
      "Steroid medication use",
      "Eye injury or trauma"
    ],
    treatments: [
      "Phacoemulsification surgery — most common",
      "Premium IOL (Intraocular Lens) implantation",
      "Monofocal, multifocal, or toric IOLs",
      "Extracapsular cataract extraction",
      "No effective eye drop treatment currently exists"
    ],
    prevention: [
      "Wear UV-protective sunglasses outdoors",
      "Quit smoking",
      "Control diabetes with proper management",
      "Eat antioxidant-rich foods",
      "Regular eye check-ups after age 40"
    ],
    funFact: "Cataract surgery is the most commonly performed surgical procedure in the world — over 28 million surgeries are performed globally every year, with a success rate exceeding 98%."
  }
]

export const VISION_CORRECTIONS: VisionCorrection[] = [
  {
    id: "glasses",
    name: "Spectacles / Glasses",
    icon: "👓",
    description: "The most widely used vision correction method. Lenses are precisely ground to redirect light so it focuses correctly on the retina.",
    howItWorks: "Convex lenses (thicker in centre) correct hyperopia by converging light. Concave lenses (thinner in centre) correct myopia by diverging light before it enters the eye. The power is measured in dioptres.",
    pros: [
      "Non-invasive and completely reversible",
      "Suitable for all ages including children",
      "Easy to put on and remove",
      "Affordable entry point",
      "Can correct astigmatism precisely",
      "No risk of eye infection"
    ],
    cons: [
      "Can fog in humidity and rain",
      "Peripheral vision distortion",
      "Cannot be worn during sports easily",
      "Appearance concerns for some",
      "Break or scratch easily",
      "Frames can cause pressure on nose and ears"
    ],
    eligibility: [
      "Suitable for virtually everyone",
      "All ages from infants to elderly",
      "All degrees of myopia, hyperopia, astigmatism",
      "No minimum or maximum prescription"
    ],
    costRange: "Rs. 500 – Rs. 15,000+",
    duration: "Permanent use — update prescription every 1-2 years"
  },
  {
    id: "contact-lenses",
    name: "Contact Lenses",
    icon: "👁",
    description: "Thin prescription lenses placed directly on the cornea. They move with the eye providing natural vision correction without frames.",
    howItWorks: "Contact lenses work on the same optical principles as glasses but sit directly on the tear film of the cornea. Soft lenses conform to the eye shape while rigid gas-permeable lenses maintain their shape to correct irregular corneas.",
    pros: [
      "Natural field of vision — no frame obstruction",
      "Ideal for sports and physical activity",
      "Compatible with most sunglasses",
      "Daily and monthly options available",
      "Can correct high prescriptions",
      "Extended wear options for overnight use"
    ],
    cons: [
      "Risk of eye infection if not cleaned properly",
      "Dry eyes with prolonged wear",
      "Requires daily cleaning and maintenance",
      "Higher long-term cost than glasses",
      "Not suitable for very dry environments",
      "Cannot be worn with eye infections"
    ],
    eligibility: [
      "Age 12 and above recommended",
      "Myopia, hyperopia, astigmatism",
      "Motivated to maintain lens hygiene",
      "Adequate tear production",
      "Not suitable during eye infections"
    ],
    costRange: "Rs. 200 – Rs. 3,000 per month",
    duration: "Daily, bi-weekly, or monthly replacement"
  },
  {
    id: "lasik",
    name: "LASIK Surgery",
    icon: "⚡",
    description: "Laser-Assisted In Situ Keratomileusis — a refractive surgery that permanently reshapes the cornea to correct vision without glasses or contacts.",
    howItWorks: "A microkeratome or femtosecond laser creates a thin flap in the cornea. An excimer laser then precisely reshapes the underlying corneal tissue to change its focusing power. The flap is replaced and heals naturally within days.",
    pros: [
      "Permanent vision correction in most cases",
      "Quick procedure — 15 minutes per eye",
      "Rapid recovery — most see clearly within 24 hours",
      "Painless procedure",
      "High success rate — over 96% achieve 6/6 vision",
      "Freedom from glasses and contacts"
    ],
    cons: [
      "Irreversible corneal tissue removal",
      "Dry eyes common in first few months",
      "Night glare and halos initially",
      "Not suitable for thin corneas",
      "Enhancement may be needed after 10+ years",
      "Higher upfront cost"
    ],
    eligibility: [
      "Age 18 and above (stable prescription)",
      "Corneal thickness above 500 microns",
      "Myopia up to -10D, hyperopia up to +4D",
      "No active eye disease or dry eye",
      "Not pregnant or nursing",
      "Stable prescription for at least 1 year"
    ],
    costRange: "Rs. 25,000 – Rs. 1,00,000 per eye",
    duration: "Permanent — may need enhancement after 10-15 years"
  },
  {
    id: "prk",
    name: "PRK Surgery",
    icon: "🔬",
    description: "Photorefractive Keratectomy — an older but equally effective laser surgery that reshapes the cornea surface without creating a flap.",
    howItWorks: "The epithelium (outer corneal layer) is removed and an excimer laser reshapes the corneal surface directly. The epithelium regenerates naturally over 3-5 days. No flap is created making it safer for thin corneas.",
    pros: [
      "Suitable for thin corneas where LASIK is not possible",
      "No flap complications",
      "Same long-term results as LASIK",
      "Better for contact sports where eye impact is possible",
      "Treats same range of prescriptions as LASIK"
    ],
    cons: [
      "Slower recovery than LASIK — 1-2 weeks",
      "More discomfort during healing",
      "Vision takes longer to stabilise",
      "Same permanent corneal change as LASIK",
      "Haze risk during healing period"
    ],
    eligibility: [
      "Thin corneas not suitable for LASIK",
      "Same age and prescription requirements as LASIK",
      "Active contact sport participants",
      "No active corneal disease"
    ],
    costRange: "Rs. 20,000 – Rs. 80,000 per eye",
    duration: "Permanent — similar longevity to LASIK"
  }
]
