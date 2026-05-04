import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import fs from "fs"
import path from "path"

const FILE = path.join(process.cwd(), "data/affiliated-hospitals.json")

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

function readHospitals(): AffiliatedHospital[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as AffiliatedHospital[]
  } catch {
    return []
  }
}

function writeHospitals(data: AffiliatedHospital[]): void {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

async function isAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  return token ? await verifyToken(token) : false
}

// GET /api/admin/affiliated-hospitals
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    return NextResponse.json(readHospitals())
  } catch {
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
  }
}

// POST /api/admin/affiliated-hospitals
export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const body = await request.json()
    const { name, city, speciality, phone, website, logo = "", active = true } = body
    if (!name || !city || !speciality || !phone) {
      return NextResponse.json({ error: "name, city, speciality and phone are required" }, { status: 400 })
    }
    const newHospital: AffiliatedHospital = {
      id: `hosp_${Date.now()}`,
      name,
      city,
      speciality,
      phone,
      website: website || "",
      logo,
      active,
      createdAt: new Date().toISOString()
    }
    const hospitals = readHospitals()
    hospitals.push(newHospital)
    writeHospitals(hospitals)
    return NextResponse.json(newHospital, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create hospital" }, { status: 500 })
  }
}
