import { AppDataSource } from "../config/database";
import { Client } from "../models/Client";
import { Message } from "../models/Message";
import { Repository } from "typeorm";
import { ClientInput, DebtInput, MessageInput } from "../types";
import { openai } from "../config/openai";
import { generateMessagePrompt } from "../prompts/generateMessagePrompt";
import { validateAndSanitizeRut } from "../utils/validation";

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

  static async getClientsForFollowUp(): Promise<Partial<Client>[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clients = await clientRepository
      .createQueryBuilder("client")
      .leftJoin("client.messages", "message")
      .groupBy("client.id")
      .having("MAX(message.sentAt) < :sevenDaysAgo", { sevenDaysAgo })
      .select(["client.id AS id", "client.name AS name", "client.rut AS rut"])
      .getRawMany();

    return clients;
  }

  static async createClient(data: ClientInput): Promise<Client> {
    const { name, rut, messages, debts } = data;

    const validRut = validateAndSanitizeRut(rut);
    if (!validRut) {
      throw new Error("Invalid RUT");
    }

    const existingClient = await clientRepository.findOneBy({ rut: validRut });
    if (existingClient) {
      const error = new Error("A client with this RUT already exists");
      error.name = "DuplicateRutError";
      throw error;
    }

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
      rut: validRut,
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

  static async generateMessage(client: Client) {
    const { id, name, debts, messages } = client;
    const hasDebts = debts && debts.length > 0;
    const recentMessages = messages
      .slice(-3)
      .map((msg) => `[${msg.role}]: ${msg.text}`)
      .join("\n");

    const clientsForFollowUp = await ClientService.getClientsForFollowUp();
    const followUpClientIds = new Set(clientsForFollowUp.map((c) => c.id));
    const requiresFollowUp = followUpClientIds.has(id);

    const prompt = generateMessagePrompt(
      name,
      hasDebts,
      recentMessages,
      requiresFollowUp
    );

    try {
      const response = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4o-mini",
        max_tokens: 250,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      });

      return response.choices[0].message?.content?.trim();
    } catch (error) {
      console.error("Error generating AI message:", error);
      throw new Error("Error generating message");
    }
  }
}
