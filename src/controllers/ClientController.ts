// src/controllers/ClientController.ts
import { Context } from "koa";
import { AppDataSource } from "../config/database";
import { Client } from "../models/Client";
import { Message } from "../models/Message";
import { Debt } from "../models/Debt";
import { LessThan } from "typeorm";
import { ClientInput, MessageInput } from "../types";

const clientRepository = AppDataSource.getRepository(Client);

export class ClientController {
  static async getAllClients(ctx: Context) {
    const clients = await clientRepository.find();
    ctx.body = clients;
  }

  static async getClientDetails(ctx: Context) {
    const client = await clientRepository.findOne({
      where: { id: Number(ctx.params.id) },
      relations: ["messages", "debts"],
    });
    if (!client) {
      ctx.status = 404;
      ctx.body = { error: "Client not found" };
      return;
    }
    ctx.body = client;
  }

  static async getClientsForFollowUp(ctx: Context) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clients = await clientRepository.find({
      where: {
        messages: {
          sentAt: LessThan(sevenDaysAgo),
        },
      },
      relations: ["messages"],
    });

    ctx.body = clients;
  }

  static async createClient(ctx: Context) {
    const { name, rut, messages, debts } = ctx.request.body as ClientInput;

    const mappedMessages = messages?.map((msg) => ({
      ...msg,
      sentAt: new Date(msg.sentAt),
    }));

    const mappedDebts = debts?.map((debt) => ({
      ...debt,
      dueDate: new Date(debt.dueDate),
    }));

    const newClient = clientRepository.create({
      name,
      rut,
      messages: mappedMessages,
      debts: mappedDebts,
    });
    await clientRepository.save(newClient);
    ctx.status = 201;
    ctx.body = newClient;
  }

  static async addMessageToClient(ctx: Context) {
    const { text, sentAt, role } = ctx.request.body as MessageInput;
    const client = await clientRepository.findOneBy({
      id: Number(ctx.params.id),
    });
    if (!client) {
      ctx.status = 404;
      ctx.body = { error: "Client not found" };
      return;
    }
    const message = new Message();
    message.text = text;
    message.sentAt = new Date(sentAt);
    message.role = role;
    message.client = client;
    await AppDataSource.getRepository(Message).save(message);
    ctx.status = 201;
    ctx.body = message;
  }

  static async generateMessageForClient(ctx: Context) {
    // AI
  }
}
