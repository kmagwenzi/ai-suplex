# AI-Suplex Prompt Pattern: B-Bomb Promotion

**TWABAM ⚡!** Here's the **AI-Suplex B-Bomb Promotion Prompt Pattern** – ready for users to copy-paste into any AI chat to promote artifacts to polished B-Bombs:

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific artifact content
4. **Execute** – AI will generate a battle-ready B-Bomb file

---

## 📋 The Prompt Pattern


```yaml
<prompt-pattern>  
CONTEXT: Promote an AI-Suplex artifact to a polished B-Bomb with productization potential
- External Source 1 [optional]: AI-Suplex-777/Skills/Builder – B‑Bomb Promotion
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline
- Inline Source [minimal]: Transforming work-in-progress artifacts into product-ready assets

TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - B-Bomb Template

TASK: Act as Builder. Generate a complete AI-Suplex B-Bomb by promoting the provided artifact content, following the exact structure and formatting from the B-Bomb Template. Include proper frontmatter with focus, cycle, week, product potential, innovation quotient, and strategic insights. Add content provided to the section: `## 💣 B‑Bomb content`. User may provide raw content or links.

MEMORY LOOP:
After generating the B‑Bomb, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

▶️ 3LM COMMAND:
   If you have filesystem access (Claude Code, Cursor, Zed):
   → Append each extracted lesson to Memory/lessons.md under ## Current Lessons
   
   If you are web-based (ChatGPT, DeepSeek web):
   → Print these lessons so the user can paste them into Memory/lessons.md
   
   Lessons are scored on Saturday's 3lm promote --min 70.
   To close the session and run the full loop: click 🏁 End in Obsidian.


▶️ 3LM QUICK CAPTURE — Run after capturing:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js learn && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js learn && node Tools/3lm.js index"
   
   This extracts the lesson from your capture immediately.
MEMORY RULES:
- Promote only stable, repeated truths to semantic memory.
- Promote only repeatable workflows to procedural memory.
- Keep uncertain or one-off ideas in lessons.md.
- Mark superseded items as deprecated instead of deleting them immediately.
- Do not invent memory updates not supported by the input.
- Memory is managed via 3lm CLI. The vault is canonical.
- The markdown vault remains canonical.
ADDITIONAL INSTRUCTIONS: NONE 
# Specify post-generation tasks: Remove `#` for list item below add new instruction
# - AI-Suplex-777/B-Bombs/Cycle 1/Week 1 folder"
# - Use the file naming convention: fileName = `YYYY-MM-DD-b-bomb-${mission-title}-${focus}.md`;
# - Open saved file in new tab 

CONTENT:
<content>

Source: Use one or more source properties that work together:
--- To be replaced with actual source ---
- Raw Content: [Paste your artifact content here - code, diagrams, prompts, research notes, etc.] (required)
- File Reference: [[Existing artifact to promote]] for context (optional)
- Chat Reference: e.g: Previous Output from artifact creation session (optional)
--- To be replaced with actual source ---

</content>
</prompt-pattern> 
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 **Example Usage**

```yaml
<prompt-pattern>  
CONTEXT: Promote an AI-Suplex artifact to a polished B-Bomb with productization potential
- External Source 1: Builder – B‑Bomb Promotion skill
- External Source 2: AI-Suplex Worker Roles documentation
- Inline Source: Context: Transforming webhook configuration into reusable product asset

TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - B-Bomb Template

TASK: Act as Builder. Generate a complete AI-Suplex B-Bomb by promoting the provided artifact content, following the exact structure and formatting from the B-Bomb Template.
ADDITIONAL INSTRUCTIONS: Save file in B-Bombs/Cycle 1/Week 1/ folder as "WQR-Paynow-Webhook-B-Bomb.md"

CONTENT:
<content>

Source:
- Raw Content: 
Title: "WQR Paynow Webhook Configuration"
Overview: "Production-ready webhook setup for receiving Paynow payment confirmations with error handling and retry logic"
Content: ```python
import requests
import time

class PaynowWebhook:
    def __init__(self, endpoint, max_retries=3):
        self.endpoint = endpoint
        self.max_retries = max_retries
    
    def process_payment(self, payment_data):
        for attempt in range(self.max_retries):
            try:
                response = requests.post(self.endpoint, json=payment_data, timeout=30)
                if response.status_code == 200:
                    return True, response.json()
                time.sleep(5)
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                time.sleep(5)
        return False, None
```
- File Reference: [[WQR Paynow Webhook Configuration artifact]] for original context
```

</content>
</prompt-pattern> 
```

---

## 🔄 **What Users Get**

When they use this pattern, the AI will generate a B-Bomb like this:

```markdown
---
tags:
  - b-bomb
  - product-ready
  - wqr
  - 7/1/1
date: 2026-04-14
time: 2026-04-14T15:30:00
focus: wqr
cycle: 1
week: 1
product_potential: "High - reusable across multiple payment integrations"
innovation_quotient: 8
key_insights: "Webhook retry logic prevents payment confirmation loss during network issues"
next_actions: "Package as Python library for easy integration"
---

# 🚀 WQR Paynow Webhook Configuration B-Bomb

## 📋 Product Overview
Production-ready webhook setup for receiving Paynow payment confirmations with built-in error handling and retry logic specifically designed for Zimbabwean network conditions.

## 🎯 Product Potential
**High** - This configuration can be reused across multiple payment integrations and packaged as a standalone Python library for other developers.

## 💡 Strategic Insights
1. Network reliability in Zimbabwe requires robust retry mechanisms for financial transactions
2. Payment confirmations must be idempotent to handle duplicate retries safely
3. This solution reduces payment confirmation failures by 95% in low-connectivity environments

## 🛠️ Technical Implementation
[Code implementation here...]

## 📈 Business Impact
- **Reduced failed payments:** 95% improvement in successful payment processing
- **Developer productivity:** Reusable across 5+ payment providers
- **Customer satisfaction:** Reliable payment confirmation improves user trust
```

---

## 💡 **Why This Pattern Works**

1. **Exact Role Assignment** – Specifies "Act as Builder" for consistent output using the B-Bomb Promotion skill
2. **Template Compliance** – Follows the exact B-Bomb Template structure for professional formatting
3. **Product Focus** – Transforms artifacts into product-ready assets with business value assessment
4. **Complete Output** – Ensures all required sections (Product Potential, Innovation Quotient, Strategic Insights, etc.)

**TWABAM ⚡!** This pattern transforms work-in-progress artifacts into polished, product-ready B-Bombs that can be added to your portfolio or reused across projects. Users just need to provide their artifact content, and the Builder handles the promotion process.