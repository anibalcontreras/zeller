import Router from "koa-router";
import { Context } from "koa";

const router = new Router();

router.get("/", async (ctx: Context) => {
  ctx.body = "Hello, World!";
});

export default router;
