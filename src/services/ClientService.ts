import { AppDataSource } from "../config/database";
import { Client } from "../models/Client";
import { Message } from "../models/Message";
import { LessThan, Repository } from "typeorm";
import { ClientInput, DebtInput, MessageInput } from "../types";

const clientRepository: Repository<Client> =
  AppDataSource.getRepository(Client);
const messageRepository: Repository<Message> =
  AppDataSource.getRepository(Message);

export class ClientService {
  static async getAllClients(): Promise<Client[]> {
    return await clientRepository.find();
  }

  static async getClientDetails(clientId: number): Promise<Client | null> {
    return await clientRepository.findOne({
      where: { id: clientId },
      relations: ["messages", "debts"],
    });
  }

  static async getClientsForFollowUp(): Promise<Client[]> {
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

  static async createClient(data: ClientInput): Promise<Client> {
    const { name, rut, messages, debts } = data;

    const mappedMessages: MessageInput[] =
      messages?.map((msg) => ({
        ...msg,
        sentAt: new Date(msg.sentAt),
      })) || [];

    const mappedDebts: DebtInput[] =
      debts?.map((debt) => ({
        ...debt,
        dueDate: new Date(debt.dueDate),
      })) || [];

    const newClient: Client = clientRepository.create({
      name,
      rut,
      messages: mappedMessages,
      debts: mappedDebts,
    });

    return await clientRepository.save(newClient);
  }

  static async addMessageToClient(
    clientId: number,
    messageData: MessageInput
  ): Promise<Message> {
    const client = await clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new Error("Client not found");
    }

    const message: Message = new Message();
    message.text = messageData.text;
    message.sentAt = new Date(messageData.sentAt);
    message.role = messageData.role;
    message.client = client;

    return await messageRepository.save(message);
  }
}
