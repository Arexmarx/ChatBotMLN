import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const getServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const toNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leaderboard")
      .select("id, user_id, score, total_questions, time_spent, completed_at")
      .order("score", { ascending: false })
      .order("time_spent", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Leaderboard API: unable to fetch entries", error);
      return NextResponse.json({ error: "Không thể tải bảng xếp hạng." }, { status: 500 });
    }

    // Attach `full_name` from profiles for better display; attach `email` when service role allows
    let entries = data ?? [];
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (entries.length > 0) {
      try {
        const userIds = Array.from(new Set(entries.map((e) => e.user_id).filter((v): v is string => typeof v === "string")));
        if (userIds.length > 0) {
          // Profiles join (usually allowed via public RLS); best-effort
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);

          if (!profilesError && Array.isArray(profiles)) {
            const nameMap = new Map<string, string | null>();
            for (const p of profiles) {
              const id = (p as any)?.user_id as string | undefined;
              const fullName = (p as any)?.full_name as string | undefined;
              if (id) nameMap.set(id, fullName ?? null);
            }
            entries = entries.map((e) => ({ ...e, full_name: nameMap.get(e.user_id) ?? null }));
          }

          // Emails from auth.users require service role
          if (hasServiceRole) {
            const { data: users, error: usersError } = await supabase
              .schema("auth")
              .from("users")
              .select("id,email")
              .in("id", userIds);
            if (!usersError && Array.isArray(users)) {
              const emailMap = new Map<string, string | null>();
              for (const u of users) {
                const id = (u as any)?.id as string | undefined;
                const email = (u as any)?.email as string | undefined;
                if (id) emailMap.set(id, email ?? null);
              }
              entries = entries.map((e) => ({ ...e, email: emailMap.get(e.user_id) ?? null }));
            }
          }
        }
      } catch (attachError) {
        console.error("Leaderboard API: unable to attach profile names", attachError);
      }
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Leaderboard API: unexpected error", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi khi tải bảng xếp hạng." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const score = toNumber(body?.score);
    const totalQuestions = toNumber(body?.totalQuestions);
    const timeSpent = toNumber(body?.timeSpent);

    if (!userId || score === null || totalQuestions === null || timeSpent === null) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc." }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leaderboard")
      .insert({
        user_id: userId,
        score,
        total_questions: totalQuestions,
        time_spent: timeSpent,
      })
      .select("id, user_id, score, total_questions, time_spent, completed_at")
      .single();

    if (error) {
      console.error("Leaderboard API: unable to insert entry", error);
      return NextResponse.json({ error: "Không thể lưu kết quả." }, { status: 500 });
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error("Leaderboard API: unexpected error", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi khi lưu kết quả." }, { status: 500 });
  }
}
