// Code for running on Vercel. Not part of Conflict server or Conflict build scripts.


const {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} = require("discord-interactions");

const { dispatch } = require('../core/dispatch.js');

module.exports = async (request, response) => {
    if (request.method === "POST") {
        const signature = request.headers["x-signature-ed25519"];
        const timestamp = request.headers["x-signature-timestamp"];
        const rawBody = JSON.stringify(request.body);

        const isValidRequest = verifyKey(
            rawBody,
            signature,
            timestamp,
            process.env.PUBLIC_KEY
        );

        if (!isValidRequest) {
            console.error("Invalid Request");
            return response.status(401).send({ error: "Bad request signature" });
        }

        const message = request.body;

        if (message.type === InteractionType.PING) {
            console.log("Handling Discord ping request");
            response.send({
                type: InteractionResponseType.PONG,
            });

        } else {
            const output = await dispatch(message);
            if (output && output.___status) {
                response.status(output.status).send(output.payload);
            } else {
                response.status(200).send(output);
            }
        }
    } else {
        response.status(405).send({ error: "Method not allowed" });
    }
};