import handler from "@mox-rental-tools-vanilla/core/handler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { client } from "@mox-rental-tools-vanilla/core/s3client";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body || "");
    const user = data.user;
    const documentId = data.documentId;
    const getDocumentCommand = new GetObjectCommand({
        Bucket: Bucket.Uploads.bucketName,
        Key: documentId,
    });
    const url = await getSignedUrl(new S3Client({}), getDocumentCommand, {expiresIn: 120});
    return JSON.stringify({documentUrl: url});
});