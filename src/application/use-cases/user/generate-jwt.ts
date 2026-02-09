import { sign } from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import { env } from "@/infra/env";
import { UniqueEntityId } from "@/core/entities";

export class GenerateJWTUseCase {
  async execute(): Promise<string> {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    // I pass the name because I won't create a user repository for this portfolio project
    const payload = {
      sub: new UniqueEntityId().toString(),
      iss: "media-vault-api",
      iat: Date.now(),
      email: email,
      name: `${firstName} ${lastName}`
    };

    const token = sign(payload, env.JWT_SECRET, { expiresIn: "1h" });

    return token;
  }
}
