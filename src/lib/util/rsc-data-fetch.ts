import { RequestInit } from 'next/dist/server/web/spec-extension/request';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export default async function getDataFromApi(
  url: string,
  options: RequestInit
) {
  const reqCookies = cookies();
  const cookiesFromReq = reqCookies.getAll();
  const req = new NextRequest(url, options);

  cookiesFromReq.forEach((cookie) => {
    req.cookies.set(cookie.name, cookie.value);
  });

  return fetch(req);
}
