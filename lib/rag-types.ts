import { z } from "zod";

export const chatRoleSchema = z.enum(["user", "assistant", "system"]);

export type ChatRole = z.infer<typeof chatRoleSchema>;

export const chatMessageSchema = z.object({
  id: z.string().optional(),
  role: chatRoleSchema,
  content: z.string(),
  createdAt: z.coerce.date().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const sourceChunkSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  uri: z.string().url().optional(),
  documentType: z.string().optional(),
  page: z.number().int().optional(),
  score: z.number().min(0).max(1),
  snippet: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type SourceChunk = z.infer<typeof sourceChunkSchema>;

export const chatRequestSchema = z.object({
  query: z.string().min(1),
  conversationId: z.string().optional(),
  filters: z.record(z.any()).optional(),
  context: z
    .object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const sseTokenEventSchema = z.object({
  type: z.literal("token"),
  token: z.string(),
  messageId: z.string().optional(),
});

export const sseFinalEventSchema = z.object({
  type: z.literal("final"),
  messageId: z.string().optional(),
  content: z.string(),
  sources: z.array(sourceChunkSchema).optional(),
});

export const sseSourcesEventSchema = z.object({
  type: z.literal("sources"),
  messageId: z.string().optional(),
  sources: z.array(sourceChunkSchema),
});

export const sseErrorEventSchema = z.object({
  type: z.literal("error"),
  messageId: z.string().optional(),
  error: z.string(),
});

export const sseEventSchema = z.discriminatedUnion("type", [
  sseTokenEventSchema,
  sseFinalEventSchema,
  sseSourcesEventSchema,
  sseErrorEventSchema,
]);

export type SseEvent = z.infer<typeof sseEventSchema>;

export const metricsSummarySchema = z.object({
  totalDocs: z.number().nonnegative(),
  totalQueries: z.number().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  lastIndexedAt: z.string().optional(),
});

export type MetricsSummary = z.infer<typeof metricsSummarySchema>;

export const metricsTimeseriesPointSchema = z.object({
  date: z.string(),
  queries: z.number().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  tokens: z.number().nonnegative().optional(),
});

export type MetricsTimeseriesPoint = z.infer<
  typeof metricsTimeseriesPointSchema
>;

export const metricsResponseSchema = z.object({
  summary: metricsSummarySchema,
  timeseries: z.array(metricsTimeseriesPointSchema),
});

export type MetricsResponse = z.infer<typeof metricsResponseSchema>;

export const retrievalItemSchema = z.object({
  id: z.string(),
  score: z.number().min(0).max(1),
  documentTitle: z.string().optional(),
  documentUri: z.string().url().optional(),
  snippet: z.string(),
  collection: z.string().optional(),
  createdAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RetrievalItem = z.infer<typeof retrievalItemSchema>;

export const retrievalResponseSchema = z.object({
  items: z.array(retrievalItemSchema),
});

export type RetrievalResponse = z.infer<typeof retrievalResponseSchema>;

export const uploadResultSchema = z.object({
  totalFiles: z.number().int().nonnegative(),
  processedFiles: z.number().int().nonnegative(),
  failedFiles: z.number().int().nonnegative(),
  details: z
    .array(
      z.object({
        name: z.string(),
        status: z.enum(["processed", "failed"]),
        error: z.string().optional(),
      }),
    )
    .optional(),
});

export type UploadResult = z.infer<typeof uploadResultSchema>;

