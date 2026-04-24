import { env } from "bun"

export const USERNAME = env["SFTPGO_API_USERNAME"]!;
export const PASSWORD = env["SFTPGO_API_PASSWORD"]!;
export const BASE_URL = env["SFTPGO_API_BASE_URL"]!;

export const SERVER_HOST = env["SERVER_HOST"] || "127.0.0.1";
export const SERVER_PORT = env["SERVER_PORT"] || 3131;
export const PROD_ENV = env["NODE_ENV"] === 'production' ? true : false;