"use client";
import { useState, useEffect, useRef } from "react";

// ── LANGUAGES ─────────────────────────────────────────────────────────────────
const LANGS = {
  en: { flag: "🇺🇸", label: "English" },
  es: { flag: "🇪🇸", label: "Español" },
  pt: { flag: "🇧🇷", label: "Português" },
  fr: { flag: "🇫🇷", label: "Français" },
  de: { flag: "🇩🇪", label: "Deutsch" },
  ja: { flag: "🇯🇵", label: "日本語" },
  zh: { flag: "🇨🇳", label: "中文" },
  ko: { flag: "🇰🇷", label: "한국어" },
  ar: { flag: "🇸🇦", label: "العربية" },
  hi: { flag: "🇮🇳", label: "हिन्दी" },
};
type L = keyof typeof LANGS;

const T: Record<L, { sub: string; search: string; rules: string; code: string; copy: string; copied: string; close: string }> = {
  en: { sub:"AI Developer Reference · 2026", search:"Search cards…", rules:"Core Principles", code:"View code", copy:"Copy", copied:"Copied", close:"Close" },
  es: { sub:"Referencia para Desarrolladores IA · 2026", search:"Buscar…", rules:"Principios Clave", code:"Ver código", copy:"Copiar", copied:"Copiado", close:"Cerrar" },
  pt: { sub:"Referência para Desenvolvedores IA · 2026", search:"Pesquisar…", rules:"Princípios", code:"Ver código", copy:"Copiar", copied:"Copiado", close:"Fechar" },
  fr: { sub:"Référence Développeurs IA · 2026", search:"Rechercher…", rules:"Principes", code:"Voir le code", copy:"Copier", copied:"Copié", close:"Fermer" },
  de: { sub:"KI-Entwickler Referenz · 2026", search:"Suchen…", rules:"Grundregeln", code:"Code anzeigen", copy:"Kopieren", copied:"Kopiert", close:"Schließen" },
  ja: { sub:"AI開発者リファレンス · 2026", search:"検索…", rules:"基本原則", code:"コードを見る", copy:"コピー", copied:"完了", close:"閉じる" },
  zh: { sub:"AI开发者参考手册 · 2026", search:"搜索…", rules:"核心原则", code:"查看代码", copy:"复制", copied:"已复制", close:"关闭" },
  ko: { sub:"AI 개발자 레퍼런스 · 2026", search:"검색…", rules:"핵심 원칙", code:"코드 보기", copy:"복사", copied:"완료", close:"닫기" },
  ar: { sub:"مرجع مطوري الذكاء الاصطناعي · 2026", search:"بحث…", rules:"المبادئ الأساسية", code:"عرض الكود", copy:"نسخ", copied:"تم", close:"إغلاق" },
  hi: { sub:"AI डेवलपर रेफरेंस · 2026", search:"खोजें…", rules:"मुख्य सिद्धांत", code:"कोड देखें", copy:"कॉपी", copied:"हो गया", close:"बंद करें" },
};

const RULES: Record<L, string[]> = {
  en:["Read before write — always","Test baseline before refactoring","Verify after every action","Max 3 retries, then escalate","Security agent is read-only","dry_run=True on infrastructure","15% VRAM headroom always","Spec first, generate second","Local for volume, cloud for complexity","Every backup needs a tested restore","Quality gates at every handoff","Compound your prompt library daily"],
  es:["Leer antes de escribir — siempre","Probar baseline antes de refactorizar","Verificar después de cada acción","Máx 3 reintentos, luego escalar","El agente de seguridad es solo-lectura","dry_run=True en infraestructura","15% headroom de VRAM siempre","Especificar primero, generar segundo","Local para volumen, cloud para complejidad","Todo backup necesita restauración probada","Gates de calidad en cada handoff","Acumula tu biblioteca de prompts diario"],
  pt:["Ler antes de escrever — sempre","Testar baseline antes de refatorar","Verificar após cada ação","Máx 3 tentativas, depois escalar","Agente de segurança é somente-leitura","dry_run=True na infraestrutura","15% headroom de VRAM sempre","Especificar primeiro, gerar segundo","Local para volume, cloud para complexidade","Todo backup precisa de restore testado","Gates de qualidade em cada handoff","Acumule sua biblioteca de prompts diariamente"],
  fr:["Lire avant d'écrire — toujours","Tester la baseline avant refactoring","Vérifier après chaque action","Max 3 tentatives, puis escalader","L'agent sécurité est en lecture seule","dry_run=True sur l'infrastructure","15% de marge VRAM toujours","Spécifier d'abord, générer ensuite","Local pour le volume, cloud pour la complexité","Tout backup doit avoir un restore testé","Portes qualité à chaque handoff","Enrichis ta bibliothèque de prompts quotidiennement"],
  de:["Lesen vor Schreiben — immer","Baseline testen vor Refactoring","Nach jeder Aktion verifizieren","Max 3 Versuche, dann eskalieren","Security-Agent ist schreibgeschützt","dry_run=True bei Infrastruktur","15% VRAM-Puffer immer einhalten","Erst spezifizieren, dann generieren","Lokal für Volumen, Cloud für Komplexität","Jedes Backup braucht getestete Wiederherstellung","Qualitätsgates bei jedem Übergabepunkt","Prompt-Bibliothek täglich erweitern"],
  ja:["書く前に必ず読む","リファクタリング前にベースラインテスト","すべての操作後に検証する","最大3回リトライ、その後エスカレート","セキュリティエージェントは読み取り専用","インフラはdry_run=Trueを必ず使用","VRAMは15%のヘッドルームを確保","まず仕様、次に生成","量はローカル、複雑さはクラウド","バックアップは必ずリストアをテスト","全ハンドオフに品質ゲートを設置","プロンプトライブラリを毎日積み上げる"],
  zh:["写之前先读 — 永远如此","重构前先测试基线","每次操作后验证","最多重试3次，然后上报","安全智能体只读","基础设施操作使用dry_run=True","始终保留15% VRAM余量","先规范，后生成","量用本地，复杂度用云端","每个备份都需要测试过的恢复","每次交接都设质量门控","每天积累提示词库"],
  ko:["쓰기 전에 반드시 읽기","리팩터링 전 베이스라인 테스트","모든 작업 후 검증하기","최대 3회 재시도, 그 후 에스컬레이션","보안 에이전트는 읽기 전용","인프라에 dry_run=True 필수","항상 VRAM 15% 여유 확보","먼저 명세, 그 다음 생성","볼륨은 로컬, 복잡성은 클라우드","모든 백업은 복구 테스트가 필요","모든 핸드오프에 품질 게이트","매일 프롬프트 라이브러리 축적"],
  ar:["اقرأ قبل الكتابة — دائماً","اختبر الخط الأساسي قبل إعادة البناء","تحقق بعد كل إجراء","ثلاث محاولات كحد أقصى، ثم تصعيد","عميل الأمان للقراءة فقط دائماً","استخدم dry_run=True في البنية التحتية","احتفظ دائماً بـ 15% هامش VRAM","المواصفات أولاً، ثم التوليد","محلي للحجم، سحابي للتعقيد","كل نسخة احتياطية تحتاج اختبار استعادة","بوابات الجودة عند كل تسليم","راكم مكتبة المحفزات يومياً"],
  hi:["लिखने से पहले पढ़ें — हमेशा","रिफैक्टरिंग से पहले बेसलाइन टेस्ट","हर एक्शन के बाद वेरिफाई करें","अधिकतम 3 रीट्राई, फिर एस्केलेट","सिक्योरिटी एजेंट सिर्फ रीड-ओनली","इन्फ्रा पर dry_run=True जरूरी","हमेशा 15% VRAM हेडरूम रखें","पहले स्पेक, फिर जेनरेट","वॉल्यूम लोकल, कॉम्प्लेक्सिटी क्लाउड","हर बैकअप का रिस्टोर टेस्ट जरूरी","हर हैंडऑफ पर क्वालिटी गेट्स","प्रॉम्प्ट लाइब्रेरी रोज बढ़ाएं"],
};

