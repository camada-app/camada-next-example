'use client';
import { useState } from 'react';

export default function Home() {
  const [data, setData] = useState<string | null>(null);
  return (
    <main>
      <h1>camada-next-example</h1>
      <p>
        Every request on this app flows through <code>@camada/next</code>: the middleware
        enforces the tenant blocklist inline and ships wire events, and the layout&apos;s{' '}
        <code>&lt;CamadaBeacon/&gt;</code> loads the fingerprint beacon first-party from{' '}
        <code>/api/camada/b.js</code>.
      </p>
      <p>
        <a href="/login">Go to the login page</a>
      </p>
      <p>
        <button
          onClick={async () => {
            const res = await fetch('/api/data');
            setData(JSON.stringify(await res.json()));
          }}
        >
          Fetch /api/data
        </button>
      </p>
      {data && <pre>{data}</pre>}
    </main>
  );
}
