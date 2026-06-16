import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({unique:true})
  email: string;
}
