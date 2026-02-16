"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limiter";

export type ScrapeResult = {
  success: boolean;
  url: string;
  markdown: string;
  chunks: number;
  error?: string;
};

function stripHtmlToText(html: string): string {
  let text = html;
  // Remove non-content blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  text = text.replace(/<head[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  // Add line breaks for block elements
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  // Remove lines that are just short noise (menu items, button labels)
  const lines = text.split("\n").filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 30;
  });
  return lines.join("\n").replace(/[ \t]+/g, " ").trim();
}

function chunkText(text: string, size: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length < size) {
      current += (current ? " " : "") + sentence;
    } else {
      if (current) chunks.push(current.trim());
      current = sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export async function scrapeWeb(input: string): Promise<ScrapeResult> {
  if (!input.trim()) {
    return { success: false, url: "", markdown: "", chunks: 0, error: "Empty input" };
  }

  try {
    checkRateLimit("global");
  } catch (err) {
    return {
      success: false,
      url: input,
      markdown: "",
      chunks: 0,
      error: err instanceof Error ? err.message : "Rate limited",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      url: input,
      markdown: "",
      chunks: 0,
      error: "GEMINI_API_KEY not set",
    };
  }

  const isUrl = /^https?:\/\/.+/.test(input.trim());

  let prompt: string;

  if (isUrl) {
    let html: string;
    try {
      const res = await fetch(input.trim(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FirstFamilyRAG/1.0)",
          Accept: "text/html,application/xhtml+xml,*/*",
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        return {
          success: false,
          url: input,
          markdown: "",
          chunks: 0,
          error: `Failed to fetch URL (HTTP ${res.status})`,
        };
      }
      html = await res.text();
    } catch (fetchErr) {
      return {
        success: false,
        url: input,
        markdown: "",
        chunks: 0,
        error:
          fetchErr instanceof Error
            ? `Fetch error: ${fetchErr.message}`
            : "Failed to fetch URL",
      };
    }

    const pageText = stripHtmlToText(html).slice(0, 80_000);
    prompt = `Below is the extracted TEXT content from the webpage ${input}. Write a well-organized business summary using this exact structure:

## Overview
One clear paragraph: what the company/page is about and who it's for.

## Key Services & Offerings
Bullet list of their main services or products mentioned on the page.

## Highlights & Details
Any notable facts: testimonials, stats, partnerships, awards, or unique selling points found in the text.

## Contact & Links
Any contact info, CTAs, or links found in the text. If none found, skip this section.

STRICT RULES:
- ONLY use information from the text below — do NOT add anything from your own knowledge
- NEVER describe HTML, CSS, technical structure, or how the site is built
- If a section has no relevant info, skip it entirely
- Keep it concise but detailed — every bullet should be informative
- Write in the same language as the page content

PAGE TEXT:
${pageText}`;
  } else {
    prompt = `Research the following query and return a detailed, well-structured markdown response:\n\n${input}\n\nCRITICAL: Return ONLY useful markdown content. Include specific names, addresses, details, and actionable information. Use tables and lists where appropriate. No meta-commentary. Be honest if you don't have enough information.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { temperature: 0.1 },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const markdown = result.response.text();
    if (!markdown || markdown.length < 20) {
      return {
        success: false,
        url: input,
        markdown: "",
        chunks: 0,
        error: "Gemini returned no usable content",
      };
    }

    const chunks = chunkText(markdown, 1000);

    return {
      success: true,
      url: input,
      markdown,
      chunks: chunks.length,
    };
  } catch (err) {
    return {
      success: false,
      url: input,
      markdown: "",
      chunks: 0,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}
