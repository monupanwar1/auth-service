import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    // check
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      const err = createHttpError(400, "Email already exists");
      throw err;
    }

    // hash the password

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "failed to store in the database");
      throw error;
    }
  }
}
