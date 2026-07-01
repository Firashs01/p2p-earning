import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function login(formData: FormData) {
  'use server'
  const password = formData.get('password')
  if (password === process.env.APP_ACCESS_PASSWORD) {
    cookies().set('app_auth', password as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    redirect('/')
  } else {
    redirect('/login?error=Invalid+password')
  }
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" action={login}>
          {searchParams?.error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-md">
              {searchParams.error}
            </div>
          )}
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
