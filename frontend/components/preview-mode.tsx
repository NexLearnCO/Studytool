'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface PreviewModeProps {
  markdown: string
  className?: string
}

export default function PreviewMode({ markdown, className = '' }: PreviewModeProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 自定義表格樣式
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 bg-white text-sm" {...props} />
            </div>
          ),
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto my-4" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-4 py-3 text-gray-700" {...props} />
          ),
          // 自定義標題樣式
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-medium text-gray-800 mt-5 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-medium text-gray-700 mt-4 mb-2" {...props} />
          ),
          // 自定義列表樣式
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-6 list-decimal space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700 leading-relaxed" {...props} />
          ),
          // 自定義段落樣式
          p: ({ node, ...props }) => (
            <p className="my-4 text-gray-700 leading-relaxed" {...props} />
          ),
          // 自定義程式碼樣式
          code: ({ node, ...props }: any) => {
            const isInline = !props.className?.includes('language-')
            return isInline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600" {...props} />
            ) : (
              <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
            )
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
          ),
          // 自定義引用樣式
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-600 bg-blue-50" {...props} />
          ),
          // 自定義強調樣式
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
          ),
          // 自定義分隔線
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t border-gray-300" {...props} />
          ),
          // 自定義連結樣式
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          )
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
