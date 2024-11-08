import { Context } from "koa";
import { ClientService } from "../services/ClientService";
import { ClientInput, MessageInput } from "../types";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class ClientController {
  static async getAllClients(ctx: Context) {
    const clients = await ClientService.getAllClients();
    ctx.body = clients;
  }

  static async getClientDetails(ctx: Context) {
    const client = await ClientService.getClientDetails(Number(ctx.params.id));
    if (!client) {
      ctx.status = 404;
      ctx.body = { error: "Client not found" };
      return;
    }
    ctx.body = client;
  }

  static async getClientsForFollowUp(ctx: Context) {
    const clients = await ClientService.getClientsForFollowUp();
    ctx.body = clients;
  }

  static async createClient(ctx: Context) {
    const data = ctx.request.body as ClientInput;
    const newClient = await ClientService.createClient(data);
    ctx.status = 201;
    ctx.body = newClient;
  }

  static async addMessageToClient(ctx: Context) {
    const data = ctx.request.body as MessageInput;
    try {
      const message = await ClientService.addMessageToClient(
        Number(ctx.params.id),
        data
      );
      ctx.status = 201;
      ctx.body = message;
    } catch (error) {
      const err = error as Error;
      ctx.status = 404;
      ctx.body = { error: err.message };
    }
  }

  static async generateMessageForClient(ctx: Context) {
    const clientId = Number(ctx.params.id);
    const client = await ClientService.getClientDetails(clientId);

    if (!client) {
      ctx.status = 404;
      ctx.body = { error: "Client not found" };
      return;
    }

    try {
      const generatedMessage = await ClientService.generateMessage(client);
      ctx.body = { text: generatedMessage };
    } catch (error) {
      const err = error as Error;
      ctx.status = 500;
      ctx.body = { error: err.message };
    }
  }
}
