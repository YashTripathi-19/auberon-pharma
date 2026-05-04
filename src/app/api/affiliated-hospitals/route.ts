import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface AffiliatedHospital {
  id: string
  name: string
  city: string
  speciality: string
  phone: string
  website: string
  logo: string
  active: boolean
  createdAt: string
}

// GET /api/affiliated-hospitals — public, returns active hospitals only
export async function GET() {
  try {
    const file = path.join(process.cwd(), "data/affiliated-hospitals.json")
    const all = JSON.parse(fs.readFileSync(file, "utf-8")) as AffiliatedHospital[]
    return NextResponse.json(all.filter(h => h.active))
  } catch {
    return NextResponse.json([])
  }
}
