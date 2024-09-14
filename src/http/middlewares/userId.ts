import type { FastifyRequest, preHandlerAsyncHookHandler } from "fastify";
import { createUser } from "../../functions/create-user";
import { getUser } from "../../functions/get-user";

const getUserId = (req: FastifyRequest) => {
  const cookies = req.headers.cookie ?? "";
  const userIdCookie = cookies.match(/userId=([^;]+)/);

  return userIdCookie?.[1];
};

function createCookie({
  name,
  value,
  maxAge,
  path,
  domain,
  secure,
  httpOnly,
  sameSite,
  expires
}: {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  expires?: Date;
}) {
  let cookie = `${name}=${value}`;
  if (maxAge) {
    cookie += `; Max-Age=${maxAge}`;
  }
  if (path) {
    cookie += `; Path=${path}`;
  }
  if (domain) {
    cookie += `; Domain=${domain}`;
  }
  if (secure) {
    cookie += "; Secure";
  }
  if (httpOnly) {
    cookie += "; HttpOnly";
  }
  if (sameSite) {
    cookie += `; SameSite=${sameSite}`;
  }
  if (expires) {
    cookie += `; Expires=${expires.toUTCString()}`;
  }
  return cookie;
}

export const handleUserIdMiddleware: preHandlerAsyncHookHandler = async (
  req,
  reply
) => {
  const userId = getUserId(req);
  console.log({ userId, cookies: req.headers.cookie });
  const user = userId ? await getUser(userId) : await createUser();
  console.log({ user });

  if (!user) {
    reply.code(401).send("Unauthorized");
    return;
  }

  if (!userId && user) {
    reply.header(
      "set-cookie",
      createCookie({
        name: "userId",
        value: user.id,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 30
      })
    );
  }

  req.user = user;
};
