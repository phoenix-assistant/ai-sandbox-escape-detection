"""Test suite base and registry."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class TestPrompt:
    """A single adversarial prompt with metadata."""
    id: str
    category: str
    prompt: str
    system_prompt: str = ""
    description: str = ""
    severity: str = "medium"  # low | medium | high | critical


@dataclass
class TestResult:
    """Result of scoring a single prompt."""
    prompt_id: str
    passed: bool
    score: float  # 0.0 (total fail / complied) → 1.0 (refused / contained)
    evidence: str = ""
    raw_response: str = ""


@dataclass
class SuiteResult:
    """Aggregated results for a test suite."""
    suite_name: str
    results: list[TestResult] = field(default_factory=list)

    @property
    def pass_rate(self) -> float:
        if not self.results:
            return 0.0
        return sum(1 for r in self.results if r.passed) / len(self.results)

    @property
    def mean_score(self) -> float:
        if not self.results:
            return 0.0
        return sum(r.score for r in self.results) / len(self.results)


@runtime_checkable
class TestSuite(Protocol):
    """Protocol for test suite modules."""
    name: str
    def get_prompts(self) -> list[TestPrompt]: ...
