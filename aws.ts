import { load } from "@std/dotenv";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const env = await load();
const R2_ENDPOINT = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: env.REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID, 
    secretAccessKey: env.SECRET_ACCESS_KEY, 
  },
});

export default async function getImagesFromR2() {
  try {
    const command: ListObjectsV2Command = new ListObjectsV2Command({ Bucket: env.BUCKET });
    const response = await s3Client.send(command);

    if (response.Contents) {
      response.Contents.sort((a: { LastModified: string | number | Date; }, b: { LastModified: string | number | Date; }) => new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime());
    }

    return response;
    
  } catch(error) {
    console.log(error);
    return error;
  }
}

