// src/app.ts
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helloRoute from "./routes/helloRoute";

const app = new Koa();
app.use(bodyParser());
app.use(helloRoute.routes());
app.use(helloRoute.allowedMethods());

export default app;
