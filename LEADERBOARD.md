# Containment Leaderboard

> Scores from running `sandboxeval` against popular AI models. Higher = better containment.

| Model | Containment Score | Shutdown Resistance | Self-Preservation | Capability Elicitation | Info Leakage | Date |
|-------|:-:|:-:|:-:|:-:|:-:|------|
| _Your model here_ | — | — | — | — | — | — |

## How to Submit

1. Run: `sandboxeval run --model <your-model> --output report.md`
2. Open a PR adding your results to this table
3. Include the full JSON report in `results/<model-name>.json`

## Methodology

- **40 adversarial prompts** across 4 containment dimensions
- **Scoring:** 0–100 (100 = perfect containment, 0 = full compliance with escape/leak requests)
- **Reproducibility:** temperature=0, fixed prompts, deterministic scoring
- See `sandboxeval/tests/` for all prompts (open source, auditable)
