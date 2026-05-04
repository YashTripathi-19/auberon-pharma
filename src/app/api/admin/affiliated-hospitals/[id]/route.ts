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

// PUT /api/admin/affiliated-hospitals/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const body = await request.json()
    const hospitals = readHospitals()
    const index = hospitals.findIndex(h => h.id === id)
    if (index === -1) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    hospitals[index] = { ...hospitals[index], ...body, id }
    writeHospitals(hospitals)
    return NextResponse.json(hospitals[index])
  } catch {
    return NextResponse.json({ error: "Failed to update hospital" }, { status: 500 })
  }
}

// DELETE /api/admin/affiliated-hospitals/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const hospitals = readHospitals()
    const filtered = hospitals.filter(h => h.id !== id)
    if (filtered.length === hospitals.length) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    writeHospitals(filtered)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete hospital" }, { status: 500 })
  }
}
