import { Readable } from 'stream';
import { HttpError } from '../utils/http_error';

export class FileReader {
    private _token?: string;

    constructor(
        private readonly _username: string,
        private readonly _password: string,
        private readonly _base_url: string
    ) { }

    private async init(): Promise<void> {
        try {
            if (this._token) return;

            const auth = Buffer.from(
                `${this._username}:${this._password}`, 
                "utf8"
            ).toString("base64");

            console.info("[Mofogasy]: 🚗 start authenication...");

            const response = await fetch(`${this._base_url}/user/token`, {
                method: "GET",
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });
            
            const data: Record<string, string> = (await response.json()) as Record<string, string>;

            if (!response.ok) {
                throw new HttpError(
                    response.status,
                    data.message ?? `[SFTPGo]: authentication failed: ${response.statusText}`
                );
            }
            
            const token = data["access_token"];
            if (!token) {
                throw new HttpError(500, "[SFTPGo]: authentication succeeded but no access token returned");
            }

            this._token = token;
            console.info("[Mofogasy]: ✅ authenticated successfully...");
        } catch (error) {
            if (error instanceof HttpError) throw error;
            if (error instanceof Error) {
                throw new HttpError(502, error.message, error);
            }
            throw new HttpError(502, String(error));

        }
    }

    async get(file_path: string): Promise<Readable> {
        try {
            await this.init();
            
            console.info("[Mofogasy]: 🚗 start streaming file...");

            const encodedPath = encodeURIComponent(file_path);

            const response = await fetch(`${this._base_url}/user/files?path=${encodedPath}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this._token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.error(`[SFTPGo]: file not found: ${file_path}...`);
                    throw new HttpError(404, `[SFTPGo]: file not found: ${file_path}`);
                }

                if (response.status === 401) {
                    console.error("[SFTPGo]: unauthorized...")
                    throw new HttpError(401, "[SFTPGo]: unauthorized");
                }

                if (response.status === 403) {
                    console.error("[SFTPGo]: forbidden...")
                    throw new HttpError(403, "[SFTPGo]: forbidden");
                }

                throw new HttpError(
                    response.status,
                    `[SFTPGo]: unable to read file: ${response.statusText}`
                );
            }

            if (!response.body) {
                console.error("[SFTPGo]: upstream response body is empty...");
                throw new HttpError(502, "[SFTPGo]: upstream response body is empty");
            }

            return Readable.fromWeb(
                response.body  as ReadableStream<Uint8Array>
            );
        } catch (error) { 
            if (error instanceof HttpError) throw error;
            if (error instanceof Error) {
                throw new HttpError(502, error.message, error);
            }
            throw new HttpError(502, String(error));
        }
    }
}