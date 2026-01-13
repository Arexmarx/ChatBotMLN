import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, avatarUrl, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      );
    }

    // Use service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = row not found
      console.error("Error fetching profile:", fetchError);
      console.error("Fetch error details:", {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint
      });
      return NextResponse.json(
        { error: "Failed to fetch profile", details: fetchError.message },
        { status: 500 }
      );
    }

    // If profile exists, return it
    if (existingProfile) {
      return NextResponse.json({
        user: {
          userId: existingProfile.user_id,
          email,
          fullName: existingProfile.full_name,
          avatarUrl: existingProfile.avatar_url,
          isNewUser: false,
        },
      });
    }

    // Create new profile for first-time login
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: fullName || email.split("@")[0],
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      console.error("Insert error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json(
        { error: "Failed to create profile", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        userId: newProfile.user_id,
        email,
        fullName: newProfile.full_name,
        avatarUrl: newProfile.avatar_url,
        isNewUser: true,
      },
    });
  } catch (error) {
    console.error("Sync user error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
