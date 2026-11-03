import crypto from "crypto";
import fs from "fs";
import path from "path";

export function encryptFile(
  filePath: string,
  roleKey: string,
  targetFileName: string,
): string {
  const fileContent = fs.readFileSync(filePath);

  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(roleKey).digest();

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(fileContent), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, authTag, encrypted]);

  const dir = path.dirname(filePath);
  const outputPath = path.join(dir, targetFileName);

  fs.writeFileSync(outputPath, payload);
  fs.unlinkSync(filePath); // Remove o .js original

  const mapPath = `${filePath}.map`;
  if (fs.existsSync(mapPath)) {
    fs.unlinkSync(mapPath); // Remove o .map de depuração
  }

  return outputPath;
}
