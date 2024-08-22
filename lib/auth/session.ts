import Cookies from 'js-cookie';
import axios from 'axios';

// const apiURI = 'http://localhost:5000';
// const apiURI = 'http://10.13.13.34:5000';
const apiURI = 'https://dev.phc.events';
const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const saveAccessToken = (access_token: string, expires_in_seconds: number) => {
  Cookies.set('access_token', access_token, { expires: expires_in_seconds / 86400, secure: !isDevelopment });
  Cookies.set('token_expiration', (new Date().getTime() + (expires_in_seconds * 1000)).toString(), { secure: !isDevelopment });
};

const getNewTokenDataFromRefreshToken = async (refresh_token: string) => {
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

const getToken = async () => {
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

export {
  getToken
}