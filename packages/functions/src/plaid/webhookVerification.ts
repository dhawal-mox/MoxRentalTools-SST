// import { APIGatewayProxyEventHeaders } from "aws-lambda";
// import NodeCache from "node-cache";
// import { JWKPublicKey, PlaidApi } from "plaid";
// import { RequestBodyHashJwtPayload, jwtDecode } from "jwt-decode";
// import * as JWT from "jose";
// import safeCompare from "safe-compare";

// import sha256 from 'js-sha256';

// declare module 'jwt-decode' {
//     export interface RequestBodyHashJwtPayload extends JwtPayload {
//         request_body_hash: string,
//     }
// }

// export async function verifyWebhook(body: string | null, headers: APIGatewayProxyEventHeaders, KEY_CACHE: NodeCache, plaidClient: PlaidApi): Promise<Boolean> {
//     const signedJwt = headers['plaid-verification']!;
//     const decodedToken: RequestBodyHashJwtPayload = jwtDecode(signedJwt);
//     const decodedTokenHeader = jwtDecode(signedJwt, { header: true });
//     const currentKeyID = decodedTokenHeader.kid!;

//     //If key not in cache, update the key cache
//     if (!KEY_CACHE.has(currentKeyID)) {
//         const keyIDsToUpdate = [];
//         KEY_CACHE.keys().forEach((keyID) => {
//             const key: JWKPublicKey = KEY_CACHE.take(keyID)!;
//             // We will also want to refresh any not-yet expired keys
//             if(key.expired_at == null) {
//                 keyIDsToUpdate.push(keyID);
//             } else {
//                 KEY_CACHE.set(keyID, key);
//             }
//         })
//         keyIDsToUpdate.push(currentKeyID);

//         for (const keyID of keyIDsToUpdate) {
//             try {
//                 const response = await plaidClient.webhookVerificationKeyGet({
//                     key_id: keyID,
//                 });
//                 const key = response.data.key;
//                 KEY_CACHE.set(keyID, key);
//             } catch (err) {
//                 console.log(`Plaid Webhook Verification failed for keyID: ${keyID} with error: ${err}`);
//                 return false;
//             }
//         }
//     }

//     // If the keyID is not in the cache, the key may be invalid.
//     if(!KEY_CACHE.has(currentKeyID)) {
//         return false;
//     }

//     // Fetch the current key from the cache.
//     const key: JWKPublicKey = KEY_CACHE.get(currentKeyID)!;

//     // Reject expired keys.
//     if (key.expired_at != null) {
//         return false;
//     }

//     // Validate the signature and iat
//     try {
//         const jwkKey: JWT.JWK = {
//             ...key,
//         }
//         const keyLike = await JWT.importJWK(jwkKey);
//         // This will throw an error if verification fails
//         const { payload } = await JWT.jwtVerify(signedJwt, keyLike, {
//             maxTokenAge: '5 min',
//         });
//     } catch (err) {
//         console.log(`Plaid Webhook Verification failed to verify signature and iat for keyID: ${currentKeyID} with error: ${err}`);
//         return false;
//     }

//     // Compare hashes.
//     const bodyHash = sha256.sha256(body!);
//     const claimedBodyHash = decodedToken.request_body_hash;
//     return safeCompare(bodyHash, claimedBodyHash);
// }