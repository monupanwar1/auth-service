import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "refreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ManyToMany(() => User)
  user: User;

  @UpdateDateColumn()
  updateAt: number;

  @CreateDateColumn()
  createAt: number;
}
