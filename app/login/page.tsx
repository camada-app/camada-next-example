import { redirect } from 'next/navigation';

// A deliberately simple login: the server action just answers success/failure. App-context
// event tracking (login_failed etc.) is a @camada/node feature today; the Next.js
// app-context surface lands later — see the README.
async function login(formData: FormData) {
  'use server';
  const ok = formData.get('user') === 'admin' && formData.get('pass') === 'hunter2';
  redirect(`/login?result=${ok ? 'ok' : 'fail'}`);
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  return (
    <main>
      <h1>Login</h1>
      {result === 'ok' && <p>Login succeeded.</p>}
      {result === 'fail' && <p>Login failed.</p>}
      <form action={login}>
        <p>
          <input name="user" placeholder="user (try: admin)" />
        </p>
        <p>
          <input name="pass" type="password" placeholder="password (try: hunter2)" />
        </p>
        <button type="submit">Sign in</button>
      </form>
      <p>
        <a href="/">Home</a>
      </p>
    </main>
  );
}
