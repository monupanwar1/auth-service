import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";

export class TokenService {
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }

    //accessToken

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
      issuer: "auth-service",
    });

    return accessToken;
  }
}
