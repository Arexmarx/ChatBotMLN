import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_COUNT = 12;
const MAX_COUNT = 50;
const FETCH_LIMIT = 200;

type QuizRecord = {
	id: string;
	question: string;
	options: unknown;
	correct_option_index: unknown;
};

type QuizPayload = {
	id: string;
	question: string;
	options: string[];
	correctOptionIndex: number;
};

const parseOptions = (raw: unknown): string[] => {
	if (Array.isArray(raw)) {
		return raw.filter((item): item is string => typeof item === "string");
	}

	if (typeof raw === "string") {
		try {
			const parsed = JSON.parse(raw);
			return parseOptions(parsed);
		} catch {
			return raw
				.split(/[,\r\n]+/)
				.map((item) => item.trim())
				.filter(Boolean);
		}
	}

	if (raw && typeof raw === "object") {
		return Object.values(raw)
			.map((item) => parseOptions(item))
			.flat()
			.filter(Boolean);
	}

	return [];
};

const shuffle = <T,>(input: T[]): T[] => {
	const items = [...input];
	for (let i = items.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const requestedCount = Number.parseInt(searchParams.get("count") ?? "", 10);
	const count = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.min(requestedCount, MAX_COUNT) : DEFAULT_COUNT;

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseServiceKey) {
		console.error("Game API: missing Supabase credentials");
		return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
	}

	try {
		const supabase = createClient(supabaseUrl, supabaseServiceKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
		const { data, error } = await supabase
			.from("quizzes")
			.select("id, question, options, correct_option_index")
			.limit(FETCH_LIMIT);

		if (error) {
			console.error("Game API: unable to fetch quizzes", error);
			return NextResponse.json({ error: "Không thể lấy danh sách câu hỏi." }, { status: 500 });
		}

		const sanitized = (data ?? [])
			.map<QuizPayload | null>((row) => {
				const record = row as QuizRecord;
				if (typeof record.id !== "string" || typeof record.question !== "string") {
					return null;
				}

				const options = parseOptions(record.options);
				if (options.length < 2) {
					return null;
				}

				let correctIndex: number | null = null;
				if (typeof record.correct_option_index === "number") {
					correctIndex = record.correct_option_index;
				} else if (typeof record.correct_option_index === "string") {
					const parsed = Number(record.correct_option_index);
					if (Number.isInteger(parsed)) {
						correctIndex = parsed;
					}
				}

				if (correctIndex !== null && correctIndex >= options.length && correctIndex - 1 >= 0 && correctIndex - 1 < options.length) {
					correctIndex -= 1;
				}

				if (correctIndex === null || correctIndex < 0 || correctIndex >= options.length) {
					return null;
				}

				return {
					id: record.id,
					question: record.question,
					options,
					correctOptionIndex: correctIndex,
				};
			})
			.filter((item): item is QuizPayload => Boolean(item));

		if (!sanitized.length) {
			return NextResponse.json({ quizzes: [] });
		}

		const shuffled = shuffle(sanitized);
		return NextResponse.json({ quizzes: shuffled.slice(0, count) });
	} catch (error) {
		console.error("Game API: unexpected error", error);
		return NextResponse.json({ error: "Đã xảy ra lỗi trong quá trình lấy câu hỏi." }, { status: 500 });
	}
}
