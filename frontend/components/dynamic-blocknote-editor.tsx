"use client"

import dynamic from "next/dynamic"

// 動態導入 BlockNote 編輯器，確保只在客戶端載入
export const DynamicBlockNoteEditor = dynamic(() => import("./blocknote-editor"), { 
  ssr: false,
  loading: () => (
    <div className="p-6 text-center text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      載入編輯器中...
    </div>
  )
})

export default DynamicBlockNoteEditor
