/**
 * app/api/rag/sources/route.js
 * Proxy for listing and deleting knowledge sources.
 */
import { NextResponse } from 'next/server';

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let business_id = searchParams.get('business_id');
    if (!business_id || business_id === "null" || business_id === "undefined") {
        business_id = '00000000-0000-4000-8000-000000000001';
    } try {
        const res = await fetch(`${GATEWAY}/api/rag/sources?business_id=${business_id}`);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        const res = await fetch(`${GATEWAY}/api/rag/source?id=${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({ success: true }));
        return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    // Website URL ingestion
    try {
        const body = await request.json();
        const res = await fetch(`${GATEWAY}/api/rag/website`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
