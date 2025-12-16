import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const gatewayUrl = (process.env.GATEWAY_URL || "http://localhost:3000").trim();
        const targetUrl = `${gatewayUrl}/api/vapi/call`;

        // Robust business_id check
        if (!body.business_id || body.business_id === "null" || body.business_id === "undefined") {
            body.business_id = '00000000-0000-4000-8000-000000000001';
        }

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ GATEWAY_RETURNED_ERROR:", response.status, errorText);
            return NextResponse.json({ error: `Gateway Error ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        console.error("❌ DASHBOARD_PROXY_EXCEPTION:", err);
        return NextResponse.json({ error: "Proxy Exception", details: err.message }, { status: 500 });
    }
}
