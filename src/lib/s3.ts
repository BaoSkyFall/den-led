"use server";
import { env } from "@/env.mjs";
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

// Lazy — only instantiated when S3 vars are present to avoid build-time crash
let _s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!env.NEXT_PUBLIC_S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new Error("S3 environment variables are not configured.");
  }
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: env.NEXT_PUBLIC_S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return _s3Client;
}

export const bufferToFile = (buffer: Buffer) =>
  `data:image/webp;base64,${buffer.toString("base64")}`;

export const uploadImage = async (params: PutObjectCommandInput) => {
  const putObject = new PutObjectCommand(params);
  const s3Response = await getS3Client().send(putObject);
  return s3Response;
};
