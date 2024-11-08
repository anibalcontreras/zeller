import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Client } from "./Client";

@Entity()
export class Debt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  institution!: string;

  @Column("int")
  amount!: number;

  @Column({ type: "timestamp" })
  dueDate!: Date;

  @ManyToOne(() => Client, (client) => client.debts, { onDelete: "CASCADE" })
  client!: Client;
}
