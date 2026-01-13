const HOME_COUNTER_ENDPOINT = "https://api.counterapi.dev/v2/tran-viet-tra-lams-team-2407/mln131-home/up";

// Increments the Counter API home view counter and returns the current up_count.
export async function getHomeViewCount(): Promise<number | null> {
	const apiKey = process.env.NEXT_PUBLIC_COUNTER_API_KEY;

	if (!apiKey) {
		console.error("Counter API key is missing");
		return null;
	}

	try {
		const response = await fetch(HOME_COUNTER_ENDPOINT, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			console.error("Counter API request failed", response.status, response.statusText);
			return null;
		}

		const payload = await response.json();
		console.log("Counter API response", payload);

		const upCount = payload?.data?.up_count;
		if (typeof upCount === "number") {
			return upCount;
		}

		const fallbackValue = payload?.value ?? payload?.data?.value;
		return typeof fallbackValue === "number" ? fallbackValue : null;
	} catch (error) {
		console.error("Counter API error", error);
		return null;
	}
}
