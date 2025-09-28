// app/api/user/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const pin = searchParams.get('pin');

  return new Response(JSON.stringify({ message: `Hello ${username}`, pin }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const body = await request.json();
  // Do something with body, e.g., save user
  return new Response(JSON.stringify({ success: true, body }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
