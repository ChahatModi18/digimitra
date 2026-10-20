# Model Context Protocol (MCP) & AI Agent Integration — DigiMitra (डिजीमित्र)

> **Protocol Version:** MCP Spec 2024-11-05  
> **Agent Role:** DigiMitra AI Digital Consultant (MitraBot)  
> **Backend Integration:** `backend/app/core/llm/` & `backend/app/domain/agentic_assessment/`  

---

## 1. Overview of MCP in DigiMitra

The **Model Context Protocol (MCP)** enables AI coding assistants, IDE sidecars, and autonomous LLM agents to securely interact with the DigiMitra system. Through standard MCP JSON-RPC messages, external language models can:
1. Inspect live enterprise assessment metrics.
2. Query the 9-dimensional readiness question bank.
3. Validate proposed roadmap action items against active business rules.
4. Provide real-time bilingual advisory services to MSME users.

```mermaid
graph LR
    LLM["LLM Agent (Gemini / Anthropic / Local LLM)"] <-->|MCP JSON-RPC Protocol| Server["DigiMitra MCP Server"]
    Server <-->|FastAPI Async Router| Domain["DigiMitra Domain Engine"]
    Domain <--> DB[("MySQL / SQLite Persistence")]
```

---

## 2. MCP Server Configuration

To connect DigiMitra to an MCP-compliant client (such as Claude Desktop, Antigravity, or Cursor), define the following in your MCP settings file (`mcp_config.json`):

```json
{
  "mcpServers": {
    "digimitra-consultant": {
      "command": "python",
      "args": [
        "-m",
        "app.core.llm.mcp_server"
      ],
      "cwd": "C:/Users/Lenovo/Desktop/MAJOR PROJECT DOCUMENTATION/backend",
      "env": {
        "DATABASE_URL": "mysql+aiomysql://digimitra_user:digimitra_secret_pass@127.0.0.1:3306/digimitra_db",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

---

## 3. Registered MCP Tools & Resources

### 3.1 Tools Exposed to the AI Agent

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_business_profile` | `business_id: string` | Retrieves registered sector, turnover tier, and location details. |
| `get_assessment_scores`| `assessment_id: string` | Retrieves 9-dimension percentage scores and assigned RBDL level. |
| `recommend_schemes` | `sector: string, turnover_tier: string` | Returns matching Government of India MSME schemes and subsidies. |
| `generate_roadmap_tasks`| `rbdl_level: string, weak_dimensions: list` | Returns recommended 30-60-90 day action items for the business. |

### 3.2 Resources Exposed to the AI Agent

- `digimitra://rules/rbdl_v1`: JSON representation of all active RBDL scoring thresholds and rule predicates.
- `digimitra://question_bank/all`: Complete bilingual question catalog across all 9 dimensions.

---

## 4. Prompt Engineering & Grounding Constraints

The DigiMitra AI Consultant operates under strict epistemic guardrails defined in `backend/app/core/llm/chatbot_service.py`:
1. **Zero Hallucination of Government Subsidies:** The agent is only permitted to recommend schemes retrieved directly from the verified database.
2. **Accessible Tone:** Plain language; avoids high-level IT jargon (e.g. explains "Cloud Storage" as "Safe online digital file locker accessible from mobile").
3. **Bilingual Sensitivity:** Retains native Hindi commercial terms (e.g., *Khata*, *Challan*, *Bahi-Khata*, *Udyam Registration*).
