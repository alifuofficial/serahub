interface BlockData {
  type: string;
  data: Record<string, unknown>;
  id?: string;
}

interface EditorJSOutput {
  time: number;
  blocks: BlockData[];
  version: string;
}

function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(extractText).join(" ");
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    // Handle Editor.js list item object format { content: "...", items: [] }
    if (obj.content && typeof obj.content === "string") return obj.content;
    if (obj.text && typeof obj.text === "string") return obj.text;
    return Object.values(obj).map(extractText).join(" ");
  }
  return "";
}

export function getPlainText(jsonString: string): string {
  try {
    const parsed: EditorJSOutput = JSON.parse(jsonString);
    return parsed.blocks.map((b) => extractText(b.data)).join("\n");
  } catch {
    return jsonString;
  }
}

export function isEditorJSData(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed.blocks);
  } catch {
    return false;
  }
}

export default function EditorJSRenderer({ content }: { content: string }) {
  if (!content) return null;

  if (!isEditorJSData(content)) {
    return (
      <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed overflow-hidden break-words">
        {content.split("\n").map((line, i) => (
          <p key={i} className="mb-4">{line}</p>
        ))}
      </div>
    );
  }

  let parsed: EditorJSOutput;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  return (
    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed overflow-hidden break-words
      [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:tracking-tight [&_h1]:mb-4 [&_h1]:mt-8
      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:tracking-tight [&_h2]:mb-3 [&_h2]:mt-6
      [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-5
      [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:leading-relaxed
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ul]:text-slate-600
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_ol]:text-slate-600
      [&_li]:text-slate-600 [&_li]:leading-relaxed
      [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:text-base
      [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-sm
      [&_code]:bg-slate-100 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
      [&_hr]:border-0 [&_hr]:my-8 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-slate-200 [&_hr]:to-transparent
      [&_iframe]:rounded-xl [&_iframe]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video
      [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover
      [&_strong]:text-slate-900 [&_strong]:font-semibold
      [&_em]:text-slate-600
    ">
      {parsed.blocks.map((block, i) => {
        const d = block.data;

        switch (block.type) {
          case "header": {
            const text = (d.text as string) || "";
            const level = (d.level as number) || 2;
            if (level === 1) return <h1 key={i} dangerouslySetInnerHTML={{ __html: text }} />;
            if (level === 3) return <h3 key={i} dangerouslySetInnerHTML={{ __html: text }} />;
            return <h2 key={i} dangerouslySetInnerHTML={{ __html: text }} />;
          }
          case "paragraph":
            return <p key={i} dangerouslySetInnerHTML={{ __html: (d.text as string) || "" }} />;
          case "list": {
            const items = (d.items as (string | { content: string })[]) || [];
            const style = (d.style as string) || "unordered";
            const renderItem = (item: string | { content: string }) => {
              const html = typeof item === "string" ? item : item.content;
              return html;
            };

            if (style === "ordered") {
              return <ol key={i}>{items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: renderItem(item) }} />)}</ol>;
            }
            return <ul key={i}>{items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: renderItem(item) }} />)}</ul>;
          }
          case "quote": {
            const text = (d.text as string) || "";
            const caption = (d.caption as string) || "";
            return (
              <blockquote key={i}>
                <p dangerouslySetInnerHTML={{ __html: text }} />
                {caption && <footer className="text-sm text-slate-400 mt-1">— {caption}</footer>}
              </blockquote>
            );
          }
          case "code": {
            const code = (d.code as string) || "";
            return <pre key={i}><code>{code}</code></pre>;
          }
          case "delimiter":
            return <hr key={i} />;
          case "embed": {
            const embed = d.embed as string | undefined;
            const width = (d.width as number) || undefined;
            const height = (d.height as number) || undefined;
            if (d.service === "youtube" && embed) {
              return (
                <div key={i} className="aspect-video my-4 rounded-xl overflow-hidden">
                  <iframe src={embed} width={width || "100%"} height={height || "100%"} className="w-full h-full" allowFullScreen />
                </div>
              );
            }
            if (embed) {
              return <div key={i} className="my-4 rounded-xl overflow-hidden"><iframe src={embed} width={width || "100%"} height={height || 300} className="w-full rounded-xl" allowFullScreen /></div>;
            }
            return null;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}