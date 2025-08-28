# PURPOSE
把來源的大綱/片段對齊到「科目藍本」章節（Blueprint Sections）。簡版：以關鍵字與近似語對齊，缺料標記為 "supplement"。

# VARIABLES
- blueprint_json: {{blueprint_json}}   # 例：{sections:[{id,title,keywords?[],style?{…}}], style_rules:{…}}
- outline_json: {{outline_json}}       # 由 outline_extract/refine 產出
- chunks_json: {{chunks_json}}         # 可用於補強比對
- language: {{language}}

# ROUTING RULES (簡版關鍵字)
- 為每個 blueprint.section 構建關鍵詞集合：title 拆詞 + section.keywords（若有）。
- 將 outline_json.sections 的 title 與 chunks_json 中相近句子做關鍵詞比對（大小寫/標點/同義詞/中英對照）。
- 命中分數最高者即對齊；無明顯命中則標記 status="supplement"。
- 同一 outline 節點可分配到多個 blueprint 章節（若分數接近）。
- 僅返回對齊資訊，不改寫內容。

# OUTPUT (JSON ONLY)
{
  "mapping": [
    {
      "blueprint_section": "mechanisms",       // 以 blueprint_json.sections[].id 為主鍵
      "source_titles": ["…","…"],              // 命中的 outline 標題
      "chunk_ids": ["doc1-p12-c3","…"],        // 可選：命中的 chunk id
      "status": "matched"                      // "matched" | "supplement"
    }
  ]
}

# PROMPT
請根據下列 blueprint、outline 與 chunks，完成章節對齊並輸出上述 JSON（只輸出 JSON）：
[blueprint]
{{blueprint_json}}

[outline]
{{outline_json}}

[chunks]
{{chunks_json}}
