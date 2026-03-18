"use client";
import { useState, useEffect, useRef } from "react";

// ─── SYNTAX HIGHLIGHTER ───────────────────────────────────────────────────────
// Pure CSS token highlighting — no external deps
function highlight(code: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rules: [RegExp, string][] = [
    // Comments
    [/(#[^\n]*)/g, '<span class="tok-comment">$1</span>'],
    // Strings (triple first, then single/double)
    [/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="tok-string">$1</span>'],
    [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="tok-string">$1</span>'],
    // Decorators
    [/(@\w+)/g, '<span class="tok-decorator">$1</span>'],
    // Keywords
    [/\b(async|await|def|class|return|import|from|if|else|elif|for|while|in|not|and|or|is|None|True|False|pass|raise|try|except|finally|with|as|assert|lambda|yield|global|nonlocal|del|break|continue)\b/g,
      '<span class="tok-keyword">$1</span>'],
    // Builtins & types
    [/\b(self|cls|print|len|range|list|dict|set|tuple|str|int|float|bool|type|super|isinstance|hasattr|getattr|setattr|staticmethod|classmethod|property|open|enumerate|zip|map|filter|any|all|min|max|sum|sorted|reversed|iter|next)\b/g,
      '<span class="tok-builtin">$1</span>'],
    // Shell keywords
    [/\b(pip|python|ollama|curl|nvidia-smi|docker|kubectl|sh)\b/g,
      '<span class="tok-shell">$1</span>'],
    // Function/class definitions
    [/\b(def|class)\s+([A-Za-z_]\w*)/g,
      '<span class="tok-keyword">$1</span> <span class="tok-funcname">$2</span>'],
    // Numbers
    [/\b(\d+\.?\d*)\b/g, '<span class="tok-number">$1</span>'],
    // Flags/options (--word)
    [/(--[\w-]+)/g, '<span class="tok-flag">$1</span>'],
    // Operators
    [/([=+\-*/<>!&|%^~]+)/g, '<span class="tok-op">$1</span>'],
  ];

  let out = escape(code);
  // Apply rules in order — use placeholder to avoid re-matching
  rules.forEach(([re, tpl]) => {
    out = out.replace(re, tpl);
  });
  return out;
}

function CodeBlock({ code, lang = "python" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block">
      <div className="code-bar">
        <div className="code-dots">
          <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
        </div>
        <span className="code-lang-tag">{lang}</span>
        <button className={`copy-btn${copied ? " copy-done" : ""}`} onClick={doCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="code-pre">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type L = "en"|"es"|"pt"|"fr"|"de"|"ja"|"zh"|"ko"|"ar"|"hi";
type Card = { id:string; title:string; tag:string; tagColor:string; summary:string; bullets:string[]; code?:string; codeLang?:string };
type Section = { id:string; nav:string; heading:string; description:string; cards:Card[] };

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const LANGS: Record<L,{flag:string;label:string}> = {
  en:{flag:"🇺🇸",label:"English"}, es:{flag:"🇪🇸",label:"Español"},
  pt:{flag:"🇧🇷",label:"Português"}, fr:{flag:"🇫🇷",label:"Français"},
  de:{flag:"🇩🇪",label:"Deutsch"}, ja:{flag:"🇯🇵",label:"日本語"},
  zh:{flag:"🇨🇳",label:"中文"}, ko:{flag:"🇰🇷",label:"한국어"},
  ar:{flag:"🇸🇦",label:"العربية"}, hi:{flag:"🇮🇳",label:"हिन्दी"},
};

const UI: Record<L,{sub:string;search:string;rules:string;code:string;close:string;learned:string;unlearn:string;progress:string;jumpTo:string;print:string;all:string;copy:string;copied:string}> = {
  en:{sub:"AI Developer Reference · 2026",search:"Search all sections… (⌘K)",rules:"Core Principles",code:"Code",close:"Close",learned:"Mark learned",unlearn:"Learned ✓",progress:"Progress",jumpTo:"Contents",print:"Print / PDF",all:"All",copy:"Copy",copied:"Copied"},
  es:{sub:"Referencia IA · 2026",search:"Buscar… (⌘K)",rules:"Principios",code:"Código",close:"Cerrar",learned:"Aprendido",unlearn:"Aprendido ✓",progress:"Progreso",jumpTo:"Índice",print:"Imprimir",all:"Todo",copy:"Copiar",copied:"Copiado"},
  pt:{sub:"Referência IA · 2026",search:"Pesquisar… (⌘K)",rules:"Princípios",code:"Código",close:"Fechar",learned:"Aprendido",unlearn:"Aprendido ✓",progress:"Progresso",jumpTo:"Índice",print:"Imprimir",all:"Tudo",copy:"Copiar",copied:"Copiado"},
  fr:{sub:"Référence IA · 2026",search:"Rechercher… (⌘K)",rules:"Principes",code:"Code",close:"Fermer",learned:"Appris",unlearn:"Appris ✓",progress:"Progrès",jumpTo:"Sommaire",print:"Imprimer",all:"Tout",copy:"Copier",copied:"Copié"},
  de:{sub:"KI-Referenz · 2026",search:"Suchen… (⌘K)",rules:"Grundregeln",code:"Code",close:"Schließen",learned:"Gelernt",unlearn:"Gelernt ✓",progress:"Fortschritt",jumpTo:"Inhalt",print:"Drucken",all:"Alle",copy:"Kopieren",copied:"Kopiert"},
  ja:{sub:"AI開発者リファレンス · 2026",search:"検索… (⌘K)",rules:"基本原則",code:"コード",close:"閉じる",learned:"習得",unlearn:"習得済み ✓",progress:"進捗",jumpTo:"目次",print:"印刷",all:"全て",copy:"コピー",copied:"完了"},
  zh:{sub:"AI开发者参考 · 2026",search:"搜索… (⌘K)",rules:"核心原则",code:"代码",close:"关闭",learned:"已学",unlearn:"已学 ✓",progress:"进度",jumpTo:"目录",print:"打印",all:"全部",copy:"复制",copied:"已复制"},
  ko:{sub:"AI 개발자 레퍼런스 · 2026",search:"검색… (⌘K)",rules:"핵심 원칙",code:"코드",close:"닫기",learned:"완료",unlearn:"완료 ✓",progress:"진도",jumpTo:"목차",print:"인쇄",all:"전체",copy:"복사",copied:"완료"},
  ar:{sub:"مرجع الذكاء الاصطناعي · 2026",search:"بحث… (⌘K)",rules:"المبادئ",code:"كود",close:"إغلاق",learned:"تعلمت",unlearn:"تعلمت ✓",progress:"التقدم",jumpTo:"المحتوى",print:"طباعة",all:"الكل",copy:"نسخ",copied:"تم"},
  hi:{sub:"AI डेवलपर रेफरेंस · 2026",search:"खोजें… (⌘K)",rules:"मुख्य सिद्धांत",code:"कोड",close:"बंद",learned:"सीखा",unlearn:"सीखा ✓",progress:"प्रगति",jumpTo:"सामग्री",print:"प्रिंट",all:"सभी",copy:"कॉपी",copied:"हो गया"},
};

const PRINCIPLES: Record<L,string[]> = {
  en:["Read before write — always","Test baseline before refactoring","Verify after every action","Max 3 retries, then escalate","Security agent is read-only","dry_run=True on infrastructure","15% VRAM headroom always","Spec first, generate second","Local for volume, cloud for complexity","Every backup needs a tested restore","Quality gates at every handoff","Compound your prompt library daily"],
  es:["Leer antes de escribir","Probar baseline antes de refactorizar","Verificar después de cada acción","Máx 3 reintentos, luego escalar","El agente de seguridad es solo-lectura","dry_run=True en infraestructura","15% headroom de VRAM","Especificar primero, generar después","Local para volumen, cloud para complejidad","Todo backup necesita restauración probada","Gates de calidad en cada handoff","Acumula tu biblioteca de prompts"],
  pt:["Ler antes de escrever","Testar baseline antes de refatorar","Verificar após cada ação","Máx 3 tentativas, depois escalar","Agente de segurança é somente-leitura","dry_run=True na infraestrutura","15% headroom de VRAM","Especificar primeiro, gerar depois","Local para volume, cloud para complexidade","Todo backup precisa de restore testado","Gates de qualidade em cada handoff","Acumule sua biblioteca de prompts"],
  fr:["Lire avant d'écrire","Tester la baseline avant refactoring","Vérifier après chaque action","Max 3 tentatives, puis escalader","L'agent sécurité est en lecture seule","dry_run=True sur l'infrastructure","15% de marge VRAM","Spécifier d'abord, générer ensuite","Local pour le volume, cloud pour la complexité","Tout backup doit avoir un restore testé","Portes qualité à chaque handoff","Enrichis ta bibliothèque de prompts"],
  de:["Lesen vor Schreiben","Baseline testen vor Refactoring","Nach jeder Aktion verifizieren","Max 3 Versuche, dann eskalieren","Security-Agent ist schreibgeschützt","dry_run=True bei Infrastruktur","15% VRAM-Puffer","Erst spezifizieren, dann generieren","Lokal für Volumen, Cloud für Komplexität","Jedes Backup braucht Wiederherstellungstest","Qualitätsgates bei jedem Übergabepunkt","Prompt-Bibliothek täglich erweitern"],
  ja:["書く前に必ず読む","リファクタリング前にベースラインテスト","全操作後に検証","最大3回リトライ、その後エスカレート","セキュリティエージェントは読み取り専用","インフラはdry_run=True","VRAMは15%のヘッドルームを確保","まず仕様、次に生成","量はローカル、複雑さはクラウド","バックアップは必ずリストアをテスト","全ハンドオフに品質ゲート","プロンプトライブラリを毎日積み上げる"],
  zh:["写之前先读","重构前先测试基线","每次操作后验证","最多重试3次，然后上报","安全智能体只读","基础设施dry_run=True","始终保留15% VRAM余量","先规范，后生成","量用本地，复杂度用云端","每个备份都需要测试恢复","每次交接设质量门控","每天积累提示词库"],
  ko:["쓰기 전에 반드시 읽기","리팩터링 전 베이스라인 테스트","모든 작업 후 검증","최대 3회 재시도, 에스컬레이션","보안 에이전트는 읽기 전용","인프라에 dry_run=True","항상 VRAM 15% 여유","먼저 명세, 그 다음 생성","볼륨은 로컬, 복잡성은 클라우드","모든 백업은 복구 테스트","모든 핸드오프에 품질 게이트","매일 프롬프트 라이브러리 축적"],
  ar:["اقرأ قبل الكتابة","اختبر الخط الأساسي","تحقق بعد كل إجراء","ثلاث محاولات كحد أقصى","عميل الأمان للقراءة فقط","dry_run=True في البنية التحتية","15% هامش VRAM","المواصفات أولاً","محلي للحجم، سحابي للتعقيد","كل نسخة تحتاج اختبار استعادة","بوابات الجودة عند كل تسليم","راكم مكتبة المحفزات يومياً"],
  hi:["लिखने से पहले पढ़ें","रिफैक्टरिंग से पहले बेसलाइन टेस्ट","हर एक्शन के बाद वेरिफाई","अधिकतम 3 रीट्राई, फिर एस्केलेट","सिक्योरिटी एजेंट रीड-ओनली","इन्फ्रा पर dry_run=True","15% VRAM हेडरूम","पहले स्पेक, फिर जेनरेट","वॉल्यूम लोकल, कॉम्प्लेक्सिटी क्लाउड","हर बैकअप का रिस्टोर टेस्ट","हर हैंडऑफ पर क्वालिटी गेट्स","प्रॉम्प्ट लाइब्रेरी रोज बढ़ाएं"],
};

// ─── MODEL COMPARISON ─────────────────────────────────────────────────────────
const MODELS = [
  {name:"Claude Opus 4",      provider:"Anthropic",type:"cloud", ctx:"200k", input:15,   output:75,  speed:"Medium",  best:"Architecture, novel reasoning"},
  {name:"Claude Sonnet 4",    provider:"Anthropic",type:"cloud", ctx:"200k", input:3,    output:15,  speed:"Fast",    best:"Most tasks, security review"},
  {name:"Claude Haiku 4.5",   provider:"Anthropic",type:"cloud", ctx:"200k", input:0.8,  output:4,   speed:"Fastest", best:"High-volume, simple tasks"},
  {name:"GPT-4o",             provider:"OpenAI",   type:"cloud", ctx:"128k", input:2.5,  output:10,  speed:"Fast",    best:"Multimodal, general coding"},
  {name:"o3",                 provider:"OpenAI",   type:"cloud", ctx:"200k", input:10,   output:40,  speed:"Slow",    best:"Complex multi-step reasoning"},
  {name:"Gemini 2.5 Pro",     provider:"Google",   type:"cloud", ctx:"1M",   input:1.25, output:10,  speed:"Fast",    best:"Long context, large codebases"},
  {name:"qwen2.5-coder:32b",  provider:"Local",    type:"local", ctx:"128k", input:0,    output:0,   speed:"Medium",  best:"Near-frontier local quality"},
  {name:"qwen2.5-coder:7b",   provider:"Local",    type:"local", ctx:"128k", input:0,    output:0,   speed:"Fast",    best:"Daily coding tasks"},
  {name:"qwen2.5-coder:1.5b", provider:"Local",    type:"local", ctx:"32k",  input:0,    output:0,   speed:"<100ms",  best:"Completion, autocomplete"},
  {name:"deepseek-coder:6.7b",provider:"Local",    type:"local", ctx:"16k",  input:0,    output:0,   speed:"Fast",    best:"Complex local tasks"},
];

// ─── PROMPT TEMPLATES ─────────────────────────────────────────────────────────
const PROMPTS = [
  {category:"Code Generation",title:"Function Implementation",
   template:`You are implementing a function for a production {language} codebase.

## Codebase Context
{system_context}

## Similar Existing Code
{similar_code}

## Task
Implement this specification exactly:
{function_specification}

Requirements:
- Follow patterns in the similar code above
- Use exact types from the codebase
- Handle all error cases explicitly
- Include type annotations
- Write a clear docstring if public-facing

Return only the implementation.`},
  {category:"Code Generation",title:"Class Implementation",
   template:`Implement this class for a {language} codebase.

Context: {codebase_context}
Specification: {class_specification}

Follow existing patterns for:
- Error handling: {error_handling_pattern}
- Naming conventions: {naming_conventions}
- Testing patterns: {test_patterns}

Return only the class implementation.`},
  {category:"Debugging",title:"Analyze Failing Test",
   template:`Analyze this test failure and identify the root cause.

## Failing Test
{test_code}

## Error Output
{error_output}

## Relevant Source Code
{source_code}

## Recent Changes (git log)
{recent_changes}

Identify:
1. Root cause (specific — line numbers and exact issue)
2. Why this is happening
3. Minimal fix that resolves the failure
4. Related issues to watch for

Return analysis then fixed code.`},
  {category:"Debugging",title:"Production Error Investigation",
   template:`Investigate this production error.

## Error
{error_message}

## Stack Trace
{stack_trace}

## Relevant Code
{relevant_code}

Provide:
1. What went wrong (precise)
2. Root cause
3. Immediate fix
4. Long-term prevention`},
  {category:"Code Review",title:"Security Review",
   template:`Perform a security review of this code change.

File: {file_path}
Language: {language}
Diff: {diff}

Check specifically for:
- Input validation gaps
- Authentication/authorization issues
- Injection vulnerabilities (SQL, command, template)
- Sensitive data exposure
- Cryptographic weaknesses
- Race conditions

Only report issues PRESENT in changed code.
Return JSON: {"findings": [{severity, line, description, remediation}]}`},
  {category:"Refactoring",title:"Complexity Reduction",
   template:`Refactor this function to reduce cyclomatic complexity.

Current complexity: {complexity}
Target: below {target}

Function:
{function_code}

CONSTRAINTS (non-negotiable):
- External behavior must be IDENTICAL
- Public signature must NOT change
- All helpers must be private (_{name})

Return only refactored code.`},
  {category:"Testing",title:"Comprehensive Test Suite",
   template:`Generate a comprehensive test suite for this function.

Function:
{function_code}

Existing test patterns:
{test_patterns}

Requirements:
- Name format: test_{function}_{scenario}_{expected}
- Cover: happy path, boundaries, errors, edge cases
- Mock all external dependencies
- Assert specific values, not just truthiness
- Each test should test ONE behavior

Generate complete, runnable test code.`},
  {category:"Documentation",title:"Accurate Docstring",
   template:`Generate an accurate docstring for this function.

CRITICAL: Describe what it ACTUALLY DOES — read carefully first.

Function:
{function_code}

Usage examples from callers:
{usage_examples}

Use Google-style format:
- First line: one-sentence summary
- Args, Returns, Raises, Example

Return only docstring content.`},
  {category:"Architecture",title:"Feature Design",
   template:`Design the architecture for a new feature.

Feature: {feature_spec}
Architecture context: {architecture_context}
Relevant existing code: {relevant_code}

Produce:
- New components required (purpose, interface, location)
- Existing components modified (what changes, interface impact)
- Interface definitions (function signatures, types)
- Data model changes
- Integration points
- Implementation order`},
];

// ─── QUANT CALC ───────────────────────────────────────────────────────────────
const QUANT_MODELS = [
  {name:"qwen2.5-coder:1.5b",params:1.5, fp16:3,   q8:1.6, q6:1.2, q4:0.9},
  {name:"qwen2.5-coder:7b",  params:7,   fp16:14,  q8:7,   q6:5.2, q4:3.5},
  {name:"deepseek-coder:6.7b",params:6.7,fp16:13.4,q8:6.7, q6:5,   q4:3.3},
  {name:"qwen2.5-coder:14b", params:14,  fp16:28,  q8:14,  q6:10.5,q4:7},
  {name:"qwen2.5-coder:32b", params:32,  fp16:64,  q8:32,  q6:24,  q4:16},
  {name:"deepseek-coder:33b",params:33,  fp16:66,  q8:33,  q6:24.7,q4:16.5},
  {name:"CodeLlama-70b",     params:70,  fp16:140, q8:70,  q6:52.5,q4:35},
];

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id:"stack", nav:"Stack", heading:"The AI Developer Stack",
    description:"Your foundation layer. Choose frontier cloud models for complex reasoning and local models for speed, privacy, and cost control. Most setups benefit from running both in a hybrid configuration.",
    cards:[
      {id:"s1",title:"Frontier Models",tag:"Cloud",tagColor:"#16a34a",
       summary:"Use for complex reasoning, architecture decisions, and security analysis — tasks where output quality has a significant impact.",
       bullets:["Claude Sonnet 4 / Opus 4 — anthropic","GPT-4o / o3 — openai","Gemini 2.5 Pro — google (1M context)","Best for: architecture, security, novel algorithms"],
       code:`import anthropic\n\nclient = anthropic.Anthropic()\nmessage = client.messages.create(\n    model="claude-sonnet-4-20250514",\n    max_tokens=1024,\n    messages=[{"role": "user", "content": "Analyze this architecture"}]\n)\nprint(message.content[0].text)`},
      {id:"s2",title:"Local Models",tag:"Local",tagColor:"#b45309",
       summary:"Run on your own hardware for privacy-sensitive codebases, sub-100ms completions, and volume tasks where API costs would accumulate significantly.",
       bullets:["qwen2.5-coder:7b — best quality/speed balance","deepseek-coder:6.7b — complex local tasks","qwen2.5-coder:1.5b — sub-100ms completions","deepseek-coder:33b — near-frontier (24 GB VRAM)"],
       codeLang:"bash",
       code:`# Install Ollama and pull models\ncurl -fsSL https://ollama.ai/install.sh | sh\n\nollama pull qwen2.5-coder:7b\nollama pull qwen2.5-coder:1.5b\n\n# OpenAI-compatible endpoint at localhost:11434/v1\nfrom openai import OpenAI\nclient = OpenAI(base_url="http://localhost:11434/v1", api_key="local")`},
      {id:"s3",title:"Serving Layer",tag:"Infra",tagColor:"#6d28d9",
       summary:"Ollama is the right starting point for individuals. Upgrade to vLLM when sharing across a team or when maximizing GPU throughput matters.",
       bullets:["Ollama — zero config, start here","vLLM — team sharing, PagedAttention","llama.cpp — fine-grained parameter control","LM Studio — GUI model management"],
       codeLang:"bash",
       code:`# vLLM for shared team use\npip install vllm\n\npython -m vllm.entrypoints.openai.api_server \\\n  --model deepseek-ai/deepseek-coder-6.7b-instruct \\\n  --tensor-parallel-size 2 \\\n  --host 0.0.0.0 --port 8000 \\\n  --max-model-len 32768`},
      {id:"s4",title:"Quantization",tag:"VRAM",tagColor:"#0369a1",
       summary:"q4_k_m is the practical sweet spot — 95% of FP16 quality at 25% of the memory footprint. Use the Calc tab to find the best fit for your hardware.",
       bullets:["q8_0 — 99% quality, 50% of FP16 size","q6_k — 98% quality, 37% size","q4_k_m — 95% quality, 25% size ← use this","q3_k_m — 88% quality, last resort only"],
       code:`# VRAM requirements guide\n# Model    FP16    q8     q4_k_m\n# 7B       14 GB   7 GB   4 GB\n# 13B      26 GB   13 GB  7 GB\n# 33B      66 GB   33 GB  18 GB\n# 70B      140 GB  70 GB  38 GB\n\n# Golden rule: model_size_gb * 1.15 <= available_vram`},
    ],
  },
  {
    id:"agents", nav:"Agents", heading:"The Agent Team",
    description:"Seven specialized agents that each own a specific domain. Specialization is what makes agents reliable enough to trust in production — generalist agents fail unpredictably.",
    cards:[
      {id:"a1",title:"Architect Agent",tag:"Design",tagColor:"#6d28d9",
       summary:"Thinks at the structural level — how components relate, where boundaries belong, and how decisions today affect work tomorrow. Always reads actual code before forming conclusions.",
       bullets:["analyze_architecture() — monthly full scan","design_feature(spec) — before any implementation","review_architectural_change(diff) — per PR","detect_architectural_drift() — ADRs vs reality"],
       code:`class ArchitectAgent:\n    async def design_feature(self, spec):\n        # Read actual codebase before designing\n        arch = self.intelligence.architecture.render()\n        similar = self.semantic_index.search(spec.description, n=5)\n        return await self.model.complete(\n            self._design_prompt(spec, arch, similar),\n            max_tokens=5000\n        )`},
      {id:"a2",title:"Security Agent",tag:"Read-only",tagColor:"#b91c1c",
       summary:"Permanently read-only by design. Identifies and explains vulnerabilities so developers understand and fix them. Never modifies code autonomously.",
       bullets:["audit_pull_request(diff) — every single PR","scan_for_secrets(diff) — pattern-based scan","run_scheduled_scan() — weekly full audit","OWASP Top 10 applied per language"],
       code:`class SecurityAgent:\n    CAN_WRITE = False  # Enforced at tool layer\n\n    SECRET_PATTERNS = [\n        (r'(?i)(password)\\s*=\\s*["\'][^"\']{4,}', "Hardcoded password"),\n        (r'sk-[a-zA-Z0-9]{20,}', "OpenAI API key"),\n        (r'ghp_[a-zA-Z0-9]{36}', "GitHub token"),\n        (r'-----BEGIN.*PRIVATE KEY-----', "Private key"),\n    ]\n    # Only report issues PRESENT in changed code`},
      {id:"a3",title:"Testing Agent",tag:"Quality",tagColor:"#16a34a",
       summary:"Generates comprehensive test suites and then runs mutation testing to prove the tests actually catch bugs — not just execute code paths.",
       bullets:["generate_test_suite(unit) — comprehensive coverage","run_mutation_testing() — target score > 0.80","identify_coverage_gaps() — prioritized by fan-in","Naming: test_<fn>_<scenario>_<expected>"],
       code:`async def generate_and_verify(self, unit):\n    tests = await self._generate_tests(unit)\n\n    # Step 1: tests must PASS on correct code\n    assert (await self.runner.run(tests)).all_passed\n\n    # Step 2: tests must FAIL on mutated code\n    for mutation in self._generate_mutations(unit):\n        self._apply(mutation)\n        result = await self.runner.run(tests)\n        self._revert(mutation)\n        if not result.has_failures:\n            await self._improve_test_for(mutation)`},
      {id:"a4",title:"Refactoring Agent",tag:"Safe",tagColor:"#b45309",
       summary:"Improves internal structure without changing external behavior. Tests first, works in small verifiable steps, and reverts automatically on any test failure.",
       bullets:["run_targeted_refactoring() — complexity reduction","run_duplicate_consolidation() — semantic similarity","run_naming_improvement() — low-risk auto-applied","Auto-reverts if any test fails after a change"],
       code:`async def refactor_safely(self, target):\n    baseline = await self.tools.run_tests(\n        self._get_covering_tests(target)\n    )\n    if not baseline.all_passed:\n        raise RefactoringError("Fix tests BEFORE refactoring")\n\n    for step in self._plan_steps(target):\n        self._apply(step)\n        if not (await self.tools.run_tests()).all_passed:\n            self._revert(step)  # Always revert on failure`},
      {id:"a5",title:"DevOps Agent",tag:"Ops",tagColor:"#0369a1",
       summary:"Manages the full deployment lifecycle with pre/post validation, canary monitoring with automatic rollback, and AI-driven incident investigation.",
       bullets:["manage_deployment() — pre+post validation","investigate_incident() — metrics+logs+AI analysis","optimize_pipeline() — bottleneck identification","Auto-rollback when canary metrics degrade"],
       code:`async def deploy_safely(self, spec, env):\n    if not (await self._assess_readiness(spec, env)).ready:\n        return DeploymentResult.blocked()\n\n    deployment = await self._execute(spec, env)\n\n    if env == "production":\n        canary = await self._monitor_canary(deployment, minutes=15)\n        if not canary.healthy:\n            await self._rollback(deployment)\n            return DeploymentResult.rolled_back()`},
      {id:"a6",title:"Documentation Agent",tag:"Write",tagColor:"#b45309",
       summary:"Generates accurate documentation from what code actually does, not what it looks like it does. Runs weekly drift detection to keep docs in sync.",
       bullets:["document_module() — docstrings + module overview","detect_and_fix_drift() — weekly automated run","generate_readme() — from actual project structure","generate_changelog() — from git history + PRs"],
       code:`async def generate_accurate_docstring(self, unit):\n    # Read the code BEFORE writing about it\n    source = await self.tools.read_file(\n        unit.file_path, unit.start_line, unit.end_line\n    )\n    examples = self._find_usage_examples(unit)\n    return await self.model.complete(\n        f"Read carefully before writing:\\n{source}\\n"\n        f"Describe actual behavior. Examples: {examples}"\n    )`},
    ],
  },
  {
    id:"skills", nav:"Skills", heading:"Skills",
    description:"Reusable, composable capabilities that agents invoke to perform specific tasks. Each skill encodes the context, prompts, and verification logic for one type of work — separating intelligence from orchestration.",
    cards:[
      {id:"sk1",title:"Code Generation Skill",tag:"Skill",tagColor:"#16a34a",
       summary:"Context-aware implementation that retrieves similar existing code and matches your codebase patterns before generating anything.",
       bullets:["Retrieve similar code via semantic search first","Inject codebase conventions from system prompt","Generate → verify types → run tests","Iterate with failure feedback up to 3 times"],
       code:`class CodeGenerationSkill:\n    async def generate(self, spec):\n        similar = self.semantic_index.search(spec.description, n=3)\n        prompt = f"""\n        Implement for our {spec.language} codebase.\n        Similar existing code to follow:\n        {self._format_similar(similar)}\n        Specification: {spec.render()}\n        Return only the implementation.\n        """\n        code = await self.model.complete(prompt)\n        await self._verify(code, spec)\n        return code`},
      {id:"sk2",title:"Debugging Skill",tag:"Skill",tagColor:"#b91c1c",
       summary:"Systematic root cause analysis: reproduce the failure, trace git history to find when it was introduced, form one hypothesis, then fix and verify.",
       bullets:["Reproduce first — confirm the failure is real","git blame to find when the bug was introduced","One specific hypothesis before writing any code","Verify: failing test passes, full suite stays green"],
       code:`class DebuggingSkill:\n    async def debug(self, failing_test):\n        result = await self.tools.run_tests(failing_test)\n        assert not result.all_passed, "Test passes now — stale report?"\n\n        recent = await self.tools.git_log(limit=20)\n        hypothesis = await self.model.complete(\n            self._analysis_prompt(result, recent)\n        )\n        await self._apply_fix(hypothesis)\n\n        final = await self.tools.run_tests()\n        assert final.all_passed`},
      {id:"sk3",title:"Refactoring Skill",tag:"Skill",tagColor:"#b45309",
       summary:"Eight named techniques applied one at a time, each verified with tests before moving to the next.",
       bullets:["Extract Method — complex logic → named helper","Extract Variable — expressions → descriptive name","Replace Magic Numbers — literals → constants","Consolidate Duplicates — shared abstraction"],
       code:`class RefactoringSkill:\n    TECHNIQUES = [\n        "extract_method",\n        "extract_variable",\n        "replace_magic_numbers",\n        "consolidate_duplicates",\n        "simplify_conditionals",\n        "rename_for_clarity",\n    ]\n\n    async def apply(self, unit, technique):\n        refactored = await self.model.complete(\n            self._refactor_prompt(unit, technique)\n        )\n        await self.tools.edit_file(unit.file_path, unit.source, refactored)\n        assert (await self.tools.run_tests()).all_passed`},
      {id:"sk4",title:"Test Generation Skill",tag:"Skill",tagColor:"#16a34a",
       summary:"Plans test cases across happy path, boundaries, errors, and state — then mutation-tests the result to prove tests catch real bugs.",
       bullets:["Analyze: happy path, boundaries, errors, state","Follow existing fixtures and mock patterns exactly","Mutation test: introduce bug, confirm test fails","Accept only when mutation score > 0.80"],
       code:`class TestGenerationSkill:\n    async def generate(self, unit):\n        plan = await self._create_test_plan(unit)\n        tests = await self._generate_tests(unit, plan)\n\n        # Verify on correct code\n        assert (await self.runner.run(tests)).all_passed\n\n        # Verify catches bugs\n        score = await self._mutation_score(unit, tests)\n        if score < 0.80:\n            tests = await self._strengthen(tests, unit)\n        return tests`},
      {id:"sk5",title:"Documentation Skill",tag:"Skill",tagColor:"#6d28d9",
       summary:"Reads the implementation carefully before writing anything. Derives documentation from actual behavior and real usage examples from callers.",
       bullets:["Read the implementation — always first step","Extract usage examples from real callers in the graph","Google-style: Args, Returns, Raises, Example","Monthly drift detection: compare docs vs implementation"],
       code:`class DocumentationSkill:\n    async def generate_docstring(self, unit):\n        source = await self.tools.read_file(\n            unit.file_path, unit.start_line, unit.end_line\n        )\n        callers = self.dep_graph.get_predecessors(unit.qualified_name)[:3]\n        examples = self._extract_usage(callers)\n        return await self.model.complete(\n            f"Read before writing:\\n{source}\\n"\n            f"Write a docstring describing ACTUAL behavior.\\n"\n            f"Real usage examples:\\n{examples}"\n        )`},
      {id:"sk6",title:"Security Analysis Skill",tag:"Skill",tagColor:"#b91c1c",
       summary:"OWASP-aligned review focused only on code present in the diff. Never produces false positives — only reports issues it is confident about.",
       bullets:["OWASP Top 10 checklist applied per language","Secret scanning via regex pattern library","Verify input validation on all new user inputs","Output: severity + line + attack vector + fix"],
       code:`class SecurityAnalysisSkill:\n    OWASP_CHECKS = [\n        "injection", "broken_authentication",\n        "sensitive_data_exposure", "broken_access_control",\n        "security_misconfiguration", "vulnerable_components",\n        "csrf", "ssrf",\n    ]\n\n    async def analyze(self, diff):\n        findings = await self.model.complete(\n            self._security_prompt(diff, self.OWASP_CHECKS),\n            response_format="json"\n        )\n        return SecurityReport.from_json(findings)`},
      {id:"sk7",title:"API Interaction Skill",tag:"Skill",tagColor:"#0369a1",
       summary:"Safe, validated HTTP calls with credentials from environment variables. Returns typed structured results, never raw responses.",
       bullets:["Credentials from env vars — never in code or prompts","Validate URL against allowlist before any call","Return structured results, not raw HTTP responses","Retry with backoff on 429/503, fail fast on 4xx"],
       code:`class APIInteractionSkill:\n    def __init__(self):\n        # Load credentials from env — never hardcode\n        self.headers = {\n            "Authorization": f"Bearer {os.getenv('API_KEY')}"\n        }\n\n    async def call(self, endpoint, payload):\n        self._validate_url(endpoint)  # Allowlist check\n        response = await self.client.post(\n            endpoint, json=payload,\n            headers=self.headers, timeout=30\n        )\n        return self._parse_structured(response)`},
      {id:"sk8",title:"Database Interaction Skill",tag:"Skill",tagColor:"#b45309",
       summary:"Read-only by default. Parameterized queries always. Production database access blocked entirely — agents only access dev/staging.",
       bullets:["Read-only by default — write is explicit opt-in","Always parameterized queries — never f-string SQL","Schema inspection before writing any query","Production databases: agent access blocked always"],
       code:`class DatabaseSkill:\n    WRITE_ENABLED = False  # Explicit opt-in required\n\n    async def query(self, sql, params):\n        # Block production access entirely\n        assert self.env != "production", \\\n            "Agent DB access blocked in production"\n\n        # Parameterized only — never f-string SQL\n        async with self.pool.acquire() as conn:\n            return await conn.fetch(sql, *params)`},
    ],
  },
  {
    id:"tools", nav:"Tools", heading:"Tool Library",
    description:"The interfaces that let agents take real actions in the world. Each tool validates inputs, enforces safety constraints, and returns structured results — not raw terminal output.",
    cards:[
      {id:"t1",title:"File System",tag:"FS",tagColor:"#16a34a",
       summary:"Core file operations. The most important rule: always read a file before modifying it. Use edit_file over write_file for targeted changes — smaller blast radius.",
       bullets:["read_file(path, start?, end?) → numbered lines","write_file(path, content, backup=True) → safe overwrite","edit_file(path, old_content, new_content) → targeted","search_files(query, path?, pattern?) → with context"],
       code:`# Golden rule: always read before modifying\ncurrent = tools.read_file("src/auth/service.py")\n\n# edit_file is safer than write_file for modifications\nresult = tools.edit_file(\n    path="src/auth/service.py",\n    old_content="return True  # Bug: wrong return",\n    new_content="return False"\n)\nassert result.success, f"Edit failed: {result.error}"\n\n# All paths scoped to repo root — never /etc or ~/.ssh`},
      {id:"t2",title:"Execution",tag:"Exec",tagColor:"#b91c1c",
       summary:"Terminal commands validated against an allowlist with a hard timeout. Returns structured results per test — not raw terminal output that requires parsing.",
       bullets:["run_command(cmd, timeout=60) → stdout+stderr+exit_code","run_tests(path?, filter?) → structured per-test results","run_linter(path?, fix=False) → violations with line refs","run_coverage(path?) → per-file coverage percentages"],
       code:`result = tools.run_tests(\n    test_path="tests/test_auth.py",\n    test_filter="test_token_validation",\n    timeout_seconds=60\n)\n\n# Structured output — not raw terminal text\n# result.passed  → list of passing test names\n# result.failed  → list of FailedTest(name, msg, traceback)\n# result.all_passed → bool\n\nif not result.all_passed:\n    for f in result.failed:\n        print(f"{f.name}: {f.traceback[-1]}")`},
      {id:"t3",title:"Git Workflow",tag:"VCS",tagColor:"#6d28d9",
       summary:"Full git workflow from branch creation to PR. Agents always create a branch first, stage specific files deliberately, and write meaningful commit messages.",
       bullets:["git_status() / git_diff() / git_log() / git_blame()","git_create_branch(name) — always branch first","git_add(specific_paths) + git_commit(message)","create_pull_request(title, body, reviewers)"],
       code:`async def implement_and_pr(task):\n    await tools.git_create_branch(f"feat/{task.slug}")\n\n    # ... make changes ...\n\n    await tools.git_status()   # what changed?\n    await tools.git_diff()     # review before staging\n\n    # Stage specific files — never git add .\n    await tools.git_add(["src/auth/middleware.py", "tests/test_auth.py"])\n    await tools.git_commit("fix: expired tokens now correctly rejected")\n    await tools.git_push()\n    return await tools.create_pull_request(title, body)`},
      {id:"t4",title:"Container + K8s",tag:"Docker",tagColor:"#0369a1",
       summary:"dry_run=True is the default on kubectl and reviewing the preview output is not optional. Apply only after confirming the preview matches intent.",
       bullets:["docker_build(context, tag) — verify builds in CI","docker_compose_up(file, wait=True) — local dev stack","kubectl_apply(manifest, dry_run=True) — always default","kubectl_rollout_status(deployment) — verify after apply"],
       codeLang:"bash",
       code:`# Always preview infrastructure changes first\nkubectl apply -f k8s/deployment.yaml --dry-run=client\n\n# Review the output, then apply explicitly\nkubectl apply -f k8s/deployment.yaml\n\n# Verify the rollout completed\nkubectl rollout status deployment/my-service --timeout=300s\n\n# Check VRAM on your GPU\nnvidia-smi --query-gpu=memory.used,memory.free --format=csv`},
    ],
  },
  {
    id:"memory", nav:"Memory", heading:"Memory Systems",
    description:"What transforms stateless AI interactions into a system that knows your codebase. Four complementary stores — each optimized for different knowledge types and retrieval patterns.",
    cards:[
      {id:"m1",title:"Context Architecture",tag:"Session",tagColor:"#b45309",
       summary:"Four regions in every session: persistent (system prompt), task (current goal), retrieved (auto-assembled via vector DB), and working (tool results). Compress when full.",
       bullets:["Persistent: system prompt + conventions (500–1500 tokens)","Retrieved: auto-assembled per task via semantic search","Compress completed phases: 5 000 tokens → 300 token summary","Checkpoint long sessions — resume without restarting"],
       code:`def assemble_context(task, budget=12000):\n    ctx = AssembledContext()\n    ctx.add(intelligence.system_prompt)\n    remaining = budget - count_tokens(intelligence.system_prompt)\n\n    for result in semantic_index.search(task.description, n=10):\n        tokens = count_tokens(result.content)\n        if tokens <= remaining * 0.4:\n            ctx.add(result)\n            remaining -= tokens\n\n    ctx.add(change_model.get_recent(task.files, days=14))\n    return ctx.trim_to_budget(budget)`},
      {id:"m2",title:"Long-Term Memory Types",tag:"Persist",tagColor:"#6d28d9",
       summary:"Four types with different purposes. Episodic records are immutable — new experiences create new memories, never update old ones.",
       bullets:["Episodic — past sessions, immutable records","Semantic — what modules do, how they relate","Procedural — which prompts and workflows work best","Preference — how you consistently correct AI output"],
       code:`@dataclass\nclass EpisodicMemory:\n    session_id:       str\n    task_type:        str\n    outcome:          str   # success | failure | escalated\n    approach_taken:   str\n    what_worked:      list[str]\n    what_failed:      list[str]\n    key_insights:     list[str]\n    embedding:        list[float]  # For semantic retrieval\n\n    # Rule: NEVER update episodic memories.\n    # New experiences create NEW records.`},
      {id:"m3",title:"Vector Database",tag:"Search",tagColor:"#16a34a",
       summary:"The retrieval engine for semantic code search. Index at function/class level for precision. Update via git hooks on every commit so the index never goes stale.",
       bullets:["Chroma — local dev, zero infra (start here)","Qdrant — rich metadata filtering at scale","Index at function/class level, not whole files","Hybrid retrieval: semantic + BM25 → RRF merge"],
       code:`collection.upsert(\n    ids=[f"unit:{unit.file_path}:{unit.name}"],\n    embeddings=[embedder.embed(\n        f"# {unit.unit_type}: {unit.qualified_name}\\n"\n        f"{unit.full_source}"\n    )],\n    documents=[unit.full_source],\n    metadatas=[{"path": unit.file_path, "type": unit.unit_type}]\n)\n\n# Git hook: update index on every commit\n# .git/hooks/post-commit\n# python -m ai_os.indexer update-changed &`},
      {id:"m4",title:"Knowledge Graph",tag:"Graph",tagColor:"#b91c1c",
       summary:"Explicit relationships between code entities. Enables impact analysis before any change — know exactly what will break before touching anything.",
       bullets:["Nodes: Module, Class, Function, Table, Service","Edges: CALLS, IMPORTS, INHERITS, TESTS, DEPENDS_ON","get_impact_analysis(fn) — run before every refactor","find_circular_dependencies() — architecture health check"],
       code:`# Before ANY refactoring, check the blast radius\nimpact = graph.query("""\n  MATCH (changed:Function {name: $fn})\n  MATCH path = (caller)-[:CALLS*1..5]->(changed)\n  RETURN caller.name, caller.path,\n         length(path) as depth\n  ORDER BY depth\n""", fn="validate_token")\n\nprint(f"Changing validate_token affects {len(impact)} callers")`},
    ],
  },
  {
    id:"pipelines", nav:"Pipelines", heading:"Automation Pipelines",
    description:"Coordinated multi-agent workflows that automate entire development lifecycle stages. Each pipeline has quality gates at every handoff — no stage can pass broken output to the next.",
    cards:[
      {id:"p1",title:"Feature Pipeline",tag:"End-to-end",tagColor:"#16a34a",
       summary:"Takes a specification and produces a pull request. Architecture first, tests before implementation, parallel security and quality reviews — then PR creation.",
       bullets:["Stage 1: Architecture planning (Architect Agent)","Stage 2: Test specification before any code (TDD)","Stage 3: Implementation with iterative fix loop (max 3)","Stage 4: Parallel security + quality reviews","Stage 5: Documentation generation","Stage 6: PR creation with full description"],
       code:`async def feature_pipeline(spec):\n    design = await architect.design_feature(spec)\n    if design.has_blocking_risks:\n        return needs_human_review(design.risks)\n\n    test_spec = await testing.create_test_spec(spec)\n    impl = await implement_with_loop(design, test_spec, max_iterations=3)\n\n    security, arch, coverage = await asyncio.gather(\n        security_agent.audit(impl.diff),\n        architect.review_change(impl.diff),\n        testing.verify_coverage(impl)\n    )\n    if any_blockers(security, arch, coverage):\n        return needs_human_review()\n\n    docs = await documentation.document(impl)\n    return await create_pr(impl, docs)`},
      {id:"p2",title:"Nightly Improvements",tag:"Scheduled",tagColor:"#b45309",
       summary:"Runs automatically each night. By morning there are small, focused PRs addressing the most impactful quality issues — no developer time spent finding them.",
       bullets:["02:00 — Refactoring: top 5 complexity issues","03:00 — Tests: coverage gaps by fan-in priority","04:00 Sunday — Documentation drift detection + fix","09:00 Monday — Dependency security audit"],
       code:`SCHEDULE = [\n    ScheduledTask(\n        cron="0 2 * * *",\n        agent="refactoring",\n        config={"max_changes": 5, "risk_threshold": "low"}\n    ),\n    ScheduledTask(\n        cron="0 3 * * *",\n        agent="testing",\n        config={"target_coverage": 0.85}\n    ),\n    ScheduledTask(\n        cron="0 4 * * 0",  # Sunday\n        agent="documentation",\n        action="detect_and_fix_drift"\n    ),\n]`},
      {id:"p3",title:"Quality Gates",tag:"Required",tagColor:"#b91c1c",
       summary:"Blocking checkpoints at every pipeline handoff. If any blocking gate fails, the pipeline stops. Non-blocking gates produce warnings but allow the pipeline to continue.",
       bullets:["Gate 1: Syntax + types — blocking, always first","Gate 2: All tests pass — blocking, required","Gate 3: No critical security findings — blocking","Gate 4: No linting violations — blocking","Gate 5: Coverage ≥ 80% — warning only (non-blocking)"],
       code:`GATES = [\n    Gate("syntax_types",\n         check=lambda i: i.passes_type_check,\n         blocking=True),\n    Gate("tests_pass",\n         check=lambda i: i.test_results.all_passed,\n         blocking=True),\n    Gate("no_critical_security",\n         check=lambda i: i.security.critical_count == 0,\n         blocking=True),\n    Gate("coverage",\n         check=lambda i: i.coverage >= 0.80,\n         blocking=False),  # Warning only\n]`},
      {id:"p4",title:"AI-Augmented CI",tag:"CI",tagColor:"#0369a1",
       summary:"Every commit gets structural impact analysis — not just linting. Smart test selection runs only the relevant tests, and AI reviews run in parallel.",
       bullets:["Impact analysis — what could this change break?","Smart test selection — run relevant tests only","Parallel AI review — security + quality simultaneously","Performance regression detection on critical paths"],
       code:`async def ai_ci(commit):\n    # Understand structural impact, not just the diff\n    impact = await analyze_change_impact(\n        files=commit.diff.files_changed\n    )\n\n    # Run relevant tests, not all 10 000\n    tests = select_tests_by_impact(commit, impact)\n    test_result = await run_tests(tests)\n\n    security, quality = await asyncio.gather(\n        security_agent.audit(commit.diff),\n        quality_agent.review(commit.diff)\n    )\n    return CIResult(\n        tests=test_result,\n        blocks_merge=not test_result.all_passed or\n                     security.has_critical_findings\n    )`},
    ],
  },
  {
    id:"routing", nav:"Routing", heading:"Model Routing",
    description:"Intelligent routing sends each task to the right model. Privacy, budget, and server availability each override the base rule — the engine handles all of this automatically.",
    cards:[
      {id:"r1",title:"Routing Map",tag:"Hybrid",tagColor:"#16a34a",
       summary:"Route by task type first, then apply overrides. Local for high-frequency and low-complexity, cloud for tasks where frontier quality makes a measurable difference.",
       bullets:["code_completion → qwen2.5-coder:1.5b (local, <100ms)","docstring_generation → qwen2.5-coder:7b (local)","complex_debugging → claude-sonnet-4 (cloud)","architecture_design → claude-opus-4 (cloud)"],
       code:`ROUTING_MAP = {\n    # Local — high frequency, latency critical\n    "code_completion":   ("local", "qwen2.5-coder:1.5b"),\n    "variable_naming":   ("local", "qwen2.5-coder:1.5b"),\n    "docstring_gen":     ("local", "qwen2.5-coder:7b"),\n    "simple_tests":      ("local", "qwen2.5-coder:7b"),\n\n    # Cloud — complexity requires frontier quality\n    "complex_debugging": ("cloud", "claude-sonnet-4"),\n    "arch_design":       ("cloud", "claude-opus-4"),\n    "security_analysis": ("cloud", "claude-sonnet-4"),\n    "novel_algorithm":   ("cloud", "claude-opus-4"),\n}`},
      {id:"r2",title:"Routing Engine",tag:"Logic",tagColor:"#6d28d9",
       summary:"Four override conditions checked in order before applying the base rule. Privacy always wins, then offline mode, then budget, then server health.",
       bullets:["Privacy mode → force all local, no exceptions ever","Budget > 85% monthly spend → switch to local","Local server down → auto-fallback to cloud","Sensitive code detected → force local regardless"],
       code:`class HybridRouter:\n    def route(self, task, ctx):\n        # Overrides checked in priority order\n        if ctx.code_is_sensitive:\n            return self.best_local(task.type)\n        if not ctx.internet_available:\n            return self.best_local(task.type)\n        if ctx.monthly_spend_pct > 0.85:\n            return self.best_local(task.type)\n        if not ctx.local_server_healthy:\n            return self.cloud_fallback\n\n        # Apply base routing rule\n        return self._apply_base_rule(task, ctx)`},
      {id:"r3",title:"Cost Estimation",tag:"Economics",tagColor:"#b45309",
       summary:"Track tokens-per-task trend. Rising token count without quality improvement is the primary signal of inefficiency in your AI workflows.",
       bullets:["Input tokens ~3–5× cheaper than output tokens","Small models 10–50× cheaper than frontier models","Local: fixed hardware cost + near-zero per-call","Monthly budget alert triggers at 85% threshold"],
       code:`def estimate_monthly_cost(tasks_per_day, distribution):\n    monthly = 0\n    for task_type, fraction in distribution.items():\n        config = router.route(Task(type=task_type))\n        avg_tokens = AVG_TOKENS[task_type]\n        count = tasks_per_day * 30 * fraction\n        cost = 0 if config.is_local else (\n            (avg_tokens / 1_000_000) * MODEL_PRICES[config.model]\n        )\n        monthly += cost * count\n    return monthly`},
      {id:"r4",title:"Hardware Guide",tag:"VRAM",tagColor:"#0369a1",
       summary:"Match your hardware to the model size you need. The 15% VRAM headroom rule is non-negotiable — the KV cache consumes it during inference.",
       bullets:["RTX 4060 8 GB → 7B models (q4 quantization)","RTX 4080 16 GB → 13B models (full precision)","RTX 4090 24 GB → 33B models (q4 quantization)","Apple M3 Max 96 GB → 70B models comfortably"],
       codeLang:"bash",
       code:`# Pull the right models for your GPU\nollama pull qwen2.5-coder:1.5b  # 1 GB,  <100ms\nollama pull qwen2.5-coder:7b    # 4 GB,  2–5s\nollama pull deepseek-coder:6.7b # 4 GB,  2–5s\n\n# Check available VRAM\nnvidia-smi --query-gpu=memory.used,memory.free --format=csv\n\n# Golden rule: model_size_gb * 1.15 <= available_vram_gb`},
    ],
  },
  {
    id:"observability", nav:"Observability", heading:"Observability & Debugging",
    description:"Visibility into what your agents are doing, how well they're doing it, and what went wrong when they don't. Build this infrastructure from Day 1 — you will need it sooner than you expect.",
    cards:[
      {id:"o1",title:"Essential Metrics",tag:"Monitor",tagColor:"#16a34a",
       summary:"Four metrics that tell you everything about agent health. Configure alerts before you need them — not after the first incident reveals the gap.",
       bullets:["agent.run.success_rate — alert < 0.85 over 1h","agent.tokens.per_task — rising trend = inefficiency","agent.output.acceptance_rate — quality signal","agent.safety_boundary.violations — alert on any"],
       code:`ALERT_RULES = [\n    AlertRule(\n        name="high_failure_rate",\n        condition="success_rate < 0.80 over 1h",\n        severity="high",\n        channels=["slack"]\n    ),\n    AlertRule(\n        name="safety_violation",\n        condition="safety_violations > 0",\n        severity="critical",  # Page immediately\n        channels=["slack", "email", "pagerduty"]\n    ),\n    AlertRule(\n        name="cost_spike",\n        condition="hourly_cost > baseline * 3",\n        severity="medium"\n    ),\n]`},
      {id:"o2",title:"Structured Logging",tag:"Logs",tagColor:"#0369a1",
       summary:"Log every tool call, decision, and model call with full context. Sanitize sensitive data before writing — never log credentials or tokens in arguments.",
       bullets:["log_tool_call(name, args, result, duration_ms)","log_decision(type, options, chosen, reasoning)","log_model_call(provider, model, tokens, cost_usd)","Sanitize args: redact passwords, tokens, API keys"],
       code:`def log_tool_call(self, tool_name, arguments, result, duration_ms):\n    self.backend.write({\n        "event_type":    "tool_call",\n        "timestamp":     datetime.utcnow().isoformat(),\n        "run_id":        self.run_id,\n        "tool_name":     tool_name,\n        "arguments":     self._sanitize(arguments),  # Redact secrets first\n        "success":       result.success,\n        "result_summary":self._summarize(tool_name, result),\n        "duration_ms":   duration_ms,\n    })`},
      {id:"o3",title:"Failure Classification",tag:"Debug",tagColor:"#b91c1c",
       summary:"Classify failures before trying to fix them — each type has a different root cause and a different solution. Treating all failures as prompt problems wastes time.",
       bullets:["TOOL_FAILURE → fix the tool interface or error messages","REASONING_FAILURE → improve prompt or context quality","LOOP_FAILURE → add loop detection + max iteration limit","CONTEXT_FAILURE → improve vector retrieval precision"],
       code:`def classify_failure(timeline):\n    # Tool error rate > 30% = environmental issue\n    error_rate = sum(\n        1 for tc in timeline.tool_calls if not tc["success"]\n    ) / max(1, len(timeline.tool_calls))\n    if error_rate > 0.30:\n        return FailureType.TOOL_FAILURE\n\n    # Same (tool, args) repeated 3+ times = missing exit\n    counts = Counter(\n        (tc["tool_name"], str(tc["arguments"]))\n        for tc in timeline.tool_calls\n    )\n    if any(v >= 3 for v in counts.values()):\n        return FailureType.LOOP_FAILURE\n\n    return FailureType.REASONING_FAILURE`},
      {id:"o4",title:"Evaluation Framework",tag:"Quality",tagColor:"#b45309",
       summary:"Continuous quality measurement across four dimensions. Track trends over time — a single score is a snapshot, a trend is information you can act on.",
       bullets:["TaskCompletionEvaluator — did the task actually finish?","CodeCorrectnessEvaluator — is the generated code right?","EfficiencyEvaluator — steps and tokens vs baseline?","SafetyEvaluator — did the agent stay within its scope?"],
       code:`class CodeCorrectnessEvaluator:\n    async def evaluate(self, run):\n        # Step 1: automated test verification\n        tests = self._extract_test_results(run)\n        if tests and not tests.all_passed:\n            return EvaluatorScore(\n                score=tests.pass_rate * 0.8,\n                passed=False\n            )\n\n        # Step 2: AI evaluation of correctness\n        score = await self._ai_evaluate(run.task, run.generated_code)\n        return EvaluatorScore(\n            score=score,\n            passed=score >= 0.85\n        )`},
    ],
  },
  {
    id:"backup", nav:"Backup", heading:"Backup & Recovery",
    description:"Your AI memory systems represent months of accumulated knowledge. They are production assets that require backup discipline — treat them exactly like you treat your database.",
    cards:[
      {id:"b1",title:"Backup Schedule",tag:"Schedule",tagColor:"#b45309",
       summary:"Minimum viable backup cadence. Every component has a different rebuild cost — the schedule reflects that.",
       bullets:["Hourly: active pipeline state","Daily 03:00: memory systems (incremental only)","Sunday 02:00: full memory + configurations","Monthly: full system snapshot + DR drill"],
       code:`BACKUP_SCHEDULE = {\n    "pipeline_state":     {"frequency": "hourly",   "retention_hours": 48},\n    "memory_incremental": {"frequency": "daily",    "time": "03:00", "retention_days": 7},\n    "memory_full":        {"frequency": "weekly",   "day": "Sunday", "time": "02:00"},\n    "system_full":        {"frequency": "monthly",  "includes_dr_drill": True},\n}`},
      {id:"b2",title:"What to Back Up",tag:"Scope",tagColor:"#16a34a",
       summary:"Not all memory is equal. Episodic memory records past events that cannot be reconstructed. Knowledge base entries are the result of human curation that took significant time.",
       bullets:["Vector DB embeddings + metadata — hours to rebuild","Knowledge base entries — curated, irreplaceable","Episodic memory — past sessions, cannot reconstruct","Prompt library + agent configs — accumulated expertise"],
       code:`async def create_full_backup(backup_id):\n    # Vector DB — hours to rebuild from scratch\n    await storage.save(f"{backup_id}/vector_db/",\n                       vector_store.export_all_collections())\n    # Knowledge base — human-curated, truly irreplaceable\n    await storage.save(f"{backup_id}/knowledge_base/",\n                       knowledge_base.export_all())\n    # Episodic memory — historical records, cannot reconstruct\n    await storage.save(f"{backup_id}/episodic/",\n                       episodic_store.export_all())\n    await storage.save(f"{backup_id}/prompts/",\n                       prompt_library.export())`},
      {id:"b3",title:"Recovery Order",tag:"RTO",tagColor:"#b91c1c",
       summary:"When systems fail, restore in this exact priority order. Stop on any critical component failure — dependencies mean later steps will fail without them.",
       bullets:["1. Memory configurations — minutes to restore","2. Agent configurations — minutes to restore","3. Vector database — hours to restore or rebuild","4. Knowledge base — hours to restore","5. Pipeline state — restore or restart fresh"],
       code:`RECOVERY_ORDER = [\n    ("memory_configs",  "minutes", "critical"),\n    ("agent_configs",   "minutes", "critical"),\n    ("vector_database", "hours",   "high"),\n    ("knowledge_base",  "hours",   "high"),\n    ("pipeline_state",  "variable","medium"),\n]\n\nasync def restore_in_order(backup_id):\n    for name, eta, priority in RECOVERY_ORDER:\n        try:\n            await restore_component(name, backup_id)\n        except RestoreError as e:\n            if priority == "critical":\n                raise  # Stop — later steps depend on this`},
      {id:"b4",title:"DR Drill",tag:"Monthly",tagColor:"#6d28d9",
       summary:"A backup that has never been restored is not a backup — it is a hope. Run this drill monthly in an isolated environment. Document and fix every issue before the next drill.",
       bullets:["Restore to ISOLATED environment — never production","Verify every system is functional post-restore","Measure actual RTO and compare against target","Document issues found and fix before next month"],
       code:`async def run_dr_drill():\n    test_env = await provision_isolated_env()\n    try:\n        start = datetime.now()\n        await restore_to_env(get_latest_backup(), test_env)\n        validation = await verify_all_systems(test_env)\n        rto = (datetime.now() - start).seconds / 60\n        return DRDrillResult(\n            success=validation.all_healthy,\n            rto_met=rto <= TARGET_RTO_MINUTES\n        )\n    finally:\n        await deprovision_env(test_env)  # Always clean up`},
    ],
  },
];

const TOTAL_CARDS = SECTIONS.reduce((acc, s) => acc + s.cards.length, 0);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Page() {
  const [lang, setLang] = useState<L>("en");
  const [section, setSection] = useState("stack");
  const [search, setSearch] = useState("");
  const [openCode, setOpenCode] = useState<string|null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [tocOpen, setTocOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content"|"models"|"prompts"|"calc">("content");
  const [promptCat, setPromptCat] = useState("Code Generation");
  const [vram, setVram] = useState(24);
  const [copiedPrompt, setCopiedPrompt] = useState<number|null>(null);
  const [mounted, setMounted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem("axiom-learned");
      if (s) setLearned(new Set(JSON.parse(s)));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("axiom-learned", JSON.stringify([...learned])); } catch {}
  }, [learned]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setActiveTab("content");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const t = UI[lang];
  const principles = PRINCIPLES[lang];
  const isRTL = lang === "ar";
  const cur = SECTIONS.find((s) => s.id === section)!;

  const allResults = search.trim()
    ? SECTIONS.flatMap((sec) =>
        sec.cards
          .filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.summary.toLowerCase().includes(search.toLowerCase()) ||
            c.bullets.some((b) => b.toLowerCase().includes(search.toLowerCase()))
          )
          .map((c) => ({ ...c, sectionId: sec.id, sectionNav: sec.nav }))
      )
    : [];

  const toggleLearned = (id: string) => {
    setLearned((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const copyPrompt = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const calcResults = QUANT_MODELS.map((m) => {
    const avail = vram * 0.85;
    const fits = { fp16: m.fp16 <= avail, q8: m.q8 <= avail, q6: m.q6 <= avail, q4: m.q4 <= avail };
    const best = fits.fp16 ? "fp16" : fits.q8 ? "q8" : fits.q6 ? "q6" : fits.q4 ? "q4" : null;
    return { ...m, fits, best };
  });

  const promptCategories = [...new Set(PROMPTS.map((p) => p.category))];
  const filteredPrompts = PROMPTS.filter((p) => p.category === promptCat);

  if (!mounted) return null;

  const CardEl = ({ card, sectionId }: { card: Card; sectionId?: string }) => {
    const key = `${sectionId || section}-${card.id}`;
    const isOpen = openCode === key;
    const isLearned = learned.has(card.id);
    return (
      <div className={`card${isOpen ? " card-open" : ""}${isLearned ? " card-learned" : ""}`}>
        <div className="card-top">
          <div className="card-meta">
            <span className="card-tag"
              style={{ color: card.tagColor, borderColor: card.tagColor + "40", background: card.tagColor + "0d" }}>
              {card.tag}
            </span>
            <h2 className="card-title">{card.title}</h2>
            {sectionId && (
              <span className="card-sec-badge">{SECTIONS.find(s=>s.id===sectionId)?.nav}</span>
            )}
          </div>
          <div className="card-actions">
            <button
              className={`learn-btn${isLearned ? " learn-done" : ""}`}
              onClick={() => toggleLearned(card.id)}
              title={isLearned ? t.unlearn : t.learned}
            >{isLearned ? "✓" : "○"}</button>
            {card.code && (
              <button className="code-toggle" onClick={() => setOpenCode(isOpen ? null : key)}>
                {isOpen ? t.close : t.code}
              </button>
            )}
          </div>
        </div>
        <p className="card-summary">{card.summary}</p>
        <ul className="bullets">
          {card.bullets.map((b, j) => <li key={j} className="bullet">{b}</li>)}
        </ul>
        {isOpen && card.code && (
          <CodeBlock code={card.code} lang={card.codeLang || "python"} />
        )}
      </div>
    );
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="root">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="hdr-left">
          <div className="logo-wrap">
            <span className="logo-mark">AI</span>
            <div>
              <div className="logo-name">AI DEVELOPER SETUP</div>
              <div className="logo-sub">{t.sub}</div>
            </div>
          </div>
        </div>

        <div className="hdr-center">
          <div className="search-wrap">
            <span className="search-ico">⌕</span>
            <input ref={searchRef} className="search" type="text"
              placeholder={t.search} value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveTab("content"); }} />
            {search && (
              <button className="search-x" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        <div className="hdr-right">
          <div className="progress-pill">
            <div className="prog-track"><div className="prog-fill" style={{ width:`${(learned.size/TOTAL_CARDS)*100}%` }}/></div>
            <span className="prog-label">{learned.size}/{TOTAL_CARDS}</span>
          </div>
          <button className="ico-btn" onClick={() => setTocOpen(!tocOpen)} title={t.jumpTo}>☰</button>
          <button className="ico-btn" onClick={() => setRulesOpen(!rulesOpen)} title={t.rules}>✦</button>
          <button className="ico-btn" onClick={() => window.print()} title={t.print}>⎙</button>
          <div ref={langRef} style={{ position:"relative" }}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              {LANGS[lang].flag} <span>{lang.toUpperCase()}</span> <span className="chev">▾</span>
            </button>
            {langOpen && (
              <div className="lang-menu">
                {(Object.entries(LANGS) as [L,{flag:string;label:string}][]).map(([k,v]) => (
                  <button key={k} className={`lang-opt${lang===k?" lang-active":""}`}
                    onClick={() => { setLang(k); setLangOpen(false); }}>
                    {v.flag} {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── TOC DRAWER ── */}
      {tocOpen && (
        <div className="drawer">
          <div className="drawer-in">
            <div className="drawer-hd">
              <span className="drawer-ttl">{t.jumpTo}</span>
              <button className="drawer-x" onClick={() => setTocOpen(false)}>✕</button>
            </div>
            <div className="toc-row">
              {SECTIONS.map((sec) => {
                const sl = sec.cards.filter(c => learned.has(c.id)).length;
                return (
                  <button key={sec.id} className="toc-btn"
                    onClick={() => { setSection(sec.id); setActiveTab("content"); setSearch(""); setTocOpen(false); }}>
                    <span className="toc-nav">{sec.nav}</span>
                    <span className="toc-ct">{sl}/{sec.cards.length}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── RULES DRAWER ── */}
      {rulesOpen && (
        <div className="drawer">
          <div className="drawer-in">
            <div className="drawer-hd">
              <span className="drawer-ttl">{t.rules}</span>
              <button className="drawer-x" onClick={() => setRulesOpen(false)}>✕</button>
            </div>
            <div className="rules-grid">
              {principles.map((r, i) => (
                <div key={i} className="rule-row">
                  <span className="rule-n">{String(i+1).padStart(2,"0")}</span>
                  <span className="rule-t">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT ── */}
      <div className="layout">
        <nav className="sidebar">
          {SECTIONS.map((s) => {
            const sl = s.cards.filter(c => learned.has(c.id)).length;
            return (
              <button key={s.id}
                className={`nav-item${section===s.id&&activeTab==="content"?" nav-active":""}`}
                onClick={() => { setSection(s.id); setActiveTab("content"); setSearch(""); }}>
                <span>{s.nav}</span>
                {sl > 0 && <span className="nav-badge">{sl}</span>}
              </button>
            );
          })}
          <div className="nav-sep" />
          <button className={`nav-item${activeTab==="models"?" nav-active":""}`} onClick={() => setActiveTab("models")}>Models</button>
          <button className={`nav-item${activeTab==="prompts"?" nav-active":""}`} onClick={() => setActiveTab("prompts")}>Prompts</button>
          <button className={`nav-item${activeTab==="calc"?" nav-active":""}`} onClick={() => setActiveTab("calc")}>Calc</button>
        </nav>

        <div className="content">

          {/* Global search results */}
          {search.trim() && (
            <div className="content-body">
              <div className="content-hd">
                <div>
                  <h1 className="sec-title">
                    {allResults.length} result{allResults.length!==1?"s":""} for &ldquo;{search}&rdquo;
                  </h1>
                </div>
                <button className="clear-btn" onClick={() => setSearch("")}>Clear search</button>
              </div>
              <div className="cards">
                {allResults.length === 0
                  ? <div className="empty">No results found.</div>
                  : allResults.map(c => <CardEl key={c.id} card={c} sectionId={c.sectionId} />)
                }
              </div>
            </div>
          )}

          {/* Section content */}
          {!search.trim() && activeTab === "content" && (
            <div className="content-body">
              <div className="content-hd">
                <div>
                  <h1 className="sec-title">{cur.heading}</h1>
                  <p className="sec-desc">{cur.description}</p>
                </div>
                <span className="sec-progress">
                  {cur.cards.filter(c=>learned.has(c.id)).length}/{cur.cards.length} {t.progress.toLowerCase()}
                </span>
              </div>
              <div className="cards">
                {cur.cards.map(c => <CardEl key={c.id} card={c} />)}
              </div>
            </div>
          )}

          {/* Model comparison */}
          {!search.trim() && activeTab === "models" && (
            <div className="content-body">
              <div className="content-hd">
                <div>
                  <h1 className="sec-title">Model Comparison</h1>
                  <p className="sec-desc">All major frontier and local coding models in one place. Cloud prices are per million tokens. Local models cost electricity only after hardware investment.</p>
                </div>
                <span className="sec-progress">{MODELS.length} models</span>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Model</th><th>Provider</th><th>Type</th>
                      <th>Context</th><th>Input $/M</th><th>Output $/M</th>
                      <th>Speed</th><th>Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m, i) => (
                      <tr key={i} className={m.type==="local"?"row-local":""}>
                        <td className="td-name">{m.name}</td>
                        <td><span className={`ptag ptag-${m.provider.toLowerCase()}`}>{m.provider}</span></td>
                        <td><span className={`ptag ptag-${m.type}`}>{m.type}</span></td>
                        <td className="td-mono">{m.ctx}</td>
                        <td className="td-mono">{m.input===0?"free":`$${m.input}`}</td>
                        <td className="td-mono">{m.output===0?"free":`$${m.output}`}</td>
                        <td className="td-speed">{m.speed}</td>
                        <td className="td-best">{m.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="tbl-note">Prices per million tokens. Local models cost electricity only after hardware investment.</p>
            </div>
          )}

          {/* Prompts */}
          {!search.trim() && activeTab === "prompts" && (
            <div className="content-body">
              <div className="content-hd">
                <div>
                  <h1 className="sec-title">Prompt Templates</h1>
                  <p className="sec-desc">Copy-ready prompts for the most common AI development tasks. Replace <code className="inline-code">{"{placeholders}"}</code> with your actual context. Each template is designed to produce structured, actionable output.</p>
                </div>
                <div className="cat-row">
                  {promptCategories.map(cat => (
                    <button key={cat}
                      className={`cat-btn${promptCat===cat?" cat-active":""}`}
                      onClick={() => setPromptCat(cat)}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="prompts-grid">
                {filteredPrompts.map((p, i) => (
                  <div key={i} className="prompt-card">
                    <div className="prompt-hd">
                      <span className="prompt-title">{p.title}</span>
                      <button className={`copy-btn-sm${copiedPrompt===i?" copy-done":""}`}
                        onClick={() => copyPrompt(i, p.template)}>
                        {copiedPrompt===i ? `✓ ${t.copied}` : t.copy}
                      </button>
                    </div>
                    <pre className="prompt-pre">{p.template}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calc */}
          {!search.trim() && activeTab === "calc" && (
            <div className="content-body">
              <div className="content-hd">
                <div>
                  <h1 className="sec-title">Quantization Calculator</h1>
                  <p className="sec-desc">Enter your available VRAM and see which models fit at each quantization level. Green means it fits with the required 15% headroom for KV cache. Grey means it does not fit.</p>
                </div>
                <div className="vram-ctl">
                  <label className="vram-lbl">VRAM: <strong>{vram} GB</strong></label>
                  <input type="range" min={4} max={192} step={2} value={vram}
                    onChange={e => setVram(Number(e.target.value))} className="vram-slider" />
                </div>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Model</th><th>Params</th>
                      <th>FP16</th><th>Q8</th><th>Q6</th><th>Q4</th><th>Best Fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcResults.map((m, i) => (
                      <tr key={i}>
                        <td className="td-name">{m.name}</td>
                        <td className="td-mono">{m.params}B</td>
                        {(["fp16","q8","q6","q4"] as const).map(q => (
                          <td key={q} className={`td-mono td-q ${m.fits[q]?"q-fits":"q-no"}`}>
                            {m[q]} GB
                          </td>
                        ))}
                        <td>
                          {m.best
                            ? <span className="best-tag">{m.best}</span>
                            : <span className="no-fit">Too large</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="tbl-note">
                Available for model: <strong>{(vram*0.85).toFixed(1)} GB</strong> ({vram} GB × 85%).
                Remaining 15% reserved for KV cache during inference.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="mob-tabs">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`mob-tab${section===s.id&&activeTab==="content"?" mob-active":""}`}
            onClick={() => { setSection(s.id); setActiveTab("content"); setSearch(""); }}>
            {s.nav}
          </button>
        ))}
        <button className={`mob-tab${activeTab==="models"?" mob-active":""}`} onClick={() => setActiveTab("models")}>Models</button>
        <button className={`mob-tab${activeTab==="prompts"?" mob-active":""}`} onClick={() => setActiveTab("prompts")}>Prompts</button>
        <button className={`mob-tab${activeTab==="calc"?" mob-active":""}`} onClick={() => setActiveTab("calc")}>Calc</button>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 14px; }
        body {
          background: #f7f7f4;
          color: #1b1b18;
          font-family: 'DM Mono', monospace;
          -webkit-font-smoothing: antialiased;
        }
        .root { min-height: 100vh; display: flex; flex-direction: column; }

        /* ── HEADER ── */
        .header {
          display: flex; align-items: center; gap: 14px;
          padding: 0 20px; height: 54px;
          border-bottom: 1px solid #e2e2de;
          background: #f7f7f4;
          position: sticky; top: 0; z-index: 100;
        }
        .hdr-left { flex-shrink: 0; }
        .logo-wrap { display: flex; align-items: center; gap: 10px; }
        .logo-mark {
          width: 32px; height: 32px; background: #1b1b18; color: #f7f7f4;
          border-radius: 7px; display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
          letter-spacing: 0.04em; flex-shrink: 0;
        }
        .logo-name {
          font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
          color: #1b1b18; letter-spacing: 0.06em; line-height: 1;
        }
        .logo-sub { font-size: 10px; color: #999; margin-top: 2px; letter-spacing: 0.02em; }

        .hdr-center { flex: 1; max-width: 400px; }
        .search-wrap { position: relative; display: flex; align-items: center; }
        .search-ico { position: absolute; left: 10px; color: #aaa; font-size: 14px; pointer-events: none; }
        .search {
          width: 100%; padding: 7px 30px 7px 29px;
          border: 1px solid #e2e2de; border-radius: 6px; background: #fff;
          font-family: 'DM Mono', monospace; font-size: 12px; color: #1b1b18;
          outline: none; transition: border-color 0.15s;
        }
        .search:focus { border-color: #1b1b18; }
        .search::placeholder { color: #bbb; }
        .search-x {
          position: absolute; right: 8px; background: none; border: none;
          color: #bbb; cursor: pointer; font-size: 11px;
        }
        .search-x:hover { color: #1b1b18; }

        .hdr-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
        .progress-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px; border: 1px solid #e2e2de; border-radius: 20px; background: #fff;
        }
        .prog-track { width: 44px; height: 3px; background: #eee; border-radius: 2px; overflow: hidden; }
        .prog-fill { height: 100%; background: #16a34a; border-radius: 2px; transition: width 0.3s; }
        .prog-label { font-size: 10px; color: #888; }

        .ico-btn {
          width: 30px; height: 30px; border: 1px solid #e2e2de; border-radius: 6px;
          background: transparent; cursor: pointer; font-size: 13px; color: #888;
          display: flex; align-items: center; justify-content: center; transition: all 0.12s;
        }
        .ico-btn:hover { border-color: #1b1b18; color: #1b1b18; background: #fff; }

        .lang-btn {
          display: flex; align-items: center; gap: 5px; padding: 5px 10px;
          border: 1px solid #e2e2de; border-radius: 6px; background: transparent;
          font-family: 'DM Mono', monospace; font-size: 11px; color: #666;
          cursor: pointer; transition: border-color 0.12s;
        }
        .lang-btn:hover { border-color: #1b1b18; }
        .chev { font-size: 9px; opacity: 0.4; }
        .lang-menu {
          position: absolute; top: calc(100% + 5px); right: 0; z-index: 300;
          background: #fff; border: 1px solid #e2e2de; border-radius: 8px;
          overflow: hidden; min-width: 148px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .lang-opt {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 8px 12px; background: transparent; border: none;
          font-family: 'DM Mono', monospace; font-size: 12px; color: #666;
          cursor: pointer; text-align: left; transition: background 0.1s;
        }
        .lang-opt:hover { background: #f5f5f2; }
        .lang-active { color: #1b1b18; background: #f5f5f2; }

        /* ── DRAWERS ── */
        .drawer { background: #fff; border-bottom: 1px solid #e2e2de; }
        .drawer-in { max-width: 1100px; margin: 0 auto; padding: 16px 20px; }
        .drawer-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .drawer-ttl { font-family: 'Instrument Serif', serif; font-size: 16px; color: #1b1b18; }
        .drawer-x {
          width: 26px; height: 26px; border: 1px solid #e2e2de; border-radius: 5px;
          background: transparent; cursor: pointer; font-size: 11px; color: #888;
          display: flex; align-items: center; justify-content: center;
        }
        .drawer-x:hover { background: #f5f5f2; color: #1b1b18; }
        .toc-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .toc-btn {
          display: flex; align-items: center; gap: 8px; padding: 7px 13px;
          border: 1px solid #e2e2de; border-radius: 6px; background: #f7f7f4;
          font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer; transition: all 0.12s;
        }
        .toc-btn:hover { border-color: #1b1b18; background: #fff; }
        .toc-nav { color: #1b1b18; }
        .toc-ct { color: #999; font-size: 10px; }
        .rules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px,1fr)); gap: 5px; }
        .rule-row {
          display: flex; align-items: baseline; gap: 9px;
          padding: 7px 10px; border-radius: 5px; background: #f7f7f4;
          border: 1px solid #ededea;
        }
        .rule-n { font-size: 10px; color: #bbb; flex-shrink: 0; }
        .rule-t { font-size: 11px; color: #555; line-height: 1.5; }

        /* ── LAYOUT ── */
        .layout { display: flex; flex: 1; height: calc(100vh - 54px); overflow: hidden; }

        .sidebar {
          width: 144px; flex-shrink: 0; padding: 13px 9px;
          border-right: 1px solid #e2e2de; display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; background: #f7f7f4;
        }
        .nav-item {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: 7px 9px; border: none; border-radius: 5px;
          background: transparent; font-family: 'DM Mono', monospace; font-size: 12px;
          color: #888; text-align: left; cursor: pointer; transition: all 0.12s;
        }
        .nav-item:hover { background: #ededea; color: #1b1b18; }
        .nav-active { background: #1b1b18 !important; color: #f7f7f4 !important; }
        .nav-badge {
          font-size: 10px; color: #16a34a; background: #dcfce7;
          border-radius: 10px; padding: 1px 5px; min-width: 18px; text-align: center;
        }
        .nav-active .nav-badge { background: rgba(255,255,255,0.15); color: #86efac; }
        .nav-sep { height: 1px; background: #e2e2de; margin: 5px 0; }

        /* ── CONTENT ── */
        .content { flex: 1; overflow: hidden; min-width: 0; display: flex; flex-direction: column; }
        .content-body { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

        .content-hd {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; padding: 18px 20px 14px;
          border-bottom: 1px solid #e2e2de; flex-shrink: 0; background: #f7f7f4;
        }
        .sec-title {
          font-family: 'Instrument Serif', serif; font-size: 21px;
          font-weight: 400; color: #1b1b18; letter-spacing: -0.01em; margin-bottom: 5px;
        }
        .sec-desc {
          font-size: 12px; color: #777; line-height: 1.65; max-width: 560px;
        }
        .sec-progress { font-size: 11px; color: #16a34a; flex-shrink: 0; margin-top: 4px; }
        .inline-code {
          font-family: 'DM Mono', monospace; font-size: 11px;
          background: #f0f0ec; border: 1px solid #e2e2de;
          border-radius: 3px; padding: 1px 5px; color: #b45309;
        }
        .clear-btn {
          padding: 5px 12px; border: 1px solid #e2e2de; border-radius: 5px;
          background: transparent; font-family: 'DM Mono', monospace; font-size: 11px;
          color: #888; cursor: pointer; flex-shrink: 0; margin-top: 4px;
        }
        .clear-btn:hover { border-color: #1b1b18; color: #1b1b18; }

        /* ── CARDS ── */
        .cards {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
          gap: 1px; background: #e2e2de; overflow-y: auto; flex: 1; align-content: start;
        }
        .card { background: #f7f7f4; padding: 16px 18px; transition: background 0.12s; }
        .card:hover { background: #fff; }
        .card-open { grid-column: 1/-1; background: #fff !important; }
        .card-learned { border-left: 2px solid #16a34a; }

        .card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 10px; margin-bottom: 8px;
        }
        .card-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .card-tag {
          font-size: 10px; padding: 2px 7px; border-radius: 20px;
          border: 1px solid; letter-spacing: 0.03em; flex-shrink: 0;
        }
        .card-title {
          font-family: 'Instrument Serif', serif; font-size: 15px;
          font-weight: 400; color: #1b1b18;
        }
        .card-sec-badge {
          font-size: 10px; color: #bbb; border: 1px solid #e2e2de;
          border-radius: 3px; padding: 1px 5px;
        }
        .card-actions { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .learn-btn {
          width: 26px; height: 26px; border: 1px solid #e2e2de; border-radius: 5px;
          background: transparent; cursor: pointer; font-size: 12px; color: #ccc;
          display: flex; align-items: center; justify-content: center; transition: all 0.12s;
        }
        .learn-btn:hover { border-color: #16a34a; color: #16a34a; }
        .learn-done { border-color: #16a34a !important; color: #16a34a !important; background: #f0fdf4 !important; }
        .code-toggle {
          flex-shrink: 0; padding: 4px 10px; border: 1px solid #e2e2de; border-radius: 5px;
          background: transparent; font-family: 'DM Mono', monospace; font-size: 11px;
          color: #888; cursor: pointer; transition: all 0.12s; white-space: nowrap;
        }
        .code-toggle:hover { border-color: #1b1b18; color: #1b1b18; }

        .card-summary { font-size: 12px; color: #666; line-height: 1.65; margin-bottom: 11px; }
        .bullets { list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .bullet { font-size: 11px; color: #444; line-height: 1.5; padding-left: 13px; position: relative; }
        .bullet::before { content: "–"; position: absolute; left: 0; color: #bbb; }

        /* ── SYNTAX HIGHLIGHTED CODE BLOCK ── */
        .code-block {
          margin-top: 14px; border: 1px solid #2a2a28; border-radius: 8px;
          overflow: hidden; background: #1a1a18;
        }
        .code-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 13px; border-bottom: 1px solid #2a2a28; background: #1e1e1c;
        }
        .code-dots { display: flex; gap: 5px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-r { background: #ff5f57; }
        .dot-y { background: #febc2e; }
        .dot-g { background: #28c840; }
        .code-lang-tag { font-size: 10px; color: #555; letter-spacing: 0.15em; text-transform: uppercase; flex: 1; }
        .copy-btn {
          font-family: 'DM Mono', monospace; font-size: 11px; color: #666;
          background: transparent; border: none; cursor: pointer;
          transition: color 0.15s; letter-spacing: 0.04em;
        }
        .copy-btn:hover { color: #bbb; }
        .copy-done { color: #6ee7b7 !important; }

        .code-pre {
          padding: 16px; overflow-x: auto; font-family: 'DM Mono', monospace;
          font-size: 11.5px; line-height: 1.8; white-space: pre; tab-size: 4;
          background: #1a1a18;
        }

        /* ── SYNTAX TOKENS ── */
        .tok-keyword  { color: #c792ea; }
        .tok-builtin  { color: #82aaff; }
        .tok-string   { color: #c3e88d; }
        .tok-comment  { color: #546e7a; font-style: italic; }
        .tok-number   { color: #f78c6c; }
        .tok-decorator{ color: #ffcb6b; }
        .tok-funcname { color: #82aaff; }
        .tok-shell    { color: #89ddff; }
        .tok-flag     { color: #89ddff; }
        .tok-op       { color: #89ddff; }

        /* ── EMPTY ── */
        .empty { padding: 40px 20px; color: #bbb; font-size: 13px; grid-column: 1/-1; }

        /* ── TABLE ── */
        .tbl-wrap { overflow: auto; flex: 1; padding: 0 20px 20px; }
        .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
        .tbl th {
          text-align: left; padding: 10px 12px;
          border-bottom: 2px solid #e2e2de; color: #888; font-weight: 400; letter-spacing: 0.04em;
        }
        .tbl td { padding: 9px 12px; border-bottom: 1px solid #ededea; vertical-align: middle; }
        .tbl tr:hover td { background: #fff; }
        .row-local td { background: #fafaf6; }
        .td-name { font-weight: 500; color: #1b1b18; white-space: nowrap; }
        .td-mono { font-variant-numeric: tabular-nums; color: #555; }
        .td-speed { color: #888; }
        .td-best { color: #555; }
        .ptag {
          font-size: 10px; padding: 2px 7px; border-radius: 20px; border: 1px solid transparent;
        }
        .ptag-anthropic { color: #b45309; border-color: #fde68a; background: #fffbeb; }
        .ptag-openai { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }
        .ptag-google { color: #0369a1; border-color: #bae6fd; background: #f0f9ff; }
        .ptag-local { color: #6d28d9; border-color: #ddd6fe; background: #faf5ff; }
        .ptag-cloud { color: #0369a1; border-color: #bae6fd; background: #f0f9ff; }
        .td-q { font-size: 11px; }
        .q-fits { color: #16a34a; font-weight: 500; }
        .q-no { color: #ccc; }
        .best-tag {
          font-size: 10px; padding: 2px 8px; border-radius: 20px;
          background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-weight: 500;
        }
        .no-fit { font-size: 11px; color: #ddd; }
        .tbl-note { font-size: 11px; color: #999; padding: 10px 20px 16px; }

        /* ── VRAM ── */
        .vram-ctl { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .vram-lbl { font-size: 12px; color: #666; white-space: nowrap; }
        .vram-lbl strong { color: #1b1b18; }
        .vram-slider { width: 160px; accent-color: #1b1b18; cursor: pointer; }

        /* ── PROMPTS ── */
        .cat-row { display: flex; gap: 5px; flex-wrap: wrap; }
        .cat-btn {
          padding: 5px 12px; border: 1px solid #e2e2de; border-radius: 20px;
          background: transparent; font-family: 'DM Mono', monospace; font-size: 11px;
          color: #888; cursor: pointer; transition: all 0.12s;
        }
        .cat-btn:hover { border-color: #1b1b18; color: #1b1b18; }
        .cat-active { background: #1b1b18 !important; color: #f7f7f4 !important; border-color: #1b1b18 !important; }
        .prompts-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(440px,1fr));
          gap: 1px; background: #e2e2de; overflow-y: auto; flex: 1;
        }
        .prompt-card { background: #f7f7f4; padding: 16px 18px; }
        .prompt-card:hover { background: #fff; }
        .prompt-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .prompt-title { font-family: 'Instrument Serif', serif; font-size: 15px; color: #1b1b18; }
        .copy-btn-sm {
          font-family: 'DM Mono', monospace; font-size: 11px; color: #888;
          padding: 4px 10px; border: 1px solid #e2e2de; border-radius: 5px;
          background: transparent; cursor: pointer; transition: all 0.12s; white-space: nowrap;
        }
        .copy-btn-sm:hover { border-color: #1b1b18; color: #1b1b18; }
        .prompt-pre {
          font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.7;
          color: #555; white-space: pre-wrap; word-break: break-word;
          background: #fff; border: 1px solid #e2e2de; border-radius: 6px;
          padding: 12px 14px; max-height: 300px; overflow-y: auto;
        }

        /* ── MOBILE TABS ── */
        .mob-tabs {
          display: none; position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid #e2e2de;
          padding: 6px 8px 10px; gap: 2px; overflow-x: auto; z-index: 200;
          -webkit-overflow-scrolling: touch;
        }
        .mob-tab {
          flex-shrink: 0; padding: 6px 11px; border: none; border-radius: 5px;
          background: transparent; font-family: 'DM Mono', monospace; font-size: 11px;
          color: #888; cursor: pointer; white-space: nowrap;
        }
        .mob-active { background: #1b1b18 !important; color: #f7f7f4 !important; }

        /* ── RTL ── */
        [dir="rtl"] .sidebar { border-right: none; border-left: 1px solid #e2e2de; }
        [dir="rtl"] .nav-item { text-align: right; }
        [dir="rtl"] .bullet { padding-left: 0; padding-right: 13px; }
        [dir="rtl"] .bullet::before { left: auto; right: 0; }
        [dir="rtl"] .lang-menu { right: auto; left: 0; }
        [dir="rtl"] .card-learned { border-left: none; border-right: 2px solid #16a34a; }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

        /* ── PRINT ── */
        @media print {
          .header, .sidebar, .mob-tabs, .drawer, .code-toggle,
          .card-actions, .hdr-right, .progress-pill { display: none !important; }
          .layout { height: auto; display: block; }
          .content { overflow: visible; }
          .content-body { overflow: visible; }
          .cards { display: block; background: none; }
          .card { break-inside: avoid; border: 1px solid #e2e2de; margin-bottom: 8px; border-radius: 6px; }
          .code-block { display: none; }
          .sec-desc { color: #555; }
          body { background: #fff; }
          @page { margin: 1.5cm; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mob-tabs { display: flex; }
          .layout { height: calc(100vh - 54px - 52px); }
          .hdr-center { display: none; }
          .cards { grid-template-columns: 1fr; }
          .prompts-grid { grid-template-columns: 1fr; }
          .progress-pill { display: none; }
        }
        @media (max-width: 480px) {
          .header { padding: 0 12px; gap: 8px; }
          .logo-sub { display: none; }
        }
      `}</style>
    </div>
  );
}