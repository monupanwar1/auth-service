import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../constants";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({})
  password: string;

  @Column({ default: Roles.Customer })
  role: string;
}
