export interface ClientInput {
  name: string;
  rut: string;
  messages?: MessageInput[];
  debts?: DebtInput[];
}

export interface MessageInput {
  text: string;
  role: "client" | "agent";
  sentAt: Date | string;
}

export interface DebtInput {
  institution: string;
  amount: number;
  dueDate: Date | string;
}
