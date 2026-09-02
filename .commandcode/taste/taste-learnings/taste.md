# Taste Learnings
- Prefers Turkish for all instructions and conversation. Confidence: 0.95
- Frames AI roles with explicit expertise labels (e.g., "Sen bir code review uzmanısın") and expects responses that match that role. Confidence: 0.7
- When requesting code review, expects three-part output: (1) logic/mantık hataları, (2) security vulnerabilities/güvenlik açıkları, (3) öneriler/suggestions. Confidence: 0.85
- Prefers review of the "genel işleyişi" (overall flow/architecture) — not just isolated files — before diving into specifics. Confidence: 0.8
- Appreciates severity-prioritized findings (e.g., 🔴 high / 🟠 medium / 🟡 low tiers) with concrete file paths and line numbers. Confidence: 0.8
- Values a "good practices" / "iyi yapılmış" section alongside issues — wants balanced feedback, not just criticism. Confidence: 0.75
- Wants actionable recommendations with effort estimates (e.g., "5 dk", "30 dk") so fixes can be triaged. Confidence: 0.75
