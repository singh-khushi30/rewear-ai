import { createApp } from "../../../../backend/dist/app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
  maxDuration: 60,
};

const app = createApp();

function withExpressApiPath(req) {
  const current = req.url ?? "/";
  const pathname = current.split("?")[0] ?? "/";
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return;
  }

  req.url = `/api${current.startsWith("/") ? current : `/${current}`}`;
}

export default function handler(req, res) {
  withExpressApiPath(req);
  app(req, res);
}
