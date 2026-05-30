"use client";

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// 因為 react-quill 不支援 SSR，必須使用 dynamic import
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400">載入文字編輯器中...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);

    // 自訂的圖片上傳處理器
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.setAttribute("multiple", "multiple"); // 允許選擇多張圖片
        input.click();

        input.onchange = async () => {
            const files = input.files ? Array.from(input.files) : [];
            if (files.length === 0) return;

            const quill = quillRef.current?.getEditor();
            if (!quill) return;

            let range = quill.getSelection(true);

            try {
                // 使用迴圈依次上傳多張圖片並插入
                for (const file of files) {
                    const formData = new FormData();
                    formData.append("file", file);

                    // 呼叫我們後端的上傳 API
                    const res = await fetch(`${API_BASE}/admin/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) throw new Error("Upload failed for a file");
                    const data = await res.json();
                    const imageUrl = data.url;

                    quill.insertEmbed(range.index, "image", imageUrl);
                    range.index += 1; // 更新索引，讓下一張圖片插在後面
                    quill.setSelection(range.index);
                }
            } catch (err) {
                console.error("圖片上傳失敗", err);
                alert("部分或全部圖片上傳失敗，請確認伺服器狀態");
            }
        };
    };

    // 使用 useMemo 確保 modules 不會在每次 render 時重新建立，導致編輯器不斷重繪與失去焦點
    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ color: [] }, { background: [] }],
                    ["link", "image"],
                    ["clean"],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
        }),
        []
    );

    const formats = [
        "header",
        "bold", "italic", "underline", "strike", "blockquote",
        "list",
        "color", "background",
        "link", "image"
    ];

    return (
        <div className="bg-white rich-text-editor-container">
            {/* 額外加入一個 style，修正 react-quill 預設高度過矮的問題 */}
            <style jsx global>{`
                .rich-text-editor-container .ql-container {
                    min-height: 300px;
                    font-size: 16px;
                }
                .rich-text-editor-container .ql-editor {
                    min-height: 300px;
                }
            `}</style>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
            />
        </div>
    );
}
