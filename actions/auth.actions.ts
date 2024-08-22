"use client"

import axios from 'axios';
import Cookies from 'js-cookie';

const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
const apiURI = 'https://dev.phc.events';

interface HandleLoginProps {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

export function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export const handleLogin = async ({ access_token, expires_in, refresh_token }: HandleLoginProps): Promise<boolean> => {
  try {
    // Store the access token and refresh token securely.
    // Since this is client-side code, we'll use sessionStorage for temporary storage.
    // Note: Be cautious with localStorage/sessionStorage as they are vulnerable to XSS.
    Cookies.set('access_token', access_token, { expires: expires_in / 86400, secure: !isDevelopment });
    Cookies.set('token_expiration', (new Date().getTime() + (expires_in * 1000)).toString(), { secure: !isDevelopment });
    Cookies.set('refresh_token', refresh_token, { secure: !isDevelopment });

    const userResponse = await axios({
      method: "get",
      url: "https://my.pureheart.org/ministryplatformapi/oauth/connect/userinfo",
      headers: {
        "Content-Type": "Application/JSON",
        "Authorization": `Bearer ${access_token}`
      }
    })
    
    const user = userResponse.data;
    Cookies.set('user', JSON.stringify(user), { expires: expires_in / 86400, secure: !isDevelopment });

    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

export const handleLogout = async () => {
  try {
    const access_token = Cookies.get('access_token');
    const refresh_token = Cookies.get('refresh_token');
    if (access_token) {
      await axios({
        method: 'post',
        url: `${apiURI}/api/auth/revoke`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          token: access_token,
          token_hint: 'access_token'
        })
      })
    }
    if (refresh_token) {
      await axios({
        method: 'post',
        url: `${apiURI}/api/auth/revoke`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          token: refresh_token,
          token_hint: 'refresh_token'
        })
      })
    }
  } catch (error) {
    console.error("Failed to revoke auth tokens.")
  }
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('token_expiration');
  Cookies.remove('user');

  return;
}

export const saveAccessToken = (access_token: string, expires_in_seconds: number) => {
  Cookies.set('access_token', access_token, { expires: expires_in_seconds * 1000, secure: !isDevelopment });
  Cookies.set('token_expiration', (new Date().getTime() + (expires_in_seconds * 1000)).toString(), { secure: !isDevelopment });
  console.log('Saving access token', expires_in_seconds);
};

const getNewTokenDataFromRefreshToken = async (refresh_token:string) => {
  return await axios({
    method: 'post',
    url: `${apiURI}/api/auth/refresh`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      refresh_token: refresh_token
    })
  })
    .then(response => response.data);
}

export const getToken = async () => {
  try {
    // return access token from cookie
    const access_token = Cookies.get('access_token');
    const token_expiration = Cookies.get('token_expiration');
    if (access_token && token_expiration && new Date(parseInt(token_expiration)) > new Date()) {
      // console.log('Access token valid')
      return access_token
    }
    // console.log('Access token expired')
    // if no access token, check for refresh token
    const refresh_token = Cookies.get('refresh_token');
    // if no refresh token, logout
    if (!refresh_token) {
      // console.log('No valid refresh token')
      return null;
      // may need to redirect user
    }
    // use refresh token to get new access token
    // console.log('Valid refresh token');
    // console.log('Getting new access token');
    const { access_token: new_access_token, expires_in: new_expires_in } = await getNewTokenDataFromRefreshToken(refresh_token);
    // save and return new access token
    // console.log('Received new access token');
    saveAccessToken(new_access_token, new_expires_in);
    return new_access_token;
  } catch (error) {
    // console.error(error);
    return null;
  }
}