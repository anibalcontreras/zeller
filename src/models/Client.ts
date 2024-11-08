import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { Debt } from "./Debt";

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  rut!: string;

  @OneToMany(() => Message, (message) => message.client, { cascade: true })
  messages!: Message[];

  @OneToMany(() => Debt, (debt) => debt.client, { cascade: true })
  debts!: Debt[];
}
