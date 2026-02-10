import { GenerateJWTUseCase } from "@/application/use-cases/user/generate-jwt";

describe("GenereateJWTUseCase", () => {
  let sut: GenerateJWTUseCase;

  beforeEach(() => {
    sut = new GenerateJWTUseCase();
  });

  describe("Success scenarios", () => {
    it("should generate JWT for valid user", async () => {
      const token = await sut.execute();
      expect(token).toBeTruthy();
    });
  });
});
