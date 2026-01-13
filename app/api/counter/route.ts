import { NextResponse } from 'next/server';

const HOME_COUNTER_ENDPOINT = "https://api.counterapi.dev/v2/tran-viet-tra-lams-team-2407/mln131-home/up";

export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_COUNTER_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(HOME_COUNTER_ENDPOINT, {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store",
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const payload = await response.json();
        const count = payload?.data?.up_count ?? payload?.value ?? null;
        
        return NextResponse.json({ count }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('Counter API error:', error);
        return NextResponse.json({ error: 'Failed to fetch counter', count: null }, { status: 500 });
    }
}
