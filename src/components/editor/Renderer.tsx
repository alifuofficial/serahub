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

interface TipTapContent {
  type: string;
  text?: string;
  content?: TipTapContent[];
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface TipTapOutput {
  type: "doc";
  content: TipTapContent[];
}

function extractEditorJSText(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(extractEditorJSText).join(" ");
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.content && typeof obj.content === "string") return obj.content;
    if (obj.text && typeof obj.text === "string") return obj.text;
    return Object.values(obj).map(extractEditorJSText).join(" ");
  }
  return "";
}

function extractTipTapText(node: TipTapContent): string {
  if (node.type === "text" && node.text) return node.text;
  if (node.content) return node.content.map(extractTipTapText).join(" ");
  return "";
}

export function getPlainText(jsonString: string): string {
  if (!jsonString) return "";
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check if TipTap
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return (parsed as TipTapOutput).content.map(extractTipTapText).join("\n");
    }
    
    // Check if Editor.js
    if (Array.isArray(parsed.blocks)) {
      return (parsed as EditorJSOutput).blocks.map((b) => extractEditorJSText(b.data)).join("\n");
    }
    
    return jsonString;
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

export function isTipTapData(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

export default function Renderer({ content }: { content: string }) {
  if (!content) return null;

  const isTipTap = isTipTapData(content);
  const isEditorJS = !isTipTap && isEditorJSData(content);

  if (!isTipTap && !isEditorJS) {
    return (
      <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed overflow-hidden break-words">
        {content.split("\n").map((line, i) => (
          <p key={i} className="mb-4">{line}</p>
        ))}
      </div>
    );
  }

  const baseStyles = "prose prose-slate max-w-none text-slate-600 leading-relaxed overflow-hidden break-words \
    [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:tracking-tight [&_h1]:mb-4 [&_h1]:mt-8 \
    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:tracking-tight [&_h2]:mb-3 [&_h2]:mt-6 \
    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-5 \
    [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:leading-relaxed \
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ul]:text-slate-600 \
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_ol]:text-slate-600 \
    [&_li]:text-slate-600 [&_li]:leading-relaxed \
    [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:text-base \
    [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-sm \
    [&_code]:bg-slate-100 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono \
    [&_hr]:border-0 [&_hr]:my-8 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-slate-200 [&_hr]:to-transparent \
    [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover \
    [&_strong]:text-slate-900 [&_strong]:font-semibold";

  if (isTipTap) {
    const parsed: TipTapOutput = JSON.parse(content);
    
    const renderNode = (node: TipTapContent, idx: number): React.ReactNode => {
      switch (node.type) {
        case "heading": {
          const level = node.attrs?.level || 1;
          const Tag = `h${level}` as any;
          return <Tag key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</Tag>;
        }
        case "paragraph":
          return <p key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</p>;
        case "text": {
          let text: React.ReactNode = node.text;
          if (node.marks) {
            node.marks.forEach(mark => {
              if (mark.type === "bold") text = <strong key={idx}>{text}</strong>;
              if (mark.type === "italic") text = <em key={idx}>{text}</em>;
              if (mark.type === "underline") text = <u key={idx}>{text}</u>;
              if (mark.type === "link") text = <a key={idx} href={mark.attrs?.href} target="_blank" rel="noopener noreferrer">{text}</a>;
            });
          }
          return text;
        }
        case "bulletList":
          return <ul key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</ul>;
        case "orderedList":
          return <ol key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</ol>;
        case "listItem":
          return <li key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</li>;
        case "blockquote":
          return <blockquote key={idx}>{node.content?.map((c, i) => renderNode(c, i))}</blockquote>;
        case "horizontalRule":
          return <hr key={idx} />;
        case "image":
          return <img key={idx} src={node.attrs?.src} alt={node.attrs?.alt} className="rounded-xl my-6" />;
        default:
          return null;
      }
    };

    return (
      <div className={baseStyles}>
        {parsed.content.map((node, i) => renderNode(node, i))}
      </div>
    );
  }

  // Fallback to Editor.js rendering (existing logic)
  const parsedJS: EditorJSOutput = JSON.parse(content);
  return (
    <div className={baseStyles}>
      {parsedJS.blocks.map((block, i) => {
        const d = block.data;
        switch (block.type) {
          case "header": {
            const text = (d.text as string) || "";
            const level = (d.level as number) || 2;
            const Tag = `h${level}` as any;
            return <Tag key={i} dangerouslySetInnerHTML={{ __html: text }} />;
          }
          case "paragraph":
            return <p key={i} dangerouslySetInnerHTML={{ __html: (d.text as string) || "" }} />;
          case "list": {
            const items = (d.items as (string | { content: string })[]) || [];
            const style = (d.style as string) || "unordered";
            const renderItem = (item: string | { content: string }) => typeof item === "string" ? item : item.content;
            const Tag = style === "ordered" ? "ol" : "ul";
            return <Tag key={i}>{items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: renderItem(item) }} />)}</Tag>;
          }
          case "quote":
            return (
              <blockquote key={i}>
                <p dangerouslySetInnerHTML={{ __html: (d.text as string) || "" }} />
                {d.caption && <footer className="text-sm text-slate-400 mt-1">— {d.caption as string}</footer>}
              </blockquote>
            );
          case "delimiter": return <hr key={i} />;
          default: return null;
        }
      })}
    </div>
  );
}