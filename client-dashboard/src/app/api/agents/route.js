import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'http://127.0.0.1:8000';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let business_id = searchParams.get('business_id');
        if (!business_id || business_id === "null" || business_id === "undefined") {
            business_id = '00000000-0000-4000-8000-000000000001';
        }

        const res = await fetch(`${BRAIN_URL}/api/agents?business_id=${business_id}`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing agent id' }, { status: 400 });

        const res = await fetch(`${BRAIN_URL}/api/agents/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({ status: 'deleted' }));
        return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing agent id' }, { status: 400 });

        const body = await request.json();
        const res = await fetch(`${BRAIN_URL}/api/agents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
