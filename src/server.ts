import { serve } from 'bun';
import { PROD_ENV, SERVER_HOST, SERVER_PORT } from './config/environment';
import { app } from './app';
import { HttpError } from './utils/http_error';

const server = serve({
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    development: PROD_ENV,
    reusePort: true,

    async fetch(req) {
        const path = new URL(req.url).pathname;
        if (path === '/') {
            return new Response("Tongasoa eto amin'ny Mofogasy 😄...");
        }

        try {
            const stream = await app(path);
            return new Response(stream, {
                headers: {
                    "Content-Type": "application/x-ndjson; charset=utf-8",
                    "Cache-Control": "no-cache"
                }
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return Response.json({
                    error: error.message,
                    status: error.status,
                }, {
                    status: error.status,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });
            }

            console.error("Unhandled error:", error);
            return Response.json({
                    error: "Internal Server Error",
                    status: 500,
                }, {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
        }
    }
});

console.log(`[Mofogasy]: 🚀 Listening on ${server.url} ...`);
