
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const headers = new Headers(response.headers);
        headers.set('Content-Disposition', 'attachment; filename="bobbie-goods-desenho.png"');
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(response.body, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('Proxy Image Error:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}