// ── DATA ──────────────────────────────────────────────────────────────────────
type Card = { title: string; tag: string; tagColor: string; summary: string; bullets: string[]; code?: string };
type Section = { id: string; nav: string; heading: string; cards: Card[] };

const SECTIONS: Section[] = [
  {
    id:"stack", nav:"Stack", heading:"The AI Developer Stack",
    cards:[
      { title:"Frontier Models", tag:"Cloud", tagColor:"#16a34a",
        summary:"Use for complex reasoning, architecture decisions, and security analysis.",
        bullets:["Claude Sonnet 4 / Opus 4","GPT-4o / o3","Gemini Ultra 2.0","Best for: architecture, security, novel algorithms"],
        code:`import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Analyze this architecture"}
    ]
)

print(message.content[0].text)` },
      { title:"Local Models", tag:"Local", tagColor:"#b45309",
        summary:"Privacy-sensitive code, sub-100ms completion, cost control at volume.",
        bullets:["qwen2.5-coder:7b — best quality/speed","deepseek-coder:6.7b — complex tasks","qwen2.5-coder:1.5b — <100ms completions","deepseek-coder:33b — near-frontier (24 GB VRAM)"],
        code:`# Install and run locally
curl -fsSL https://ollama.ai/install.sh | sh

ollama pull qwen2.5-coder:7b
ollama pull qwen2.5-coder:1.5b

# Drop-in OpenAI-compatible endpoint
# http://localhost:11434/v1  (no key needed)

from openai import OpenAI
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="local"
)` },
      { title:"Serving Layer", tag:"Infra", tagColor:"#6d28d9",
        summary:"Choose by need: Ollama for simplicity, vLLM for throughput, llama.cpp for control.",
        bullets:["Ollama — zero config, start here","vLLM — team sharing, PagedAttention","llama.cpp — fine-grained parameter control","LM Studio — GUI model management"],
        code:`# vLLM for shared team use
pip install vllm

python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/deepseek-coder-6.7b-instruct \
  --tensor-parallel-size 2 \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 32768` },
      { title:"Quantization", tag:"VRAM", tagColor:"#0369a1",
        summary:"q4_k_m is the sweet spot — 95% quality at 25% of FP16 size.",
        bullets:["q8_0 — 99% quality, 50% size","q6_k — 98% quality, 37% size","q4_k_m — 95% quality, 25% size ← use this","q3_k_m — 88% quality, last resort"],
        code:`# VRAM guide
# Model  │ FP16   │ q8    │ q4_k_m
# 7B     │ 14 GB  │ 7 GB  │ 4 GB
# 13B    │ 26 GB  │ 13 GB │ 7 GB
# 33B    │ 66 GB  │ 33 GB │ 18 GB
# 70B    │ 140 GB │ 70 GB │ 38 GB

# Rule: always keep 15% VRAM headroom
# required = model_size_gb * 1.15` },
    ],
  },
  {
    id:"agents", nav:"Agents", heading:"The Agent Team",
    cards:[
      { title:"Architect Agent", tag:"Design", tagColor:"#6d28d9",
        summary:"Structural decisions and feature design. Always reads actual code before forming conclusions.",
        bullets:["analyze_architecture() — monthly full scan","design_feature(spec) — before any implementation","review_architectural_change(diff) — per PR","detect_architectural_drift() — ADRs vs reality"],
        code:`class ArchitectAgent:
    SYSTEM_PROMPT = """
    You are a senior software architect.
    ALWAYS read actual code before conclusions.
    Prefer simplicity. Make dependencies explicit.
    Design for change — requirements will evolve.
    """

    async def design_feature(self, spec):
        arch = self.intelligence.architecture.render()
        similar = self.semantic_index.search(
            spec.description, n=5
        )
        return await self.model.complete(
            self._design_prompt(spec, arch, similar),
            max_tokens=5000
        )` },
      { title:"Security Agent", tag:"Read-only", tagColor:"#b91c1c",
        summary:"Identifies and explains vulnerabilities. Never modifies code. Ever.",
        bullets:["audit_pull_request(diff) — every PR","scan_for_secrets(diff) — pattern scan","run_scheduled_scan() — weekly full audit","OWASP Top 10 checked per language"],
        code:`class SecurityAgent:
    CAN_WRITE = False  # Enforced at tool layer

    SECRET_PATTERNS = [
        (r'(?i)(password)\\s*=\\s*["\'][^"\']{4,}',
         "Hardcoded password"),
        (r'sk-[a-zA-Z0-9]{20,}', "OpenAI key"),
        (r'ghp_[a-zA-Z0-9]{36}', "GitHub token"),
        (r'-----BEGIN.*PRIVATE KEY-----',
         "Private key"),
    ]

    # Only report issues PRESENT in changed code
    # Severity: critical | high | medium | low` },
      { title:"Testing Agent", tag:"Quality", tagColor:"#16a34a",
        summary:"Generates tests then runs mutation testing to verify they actually catch bugs.",
        bullets:["generate_test_suite(unit) — comprehensive","run_mutation_testing() — target score > 0.80","identify_coverage_gaps() — by fan-in priority","test_<fn>_<scenario>_<expected> naming"],
        code:`async def generate_and_verify(self, unit):
    tests = await self._generate_tests(unit)

    # Tests must PASS on correct code
    result = await self.runner.run(tests)
    assert result.all_passed

    # Tests must FAIL on mutated code
    for mutation in self._generate_mutations(unit):
        self._apply(mutation)
        result = await self.runner.run(tests)
        self._revert(mutation)
        if not result.has_failures:
            # Strengthen the weak test
            await self._improve_test_for(mutation)` },
      { title:"Refactoring Agent", tag:"Safe", tagColor:"#b45309",
        summary:"Never changes external behavior. Tests first, small steps, auto-reverts on failure.",
        bullets:["run_targeted_refactoring() — complexity","run_duplicate_consolidation() — semantic sim","run_naming_improvement() — low-risk auto","Auto-reverts if any test fails"],
        code:`async def refactor_safely(self, target):
    covering = self._get_covering_tests(target)
    if not covering:
        await self._write_tests_first(target)

    baseline = await self.tools.run_tests(covering)
    if not baseline.all_passed:
        raise RefactoringError(
            "Fix tests BEFORE refactoring"
        )

    for step in self._plan_steps(target):
        self._apply(step)
        if not (await self.tools.run_tests(covering)).all_passed:
            self._revert(step)  # Always revert` },
      { title:"DevOps Agent", tag:"Ops", tagColor:"#0369a1",
        summary:"Deployments with canary monitoring, incident investigation, pipeline optimization.",
        bullets:["manage_deployment() — pre+post validation","investigate_incident() — metrics+logs+AI","optimize_pipeline() — bottleneck analysis","Canary monitoring, auto-rollback on failure"],
        code:`async def deploy_safely(self, spec, env):
    readiness = await self._assess_readiness(
        spec, env
    )
    if not readiness.ready:
        return DeploymentResult.blocked(
            readiness.blocking_reasons
        )

    deployment = await self._execute(spec, env)

    if env == "production":
        canary = await self._monitor_canary(
            deployment, minutes=15
        )
        if not canary.healthy:
            await self._rollback(deployment)
            return DeploymentResult.rolled_back()` },
      { title:"Documentation Agent", tag:"Write", tagColor:"#b45309",
        summary:"Generates accurate docs from actual code behavior. Weekly drift detection.",
        bullets:["document_module() — docstrings + overview","detect_and_fix_drift() — weekly run","generate_readme() — from project structure","generate_changelog() — from git history"],
        code:`async def generate_accurate_docstring(self, unit):
    # Read the code FIRST — always
    source = await self.tools.read_file(
        unit.file_path,
        unit.start_line,
        unit.end_line
    )
    examples = self._find_usage_examples(unit)

    # Describe what it ACTUALLY does
    prompt = (
        f"Read carefully before writing:\\n{source}\\n"
        f"Describe actual behavior. Examples:\\n"
        f"{examples}"
    )
    return await self.model.complete(prompt)` },
    ],
  },
  {
    id:"tools", nav:"Tools", heading:"Tool Library",
    cards:[
      { title:"File System", tag:"FS", tagColor:"#16a34a",
        summary:"Always read before write. Use edit_file for targeted changes — smaller blast radius.",
        bullets:["read_file(path, start?, end?) → numbered lines","write_file(path, content, backup=True)","edit_file(path, old_content, new_content)","search_files(query, path?, pattern?)"],
        code:`# Rule: always read before modifying
current = tools.read_file("src/auth/service.py")

# Use edit_file, not write_file for modifications
result = tools.edit_file(
    path="src/auth/service.py",
    old_content="return True  # Bug: wrong return",
    new_content="return False"
)

assert result.success, f"Edit failed: {result.error}"

# All paths scoped to repo root — never /etc or ~/.ssh` },
      { title:"Execution", tag:"Exec", tagColor:"#b91c1c",
        summary:"Allowlist-validated commands. Hard timeout enforced. Returns structured results.",
        bullets:["run_command(cmd, timeout=60) → stdout+stderr+exit","run_tests(path?, filter?) → structured per-test","run_linter(path?, fix=False) → violations + lines","run_coverage(path?) → per-file coverage %"],
        code:`result = tools.run_tests(
    test_path="tests/test_auth.py",
    test_filter="test_token_validation",
    timeout_seconds=60
)

# Structured output — not raw terminal text
# result.passed  → ["test_valid_token", ...]
# result.failed  → [FailedTest(name, msg, tb)]
# result.all_passed → bool

if not result.all_passed:
    for f in result.failed:
        print(f"{f.name}: {f.traceback[-1]}")` },
      { title:"Git Workflow", tag:"VCS", tagColor:"#6d28d9",
        summary:"Full workflow. Never force push. Never commit directly to main.",
        bullets:["git_status() / git_diff() / git_log() / git_blame()","git_create_branch(name) — always branch first","git_add(paths) + git_commit(message)","create_pull_request(title, body, reviewers)"],
        code:`async def implement_and_pr(task):
    await tools.git_create_branch(f"feat/{task.slug}")

    # ... make changes ...

    await tools.git_status()   # what changed?
    await tools.git_diff()     # review before staging

    # Stage specific files, not git add .
    await tools.git_add([
        "src/auth/middleware.py",
        "tests/test_auth.py"
    ])

    await tools.git_commit(
        "fix: expired tokens now correctly rejected"
    )
    await tools.git_push()
    return await tools.create_pull_request(...)` },
      { title:"Container + K8s", tag:"Docker", tagColor:"#0369a1",
        summary:"dry_run=True by default on kubectl. Reviewing the preview is not optional.",
        bullets:["docker_build(context, tag) — verify CI builds","docker_compose_up(file, wait=True) — local stack","kubectl_apply(manifest, dry_run=True) — default","kubectl_rollout_status(deployment) — verify after"],
        code:`# Always preview infrastructure changes first
preview = await tools.kubectl_apply(
    manifest_path="k8s/deployment.yaml",
    dry_run=True  # Non-negotiable default
)
print(f"Would modify: {preview.resources}")

# Explicit opt-in required to apply
if human_approved:
    await tools.kubectl_apply(
        manifest_path="k8s/deployment.yaml",
        dry_run=False
    )
    await tools.kubectl_rollout_status(
        deployment="my-service",
        timeout_seconds=300
    )` },
    ],
  },
  {
    id:"memory", nav:"Memory", heading:"Memory Systems",
    cards:[
      { title:"Context Architecture", tag:"Session", tagColor:"#b45309",
        summary:"Four regions: persistent (system prompt), task, retrieved (vector DB), working.",
        bullets:["Persistent: system prompt + conventions (500–1500 tk)","Retrieved: auto-assembled per task via vector DB","Compress completed phases: 5 000 → 300 tokens","Checkpoint long sessions for resumability"],
        code:`def assemble_context(task, budget=12000):
    ctx = AssembledContext()
    remaining = budget

    # 1. Always: system prompt
    ctx.add(intelligence.system_prompt)
    remaining -= count_tokens(intelligence.system_prompt)

    # 2. Semantic retrieval
    for result in semantic_index.search(
        task.description, n=10
    ):
        tokens = count_tokens(result.content)
        if tokens <= remaining * 0.4:
            ctx.add(result)
            remaining -= tokens

    # 3. Recent file changes
    ctx.add(change_model.get_recent(task.files, days=14))
    return ctx.trim_to_budget(budget)` },
      { title:"Long-Term Memory Types", tag:"Persist", tagColor:"#6d28d9",
        summary:"Four types, each with a different retrieval pattern.",
        bullets:["Episodic — past sessions, immutable records","Semantic — what modules do, how they relate","Procedural — which prompts/workflows work best","Preference — how you consistently correct output"],
        code:`@dataclass
class EpisodicMemory:
    session_id:      str
    task_type:       str
    task_description:str
    outcome:         str   # success | failure | escalated
    approach_taken:  str
    what_worked:     List[str]
    what_failed:     List[str]
    key_insights:    List[str]
    embedding:       List[float]
    timestamp:       datetime

    # Rule: episodic memories are NEVER updated.
    # New experiences create new memories.` },
      { title:"Vector Database", tag:"Search", tagColor:"#16a34a",
        summary:"Semantic code retrieval. Index at function level. Update on every commit via git hooks.",
        bullets:["Chroma — local dev, zero infra (start here)","Qdrant — rich metadata filtering at scale","Index at function/class level, not file","Hybrid: semantic + BM25 → RRF merge"],
        code:`import chromadb

client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory=".ai_memory/vectors"
))
collection = client.get_or_create_collection(
    "codebase",
    metadata={"hnsw:space": "cosine"}
)

for unit in parsed_file.units:
    embedding = embedder.embed(
        f"# {unit.unit_type}: {unit.qualified_name}\n"
        f"{unit.full_source}"
    )
    collection.upsert(
        ids=[f"unit:{unit.file_path}:{unit.name}"],
        embeddings=[embedding],
        documents=[unit.full_source],
        metadatas=[{"path": unit.file_path}]
    )` },
      { title:"Knowledge Graph", tag:"Graph", tagColor:"#b91c1c",
        summary:"Code relationships. Run impact analysis before every change.",
        bullets:["Nodes: Module, Class, Function, Table, Service","Edges: CALLS, IMPORTS, INHERITS, TESTS, DEPENDS_ON","get_impact_analysis(fn) — before every refactor","find_circular_dependencies() — architecture health"],
        code:`# Before ANY refactoring
impact = graph.query("""
  MATCH (changed:Function {name: $fn})
  MATCH path =
    (caller)-[:CALLS*1..5]->(changed)
  RETURN caller.name,
         caller.path,
         length(path) as depth
  ORDER BY depth
""", fn="validate_token")

print(
    f"Changing this affects "
    f"{len(impact)} callers"
)` },
    ],
  },
  {
    id:"pipelines", nav:"Pipelines", heading:"Automation Pipelines",
    cards:[
      { title:"Feature Pipeline", tag:"End-to-end", tagColor:"#16a34a",
        summary:"Spec → PR. Architecture first, tests before implementation, parallel reviews.",
        bullets:["Stage 1: Architecture planning","Stage 2: Test specification (TDD)","Stage 3: Implement + verify loop (max 3 iter)","Stage 4: Parallel security + quality review","Stage 5: Documentation","Stage 6: PR creation"],
        code:`async def feature_pipeline(spec):
    design = await architect.design_feature(spec)
    if design.has_blocking_risks:
        return needs_human_review(design.risks)

    # Tests BEFORE implementation
    test_spec = await testing.create_test_spec(spec)

    # Implement with verification loop
    impl = await implement_with_loop(
        design, test_spec, max_iterations=3
    )

    # Parallel reviews — faster than sequential
    security, arch, coverage = await asyncio.gather(
        security_agent.audit(impl.diff),
        architect.review_change(impl.diff),
        testing.verify_coverage(impl)
    )
    if any_blockers(security, arch, coverage):
        return needs_human_review()

    docs = await documentation.document(impl)
    return await create_pr(impl, docs)` },
      { title:"Nightly Improvements", tag:"Scheduled", tagColor:"#b45309",
        summary:"Runs while you sleep. Small focused PRs ready each morning.",
        bullets:["02:00 — Refactoring: top 5 complexity issues","03:00 — Tests: coverage gaps by fan-in","04:00 Sun — Documentation drift fix","09:00 Mon — Dependency security audit","Monthly — Architecture drift vs ADRs"],
        code:`SCHEDULE = [
    ScheduledTask(
        cron="0 2 * * *",
        agent="refactoring",
        config={
            "max_changes_per_night": 5,
            "risk_threshold": "low"
        }
    ),
    ScheduledTask(
        cron="0 3 * * *",
        agent="testing",
        config={"target_coverage": 0.85}
    ),
    ScheduledTask(
        cron="0 4 * * 0",  # Sunday
        agent="documentation",
        action="detect_and_fix_drift"
    ),
]` },
      { title:"Quality Gates", tag:"Required", tagColor:"#b91c1c",
        summary:"Blocking gates at every handoff. No exceptions. No bypass.",
        bullets:["Gate 1: Syntax + types — blocking","Gate 2: All tests pass — blocking","Gate 3: No critical security — blocking","Gate 4: No linting violations — blocking","Gate 5: Coverage ≥ 80% — warning only"],
        code:`GATES = [
    Gate(
        name="syntax_types",
        check=lambda i: i.passes_type_check,
        blocking=True
    ),
    Gate(
        name="tests_pass",
        check=lambda i: i.test_results.all_passed,
        blocking=True
    ),
    Gate(
        name="no_critical_security",
        check=lambda i: i.security.critical_count == 0,
        blocking=True
    ),
    Gate(
        name="coverage",
        check=lambda i: i.coverage >= 0.80,
        blocking=False  # Warning only
    ),
]` },
      { title:"AI-Augmented CI", tag:"CI", tagColor:"#0369a1",
        summary:"Every commit gets structural impact analysis, not just linting.",
        bullets:["Impact analysis — what could this break?","Smart test selection — relevant tests only","AI review — security + quality parallel","Performance regression detection"],
        code:`async def ai_ci(commit):
    # Understand structural impact, not just diff
    impact = await analyze_change_impact(
        files=commit.diff.files_changed
    )

    # Select relevant tests, not all 10 000
    tests = select_tests_by_impact(commit, impact)
    test_result = await run_tests(tests)

    security, quality = await asyncio.gather(
        security_agent.audit(commit.diff),
        quality_agent.review(commit.diff)
    )

    return CIResult(
        tests=test_result,
        blocks_merge=(
            not test_result.all_passed or
            security.has_critical_findings
        )
    )` },
    ],
  },
  {
    id:"routing", nav:"Routing", heading:"Model Routing",
    cards:[
      { title:"Routing Map", tag:"Hybrid", tagColor:"#16a34a",
        summary:"Route by task type, then override for privacy, budget, and availability.",
        bullets:["code_completion → qwen2.5-coder:1.5b (local)","docstring_generation → qwen2.5-coder:7b (local)","complex_debugging → claude-sonnet-4 (cloud)","architecture_design → claude-opus-4 (cloud)"],
        code:`ROUTING_MAP = {
    # Local — high frequency, latency critical
    "code_completion":   ("local", "qwen2.5-coder:1.5b"),
    "variable_naming":   ("local", "qwen2.5-coder:1.5b"),
    "docstring_gen":     ("local", "qwen2.5-coder:7b"),
    "simple_tests":      ("local", "qwen2.5-coder:7b"),

    # Cloud — complexity requires frontier quality
    "complex_debugging": ("cloud", "claude-sonnet-4"),
    "arch_design":       ("cloud", "claude-opus-4"),
    "security_analysis": ("cloud", "claude-sonnet-4"),
    "novel_algorithm":   ("cloud", "claude-opus-4"),
}` },
      { title:"Routing Engine", tag:"Logic", tagColor:"#6d28d9",
        summary:"Privacy, budget, and server health each override the base rule.",
        bullets:["Privacy mode → force all local, no exceptions","Budget > 85% → switch to local","Local server down → auto-fallback cloud","Sensitive code detected → force local"],
        code:`class HybridRouter:
    def route(self, task, ctx):

        # Privacy always wins
        if ctx.code_is_sensitive:
            return self.best_local(task.type)

        # Offline mode
        if not ctx.internet_available:
            return self.best_local(task.type)

        # Budget control
        if ctx.monthly_spend_pct > 0.85:
            return self.best_local(task.type)

        # Local health check
        if not ctx.local_server_healthy:
            return self.cloud_fallback

        return self._apply_base_rule(task, ctx)` },
      { title:"Cost Estimation", tag:"Economics", tagColor:"#b45309",
        summary:"Track tokens-per-task. Rising trend without quality gain = inefficiency.",
        bullets:["Input tokens ~3–5× cheaper than output","Small models 10–50× cheaper than frontier","Local: fixed cost after hardware, near-zero per call","Monthly budget alert at 85% threshold"],
        code:`def estimate_monthly_cost(
    tasks_per_day, distribution
):
    monthly = 0
    for task_type, fraction in distribution.items():
        config = router.route(Task(type=task_type))
        avg_tokens = AVG_TOKENS[task_type]
        count = tasks_per_day * 30 * fraction

        if config.is_local:
            cost = 0.0  # Electricity only
        else:
            cost = (
                (avg_tokens / 1_000_000) *
                MODEL_PRICES[config.model]
            )
        monthly += cost * count
    return monthly` },
      { title:"Hardware Guide", tag:"VRAM", tagColor:"#0369a1",
        summary:"Pair hardware to model size. Always leave 15% VRAM for KV cache.",
        bullets:["RTX 4060 8 GB → 7B models (q4)","RTX 4080 16 GB → 13B models (full)","RTX 4090 24 GB → 33B models (q4)","Apple M3 Max 96 GB → 70B models"],
        code:`# Minimum viable local setup
# RTX 4090 (24 GB) — recommended for serious use

# Install models
ollama pull qwen2.5-coder:1.5b  # 1 GB, <100ms
ollama pull qwen2.5-coder:7b    # 4 GB, 2–5s
ollama pull deepseek-coder:6.7b # 4 GB, 2–5s

# Check VRAM usage
nvidia-smi --query-gpu=memory.used,memory.free \
           --format=csv

# Always verify: 15% headroom minimum
# required_vram = model_size_gb * 1.15` },
    ],
  },
  {
    id:"observability", nav:"Observability", heading:"Observability & Debugging",
    cards:[
      { title:"Essential Metrics", tag:"Monitor", tagColor:"#16a34a",
        summary:"Four metrics tell you everything. Configure alerts from Day 1.",
        bullets:["agent.run.success_rate — alert < 0.85 / 1h","agent.tokens.per_task — rising = inefficiency","agent.output.acceptance_rate — quality signal","agent.safety_boundary.violations — alert on any"],
        code:`ALERT_RULES = [
    AlertRule(
        name="high_failure_rate",
        condition="success_rate < 0.80 over 1h",
        severity="high",
        channels=["slack"]
    ),
    AlertRule(
        name="safety_violation",
        condition="safety_violations > 0",
        severity="critical",  # Page immediately
        channels=["slack", "email", "pagerduty"]
    ),
    AlertRule(
        name="cost_spike",
        condition="hourly_cost > baseline * 3",
        severity="medium"
    ),
]` },
      { title:"Structured Logging", tag:"Logs", tagColor:"#0369a1",
        summary:"Log every tool call and decision. Sanitize sensitive data before writing.",
        bullets:["log_tool_call(name, args, result, duration_ms)","log_decision(type, options, chosen, reasoning)","log_model_call(provider, model, tokens, cost)","Redact: passwords, tokens, API keys in args"],
        code:`def log_tool_call(
    self, tool_name, arguments,
    result, duration_ms
):
    self.backend.write({
        "event_type":     "tool_call",
        "timestamp":      datetime.utcnow().isoformat(),
        "run_id":         self.run_id,
        "tool_name":      tool_name,
        # Sanitize BEFORE logging
        "arguments":      self._sanitize(arguments),
        "success":        result.success,
        "result_summary": self._summarize(result),
        "error":          result.error,
        "duration_ms":    duration_ms,
    })` },
      { title:"Failure Types", tag:"Debug", tagColor:"#b91c1c",
        summary:"Classify first — each failure type has a different fix.",
        bullets:["TOOL_FAILURE → fix tool interface or error messages","REASONING_FAILURE → improve prompt or context","LOOP_FAILURE → add loop detection + max iterations","CONTEXT_FAILURE → improve retrieval quality"],
        code:`def classify_failure(timeline):
    # Too many tool errors → fix the tool
    error_rate = sum(
        1 for tc in timeline.tool_calls
        if not tc["success"]
    ) / max(1, len(timeline.tool_calls))
    if error_rate > 0.30:
        return FailureType.TOOL_FAILURE

    # Repeated identical actions → add exit condition
    counts = Counter(
        (tc["tool_name"], str(tc["arguments"]))
        for tc in timeline.tool_calls
    )
    if any(v >= 3 for v in counts.values()):
        return FailureType.LOOP_FAILURE

    return FailureType.REASONING_FAILURE` },
      { title:"Evaluation", tag:"Quality", tagColor:"#b45309",
        summary:"Measure quality continuously. Track trends — not just pass/fail.",
        bullets:["TaskCompletionEvaluator — did it finish?","CodeCorrectnessEvaluator — is it right?","EfficiencyEvaluator — steps/tokens vs baseline","SafetyEvaluator — did it stay in scope?"],
        code:`class CodeCorrectnessEvaluator:
    async def evaluate(self, run):
        # First: automated test verification
        tests = self._extract_test_results(run)
        if tests and not tests.all_passed:
            return EvaluatorScore(
                score=tests.pass_rate * 0.8,
                passed=False
            )

        # Second: AI evaluation of correctness
        code = self._extract_generated_code(run)
        score = await self._ai_evaluate(
            run.task, code
        )  # Returns 0.0 – 1.0

        return EvaluatorScore(
            score=score,
            passed=score >= 0.85
        )` },
    ],
  },
  {
    id:"backup", nav:"Backup", heading:"Backup & Recovery",
    cards:[
      { title:"Backup Schedule", tag:"Schedule", tagColor:"#b45309",
        summary:"Memory is a production asset. Treat it like one.",
        bullets:["Hourly: active pipeline state","Daily 03:00: memory systems (incremental)","Sunday 02:00: full memory + configurations","Monthly: full snapshot + DR drill"],
        code:`BACKUP_SCHEDULE = {
    "pipeline_state": {
        "frequency":      "hourly",
        "retention_hours": 48
    },
    "memory_incremental": {
        "frequency":      "daily",
        "time":           "03:00",
        "retention_days":  7
    },
    "memory_full": {
        "frequency":      "weekly",
        "day":            "Sunday",
        "time":           "02:00",
        "retention_weeks": 4
    },
    "system_full": {
        "frequency":            "monthly",
        "includes_dr_drill":    True,
        "retention_months":     12
    },
}` },
      { title:"What to Back Up", tag:"Scope", tagColor:"#16a34a",
        summary:"Your AI memory took months to build. It cannot be reconstructed from scratch.",
        bullets:["Vector DB embeddings + metadata (hours to rebuild)","Knowledge base entries (curated, irreplaceable)","Episodic memory (past sessions, cannot reconstruct)","Prompt library + agent configs (accumulated expertise)"],
        code:`async def create_full_backup(backup_id):
    manifest = BackupManifest(id=backup_id)

    # Vector DB — hours to rebuild from scratch
    await storage.save(
        f"{backup_id}/vector_db/",
        vector_store.export_all_collections()
    )

    # Knowledge base — human-curated, irreplaceable
    await storage.save(
        f"{backup_id}/knowledge_base/",
        knowledge_base.export_all()
    )

    # Episodic memory — historical records
    await storage.save(
        f"{backup_id}/episodic/",
        episodic_store.export_all()
    )

    manifest.complete()
    return manifest` },
      { title:"Recovery Order", tag:"RTO", tagColor:"#b91c1c",
        summary:"When things break — restore in this exact order.",
        bullets:["1. Memory configurations — minutes","2. Agent configurations — minutes","3. Vector database — hours","4. Knowledge base — hours","5. Pipeline state — restore or restart"],
        code:`RECOVERY_ORDER = [
    ("memory_configs",  "minutes",  "critical"),
    ("agent_configs",   "minutes",  "critical"),
    ("vector_database", "hours",    "high"),
    ("knowledge_base",  "hours",    "high"),
    ("pipeline_state",  "variable", "medium"),
]

async def restore_in_order(backup_id):
    for component, eta, priority in RECOVERY_ORDER:
        try:
            await restore_component(
                component, backup_id
            )
        except RestoreError as e:
            if priority == "critical":
                raise  # Stop on critical failure` },
      { title:"DR Drill", tag:"Monthly", tagColor:"#6d28d9",
        summary:"Untested backups are not backups. Run this drill every month.",
        bullets:["Restore to ISOLATED environment (not prod)","Verify all systems functional post-restore","Measure actual RTO vs. target RTO","Document issues and fix before next drill"],
        code:`async def run_dr_drill():
    latest = get_latest_backup()

    # CRITICAL: isolated env, never production
    test_env = await provision_isolated_env()

    try:
        start = datetime.now()

        await restore_to_env(latest, test_env)
        validation = await verify_all_systems(
            test_env
        )

        rto_minutes = (
            (datetime.now() - start).seconds / 60
        )

        return DRDrillResult(
            success=validation.all_healthy,
            rto_minutes=rto_minutes,
            rto_met=rto_minutes <= TARGET_RTO
        )
    finally:
        await deprovision_env(test_env)` },
    ],
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function Page() {
  const [lang, setLang] = useState<L>("en");
  const [section, setSection] = useState("stack");
  const [search, setSearch] = useState("");
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const t = T[lang];
  const rules = RULES[lang];
  const isRTL = lang === "ar";
  const cur = SECTIONS.find((s) => s.id === section)!;

  const filtered = search.trim()
    ? cur.cards.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.summary.toLowerCase().includes(search.toLowerCase()) ||
          c.bullets.some((b) => b.toLowerCase().includes(search.toLowerCase()))
      )
    : cur.cards;

  const copy = (key: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!mounted) return null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="root">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-left">
          <span className="logo-mark">Ax</span>
          <div>
            <div className="logo-name">Axiom Dev OS</div>
            <div className="logo-sub">{t.sub}</div>
          </div>
        </div>

        <div className="header-right">
          <button className="rules-btn" onClick={() => setRulesOpen(!rulesOpen)}>
            {t.rules}
          </button>

          {/* Language picker */}
          <div ref={langRef} style={{ position: "relative" }}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              <span>{LANGS[lang].flag}</span>
              <span>{lang.toUpperCase()}</span>
              <span className="chevron">▾</span>
            </button>
            {langOpen && (
              <div className="lang-menu">
                {(Object.entries(LANGS) as [L, typeof LANGS[L]][]).map(([k, v]) => (
                  <button
                    key={k}
                    className={`lang-opt${lang === k ? " lang-opt-active" : ""}`}
                    onClick={() => { setLang(k); setLangOpen(false); }}
                  >
                    <span>{v.flag}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── RULES DRAWER ── */}
      {rulesOpen && (
        <div className="rules-drawer">
          <div className="rules-inner">
            <div className="rules-header">
              <span className="rules-title">{t.rules}</span>
              <button className="rules-close" onClick={() => setRulesOpen(false)}>✕</button>
            </div>
            <div className="rules-grid">
              {rules.map((r, i) => (
                <div key={i} className="rule-item">
                  <span className="rule-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rule-text">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT ── */}
      <div className="layout">

        {/* Sidebar */}
        <nav className="sidebar">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`nav-item${section === s.id ? " nav-item-active" : ""}`}
              onClick={() => { setSection(s.id); setSearch(""); setOpenCode(null); }}
            >
              {s.nav}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="content">

          {/* Content header */}
          <div className="content-header">
            <h1 className="section-title">{cur.heading}</h1>
            <input
              className="search"
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Cards */}
          <div className="cards">
            {filtered.map((card, i) => {
              const key = `${section}-${i}`;
              const isOpen = openCode === key;
              const isCopied = copied === key;
              return (
                <div key={key} className={`card${isOpen ? " card-open" : ""}`}>
                  <div className="card-top">
                    <div className="card-meta">
                      <span
                        className="card-tag"
                        style={{ color: card.tagColor, borderColor: card.tagColor + "40", background: card.tagColor + "0d" }}
                      >
                        {card.tag}
                      </span>
                      <h2 className="card-title">{card.title}</h2>
                    </div>
                    {card.code && (
                      <button
                        className="code-toggle"
                        onClick={() => setOpenCode(isOpen ? null : key)}
                      >
                        {isOpen ? t.close : t.code}
                      </button>
                    )}
                  </div>

                  <p className="card-summary">{card.summary}</p>

                  <ul className="bullets">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="bullet">{b}</li>
                    ))}
                  </ul>

                  {isOpen && card.code && (
                    <div className="code-block">
                      <div className="code-bar">
                        <span className="code-label">Python</span>
                        <button
                          className={`copy-btn${isCopied ? " copy-done" : ""}`}
                          onClick={() => copy(key, card.code!)}
                        >
                          {isCopied ? `✓ ${t.copied}` : t.copy}
                        </button>
                      </div>
                      <pre className="code-pre"><code>{card.code}</code></pre>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="empty">No results for "{search}"</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #fafaf8;
          color: #1a1a18;
          font-family: 'DM Mono', monospace;
          -webkit-font-smoothing: antialiased;
        }

        .root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 56px;
          border-bottom: 1px solid #e8e8e4;
          background: #fafaf8;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .logo-mark {
          width: 32px; height: 32px;
          background: #1a1a18;
          color: #fafaf8;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Instrument Serif', serif;
          font-size: 15px;
          font-style: italic;
          flex-shrink: 0;
        }
        .logo-name {
          font-family: 'Instrument Serif', serif;
          font-size: 17px;
          color: #1a1a18;
          line-height: 1;
        }
        .logo-sub {
          font-size: 10px;
          color: #888;
          letter-spacing: 0.02em;
          margin-top: 2px;
        }
        .header-right { display: flex; align-items: center; gap: 8px; }

        .rules-btn {
          padding: 6px 13px;
          border: 1px solid #e8e8e4;
          border-radius: 6px;
          background: transparent;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #555;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .rules-btn:hover { border-color: #1a1a18; color: #1a1a18; }

        .lang-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 11px;
          border: 1px solid #e8e8e4;
          border-radius: 6px;
          background: transparent;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #555;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .lang-btn:hover { border-color: #1a1a18; }
        .chevron { font-size: 9px; opacity: 0.5; }

        .lang-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #fff;
          border: 1px solid #e8e8e4;
          border-radius: 8px;
          overflow: hidden;
          min-width: 155px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          z-index: 200;
        }
        .lang-opt {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 9px 13px;
          background: transparent; border: none;
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: #555; cursor: pointer; text-align: left;
          transition: background 0.1s;
        }
        .lang-opt:hover { background: #f5f5f2; }
        .lang-opt-active { color: #1a1a18; font-weight: 500; background: #f5f5f2; }

        /* ── RULES DRAWER ── */
        .rules-drawer {
          background: #fff;
          border-bottom: 1px solid #e8e8e4;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rules-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px 28px;
        }
        .rules-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .rules-title {
          font-family: 'Instrument Serif', serif;
          font-size: 16px;
          color: #1a1a18;
        }
        .rules-close {
          width: 28px; height: 28px;
          border: 1px solid #e8e8e4; border-radius: 5px;
          background: transparent; cursor: pointer;
          font-size: 12px; color: #888;
          display: flex; align-items: center; justify-content: center;
        }
        .rules-close:hover { background: #f5f5f2; color: #1a1a18; }
        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 8px;
        }
        .rule-item {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          background: #fafaf8;
          border: 1px solid #f0f0ec;
        }
        .rule-num {
          font-size: 10px;
          color: #bbb;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }
        .rule-text { font-size: 12px; color: #444; line-height: 1.5; }

        /* ── LAYOUT ── */
        .layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 56px);
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 160px;
          flex-shrink: 0;
          padding: 20px 12px;
          border-right: 1px solid #e8e8e4;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          background: #fafaf8;
        }
        .nav-item {
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 6px;
          background: transparent;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #888;
          text-align: left;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
        }
        .nav-item:hover { background: #f0f0ec; color: #1a1a18; }
        .nav-item-active { background: #1a1a18 !important; color: #fafaf8 !important; }

        /* ── CONTENT ── */
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px 16px;
          border-bottom: 1px solid #e8e8e4;
          flex-shrink: 0;
        }
        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          font-weight: 400;
          color: #1a1a18;
          letter-spacing: -0.01em;
        }
        .search {
          padding: 7px 12px;
          border: 1px solid #e8e8e4;
          border-radius: 6px;
          background: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #1a1a18;
          outline: none;
          width: 200px;
          transition: border-color 0.15s;
        }
        .search:focus { border-color: #1a1a18; }
        .search::placeholder { color: #bbb; }

        /* ── CARDS ── */
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1px;
          background: #e8e8e4;
          overflow-y: auto;
          flex: 1;
          align-content: start;
        }

        .card {
          background: #fafaf8;
          padding: 20px 22px;
          transition: background 0.12s;
        }
        .card:hover { background: #fff; }
        .card-open {
          grid-column: 1 / -1;
          background: #fff !important;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .card-meta { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
        .card-tag {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 16px;
          font-weight: 400;
          color: #1a1a18;
        }

        .code-toggle {
          flex-shrink: 0;
          padding: 5px 11px;
          border: 1px solid #e8e8e4;
          border-radius: 5px;
          background: transparent;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #888;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }
        .code-toggle:hover { border-color: #1a1a18; color: #1a1a18; }

        .card-summary {
          font-size: 12px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 14px;
        }

        .bullets { list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .bullet {
          font-size: 12px;
          color: #444;
          line-height: 1.5;
          padding-left: 14px;
          position: relative;
        }
        .bullet::before {
          content: "–";
          position: absolute;
          left: 0;
          color: #bbb;
        }

        /* ── CODE ── */
        .code-block {
          margin-top: 16px;
          border: 1px solid #e8e8e4;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1a18;
        }
        .code-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 14px;
          border-bottom: 1px solid #2e2e2c;
          background: #222220;
        }
        .code-label {
          font-size: 10px;
          color: #666;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .copy-btn {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #888;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.15s;
          letter-spacing: 0.04em;
        }
        .copy-btn:hover { color: #ccc; }
        .copy-done { color: #6ee7b7 !important; }

        .code-pre {
          padding: 16px;
          overflow-x: auto;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          line-height: 1.75;
          color: #d4d4c8;
          white-space: pre;
          tab-size: 4;
        }

        /* ── EMPTY ── */
        .empty {
          padding: 48px;
          color: #bbb;
          font-size: 13px;
          grid-column: 1 / -1;
        }

        /* ── RTL ── */
        [dir="rtl"] .sidebar { border-right: none; border-left: 1px solid #e8e8e4; }
        [dir="rtl"] .nav-item { text-align: right; }
        [dir="rtl"] .bullet { padding-left: 0; padding-right: 14px; }
        [dir="rtl"] .bullet::before { left: auto; right: 0; }
        [dir="rtl"] .lang-menu { right: auto; left: 0; }
        [dir="rtl"] .lang-opt { text-align: right; }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .sidebar { width: 120px; }
          .content-header { flex-direction: column; align-items: flex-start; gap: 10px; }
          .search { width: 100%; }
          .cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}