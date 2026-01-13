const HOME_COUNTER_ENDPOINT = "https://api.counterapi.dev/v2/tran-viet-tra-lams-team-2407/mln131-home/up";

export async function getHomeViewCount(): Promise<number | null> {
    const apiKey = process.env.NEXT_PUBLIC_COUNTER_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(HOME_COUNTER_ENDPOINT, {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store", // Vẫn giữ để đảm bảo lấy số mới nhất
        });
        const payload = await response.json();
        return payload?.data?.up_count ?? payload?.value ?? null;
    } catch (error) {
        return null;
    }
}