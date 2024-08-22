import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'
import { saveAccessToken } from './actions/auth.actions';
 
const apiURI = 'https://dev.phc.events';
const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/', '/ha']
const publicRoutes = ['/login']
 
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  let cookie = cookies().get('access_token')?.value
  let user = cookies().get('user')?.value
  const refresh_token = cookies().get('refresh_token')?.value

  if (
    isPublicRoute &&
    cookie
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  } if (!cookie && !refresh_token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  } else if (refresh_token && isProtectedRoute || !user) {
    await axios({
      method: 'post',
      url: `${apiURI}/api/auth/refresh`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        refresh_token: refresh_token
      })
    })
    .then(async response => {
      const { access_token, expires_in } = response.data;
      // console.log(access_token)
      saveAccessToken(access_token, expires_in)
      const user = await axios({
        method: "get",
        url: "https://my.pureheart.org/ministryplatformapi/oauth/connect/userinfo",
        headers: {
          "Content-Type": "Application/JSON",
          "Authorization": `Bearer ${access_token}`
        }
      })
      // console.log(user.data)
          cookies().set('user', JSON.stringify(user), { expires: expires_in / 86400, secure: !isDevelopment });
    })
    .catch(() => {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    })
  }
  // 6. Redirect to /dashboard if the user is authenticated
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}