/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { leadId } = await params

    const { data: activities, error } = await (supabase as any)
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(activities ?? [])
  } catch (error: any) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { leadId } = await params
    const body = await request.json()

    const { data: activity, error } = await (supabase as any)
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        activity_type: body.activity_type || "note_added",
        description: body.description,
        metadata: body.metadata || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
