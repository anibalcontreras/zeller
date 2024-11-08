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

    const { name, debts, messages } = client;
    const hasDebts = debts && debts.length > 0;
    const recentMessages = messages
      .slice(-3)
      .map((msg) => `[${msg.role}]: ${msg.text}`)
      .join("\n");

    const prompt = `
    Actúa como un asesor de ventas de autos nuevos. 
    Nombre del asesor: Carlos. 

    Contexto de conversación con el cliente ${name}:
    Últimos mensajes del cliente:
    ${recentMessages || "El cliente no ha iniciado la conversación aún."}

    Detalles del cliente:
    - Tiene deudas morosas: ${hasDebts ? "Sí" : "No"}

    Detalles de la empresa:
    - Ofrecemos financiamiento automotriz a clientes sin deudas morosas.
    - Marcas y modelos disponibles: Toyota Corolla, Honda Civic, Mazda 3, Ford Focus.
    - Sucursales disponibles:
      - Santiago: Av. Libertador 100, horario: 9:00 - 18:00.
      - Viña del Mar: Calle Quinta 255, horario: 9:00 - 17:00.
      - Concepción: Calle Principal 123, horario: 10:00 - 17:00.

    Instrucciones:
    - Si el cliente tiene deudas morosas, infórmale que estás aquí para ayudarle a regularizar su situación 
    y explícale que, al hacerlo,podrá optar a opciones de financiamiento en el auto que más le guste.
    - Si el cliente no tiene deudas, ofrécele información detallada sobre el financiamiento para los modelos 
    disponibles y agradecele por ser un cliente leal.

    Ejemplo de respuesta sin deudas: 
    "Hola ${name}, espero que estés bien. Te comparto nuestros modelos disponibles: Toyota Corolla, Honda Civic, Mazda 3, Ford Focus. 
    Además, contamos con financiamiento para estos modelos. 
    ¿Te gustaría agendar una visita a una de nuestras sucursales en Santiago, Viña del Mar o Concepción?"

    Ejemplo de respuesta con deudas: 
    "Hola ${name}, gracias por tu interés. Tenemos disponibles autos nuevos como el Toyota Corolla, Honda Civic y Ford Focus, 
    ideales para diferentes presupuestos. Veo que tienes algunas deudas. Estoy aquí para ayudarte a regularizar tu situación 
    y, al hacerlo, podrías tener acceso a financiamiento. ¡Hablemos y busquemos una solución!"

    Responde manteniendo el contexto de la conversación anterior.
    `;

    console.log("Prompt", prompt);

    try {
      const response = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4o-mini",
        max_tokens: 150,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      });

      ctx.body = { text: response.choices[0].message.content?.trim() };
    } catch (error) {
      console.error("Error generating AI message:", error);
      ctx.status = 500;
      ctx.body = { error: "Error generating message" };
    }
  }
}
