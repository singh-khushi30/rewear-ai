import "./lib/env.js";
import { createApp } from "./app.js";

const app = createApp();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

app.listen(port, () => {
  console.log(`rewear-api listening on http://localhost:${port}`);
});
