import { APIGatewayProxyEventHeaders } from "aws-lambda";
import { PlaidApi } from "plaid";
import { jwtVerify, importJWK, JWTVerifyResult } from "jose";
import * as jwt_decode from "jwt-decode";
import { Sha256 } from "@aws-crypto/sha256-js";
import safeCompare from "safe-compare";
import { sha224, sha256 } from "js-sha256";

const KEY_CACHE = new Map();

export async function verifyWebhook(plaidClient: PlaidApi, 
    headers: APIGatewayProxyEventHeaders, body: string) {

    const signedJwt = headers["plaid-verification"]!;
    // Extract the JWT header
    const decodedTokenHeader = jwt_decode.jwtDecode(signedJwt, { header: true });
    // Extract the kid value from the header
    const currentKeyID = decodedTokenHeader.kid;

    //If key not in cache, update the key cache
    if (!KEY_CACHE.has(currentKeyID)) {
        const keyIDsToUpdate = [];
        KEY_CACHE.forEach((keyID, key) => {
        // We will also want to refresh any not-yet-expired keys
        if (key.expired_at == null) {
            keyIDsToUpdate.push(keyID);
        }
        });
        keyIDsToUpdate.push(currentKeyID);
        for (const keyID of keyIDsToUpdate) {
            try {
                const response = await plaidClient.webhookVerificationKeyGet({
                    key_id: keyID!,
                });
                const key = response.data.key;
                KEY_CACHE.set(keyID, key);
                console.log(`Plaid webhook verification. Fetched keyID ${keyID} with request_id ${response.data.request_id}`);
            } catch (err: any) {
                // decide how you want to handle unexpected API errors,
                // e.g. retry later
                console.log(err);
                return false;
            }
        }
    }
    // If the key ID is not in the cache, the key ID may be invalid.
    if (!KEY_CACHE.has(currentKeyID)) {
        return false;
    }
    // Fetch the current key from the cache.
    const key = KEY_CACHE.get(currentKeyID);
    // Reject expired keys.
    if (key.expired_at != null) {
        return false;
    }

    // Validate the signature
    let result: JWTVerifyResult;
    try {
        const keyLike = await importJWK(key);
        // This will throw an error if verification fails
        result = await jwtVerify(signedJwt, keyLike, {
            maxTokenAge: '5 min',
        });
    } catch (err) {
        console.log(err);
        return false;
    }

    const bodyHash = sha256(body);
    return safeCompare(bodyHash, result.payload.request_body_sha256 as string);
}