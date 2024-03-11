import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


const client = new S3Client();

export default {
    put: (params: PutObjectCommand) => client.send(params),
}