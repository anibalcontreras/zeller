import Router from "koa-router";
import { ClientController } from "../controllers/ClientController";

const router = new Router();

router.get("/clients", ClientController.getAllClients);
router.get("/clients/:id", ClientController.getClientDetails);
router.get("/clients-to-do-follow-up", ClientController.getClientsForFollowUp);
router.post("/clients", ClientController.createClient);
router.post("/clients/:id/message", ClientController.addMessageToClient);
router.get(
  "/clients/:id/generateMessage",
  ClientController.generateMessageForClient
);

export default router;
