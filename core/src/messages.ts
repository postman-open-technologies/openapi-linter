import { URL } from "url";

export type Response = {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
};

export type Request = {
  method: string;
  url: URL;
  headers: { [key: string]: string };
  body: string;
};
