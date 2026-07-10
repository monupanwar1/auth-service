import bcrypt from "bcryptjs";

export class CredentialService {
  async comparePassword(userPassword: string, passwordHash: string) {
    return bcrypt.compare(userPassword, passwordHash);
  }
}
