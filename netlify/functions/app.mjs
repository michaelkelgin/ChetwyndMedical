import { handleRequest } from "../../src/server/handler.mjs";
import { openStores } from "../../src/server/open-stores.mjs";

export default async (request) => {
  try {
    const stores = await openStores(process.env);
    return await handleRequest(request, { stores, env: process.env });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "The members service failed." }, { status: 500 });
  }
};

export const config = {
  path: ["/api/*", "/members", "/members/*"],
};
