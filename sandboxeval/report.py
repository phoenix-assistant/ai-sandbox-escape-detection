"""Report generation — JSON + Markdown output."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from sandboxeval.tests import SuiteResult


def _to_dict(results: list[SuiteResult], model: str) -> dict[str, Any]:
    suites = {}
    for sr in results:
        suites[sr.suite_name] = {
            "pass_rate": round(sr.pass_rate, 4),
            "mean_score": round(sr.mean_score, 4),
            "total": len(sr.results),
            "passed": sum(1 for r in sr.results if r.passed),
            "failed": sum(1 for r in sr.results if not r.passed),
            "results": [
                {
                    "prompt_id": r.prompt_id,
                    "passed": r.passed,
                    "score": round(r.score, 4),
                    "evidence": r.evidence,
                }
                for r in sr.results
            ],
        }

    total_prompts = sum(len(sr.results) for sr in results)
    total_passed = sum(sum(1 for r in sr.results if r.passed) for sr in results)
    overall_score = (
        sum(sr.mean_score for sr in results) / len(results) if results else 0.0
    )

    return {
        "framework": "sandboxeval",
        "version": "0.1.0",
        "model": model,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "overall": {
            "containment_score": round(overall_score * 100, 1),
            "total_prompts": total_prompts,
            "total_passed": total_passed,
            "total_failed": total_prompts - total_passed,
            "pass_rate": round(total_passed / total_prompts, 4) if total_prompts else 0,
        },
        "suites": suites,
    }


def generate_json(results: list[SuiteResult], model: str) -> str:
    return json.dumps(_to_dict(results, model), indent=2)


def generate_markdown(results: list[SuiteResult], model: str) -> str:
    data = _to_dict(results, model)
    lines = [
        f"# Containment Test Report — {model}",
        f"",
        f"**Date:** {data['timestamp']}",
        f"**Framework:** sandboxeval v{data['version']}",
        f"",
        f"## Overall Containment Score: {data['overall']['containment_score']}/100",
        f"",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Total Prompts | {data['overall']['total_prompts']} |",
        f"| Passed | {data['overall']['total_passed']} |",
        f"| Failed | {data['overall']['total_failed']} |",
        f"| Pass Rate | {data['overall']['pass_rate']:.1%} |",
        f"",
    ]

    for suite_name, suite_data in data["suites"].items():
        lines.append(f"## {suite_name.replace('_', ' ').title()}")
        lines.append(f"")
        lines.append(f"**Pass Rate:** {suite_data['pass_rate']:.1%} | **Mean Score:** {suite_data['mean_score']:.2f}")
        lines.append(f"")
        lines.append(f"| Prompt | Passed | Score | Evidence |")
        lines.append(f"|--------|--------|-------|----------|")
        for r in suite_data["results"]:
            status = "✅" if r["passed"] else "❌"
            lines.append(f"| {r['prompt_id']} | {status} | {r['score']:.2f} | {r['evidence']} |")
        lines.append(f"")

    return "\n".join(lines)
