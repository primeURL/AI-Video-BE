import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_API, // Your R2 endpoint
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });


  export const uploadToR2 = async (stream: any, key : any, contentType : any) => {
    console.log('inside r2 upload')
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.BUCKET_NAME, // Replace with your R2 bucket
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
    });
  
    return upload.done(); // Returns a Promise
  };