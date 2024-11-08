import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1731073945476 implements MigrationInterface {
    name = 'InitialMigration1731073945476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "role" character varying NOT NULL, "sentAt" TIMESTAMP NOT NULL, "clientId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "debt" ("id" SERIAL NOT NULL, "institution" character varying NOT NULL, "amount" integer NOT NULL, "dueDate" TIMESTAMP NOT NULL, "clientId" integer, CONSTRAINT "PK_f0904ec85a9c8792dded33608a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "rut" character varying NOT NULL, CONSTRAINT "UQ_c585d4282f16dc1b113b3fa0515" UNIQUE ("rut"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f7273f274d3d6ae9c046ab1990b" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "debt" ADD CONSTRAINT "FK_23bd72b26d273637cfbfa286379" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "debt" DROP CONSTRAINT "FK_23bd72b26d273637cfbfa286379"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f7273f274d3d6ae9c046ab1990b"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "debt"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
