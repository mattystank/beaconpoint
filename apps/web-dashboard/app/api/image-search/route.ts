import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Set your Unsplash Access Key in the environment variable UNSPLASH_ACCESS_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'Missing Unsplash access key' }, { status: 500 });
  }
  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: 502 });
    }
    const data = await res.json();
    const imageUrl = data.results?.[0]?.urls?.regular || null;
    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
