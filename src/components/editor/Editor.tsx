"use client";

import { useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";

interface EditorProps {
  initialData?: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

function parseInitialData(raw: string | undefined): { blocks: Array<{ type: string; data: Record<string, string> }> } | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.blocks)) return parsed;
    return undefined;
  } catch {
    return {
      blocks: [
        {
          type: "paragraph",
          data: { text: raw },
        },
      ],
    };
  }
}

export default function Editor({ initialData, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [ready, setReady] = useState(false);
  const holderId = useRef(`editor-${Math.random().toString(36).slice(2, 9)}`);
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  useEffect(() => {
    let editor: EditorJS | null = null;
    let destroyed = false;

    const init = async () => {
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Quote = (await import("@editorjs/quote")).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Code = (await import("@editorjs/code")).default as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Delimiter = (await import("@editorjs/delimiter")).default as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const InlineCode = (await import("@editorjs/inline-code")).default as any;
      // @ts-expect-error -- @editorjs/embed lacks proper ESM type exports
      const Embed = (await import("@editorjs/embed")).default;
      const EditorJSModule = (await import("@editorjs/editorjs")).default;

      if (destroyed) return;

      const parsedData = parseInitialData(initialDataRef.current);

      editor = new EditorJSModule({
        holder: holderId.current,
        tools: {
          header: { class: Header as any, inlineToolbar: true },
          list: { class: List as any, inlineToolbar: true },
          quote: { class: Quote as any, inlineToolbar: true },
          code: Code as any,
          delimiter: Delimiter as any,
          inlineCode: InlineCode as any,
          embed: Embed as any,
        },
        data: parsedData,
        placeholder: placeholder || "Write something...",
        onChange: async () => {
          if (editor) {
            const output = await editor.save();
            onChange(JSON.stringify(output));
          }
        },
        onReady: () => {
          setReady(true);
        },
      });

      editorRef.current = editor;
    };

    init();

    return () => {
      destroyed = true;
      if (editor) {
        editor.destroy();
        editor = null;
      }
      editorRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="editorjs-wrapper">
      {!ready && (
        <div className="border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
          Loading editor...
        </div>
      )}
      <div
        id={holderId.current}
        className={`${ready ? "" : "hidden"} border border-slate-200 rounded-xl bg-white [&_.codex-editor]:min-h-[200px] [&_.codex-editor__redactor]:pb-[40px!important] [&_.ce-toolbar__content]:max-w-none [&_.ce-block__content]:max-w-none [&_.ce-popups]:z-[100] [&_.ce-toolbar]:z-[99]`}
      />
    </div>
  );
}