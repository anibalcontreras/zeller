import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helloRoute from "./routes/helloRoute";
import clientRoutes from "./routes/clientRoutes";

const app = new Koa();
app.use(bodyParser());
app.use(clientRoutes.routes());
app.use(clientRoutes.allowedMethods());
app.use(helloRoute.routes());
app.use(helloRoute.allowedMethods());

export default app;
