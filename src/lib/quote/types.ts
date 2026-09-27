import type { QuoteRequest } from "./schema";

export type Attachment = { filename: string; contentType: string; size: number; content: Buffer };

export type QuoteSubmission = {
  kind: "quote";
  reference: string;
  submittedAt: string;
  data: QuoteRequest;
  productLabel: string;
  attachments: Attachment[];
};

export type ContactSubmission = {
  kind: "contact";
  reference: string;
  submittedAt: string;
  data: { name: string; email: string; mobile: string; company: string; topic: string; message: string };
  attachments: [];
};

export type Submission = QuoteSubmission | ContactSubmission;

/**
 * A delivery adapter sends a submission somewhere durable (email, CRM,
 * database, webhook). Add a new provider by implementing this interface and
 * registering it in ./adapters/index.ts.
 */
export interface DeliveryAdapter {
  name: string;
  deliver(submission: Submission): Promise<void>;
}
