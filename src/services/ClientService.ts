import { AppDataSource } from "../config/database";
import { Client } from "../models/Client";
import { Message } from "../models/Message";
import { LessThan } from "typeorm";
import { ClientInput, MessageInput } from "../types";

const clientRepository = AppDataSource.getRepository(Client);
const messageRepository = AppDataSource.getRepository(Message);

export class ClientService {
  static async getAllClients() {
    return await clientRepository.find();
  }

  static async getClientDetails(clientId: number) {
    return await clientRepository.findOne({
      where: { id: clientId },
      relations: ["messages", "debts"],
    });
  }

  static async getClientsForFollowUp() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await clientRepository.find({
      where: {
        messages: {
          sentAt: LessThan(sevenDaysAgo),
        },
      },
      relations: ["messages"],
    });
  }

  static async createClient(data: ClientInput) {
    const { name, rut, messages, debts } = data;

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

    return await clientRepository.save(newClient);
  }

  static async addMessageToClient(clientId: number, messageData: MessageInput) {
    const client = await clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new Error("Client not found");
    }

    const message = new Message();
    message.text = messageData.text;
    message.sentAt = new Date(messageData.sentAt);
    message.role = messageData.role;
    message.client = client;

    return await messageRepository.save(message);
  }
}
