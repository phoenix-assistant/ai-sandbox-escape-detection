"""TestRunner — load test suites, run against model API, collect results."""

from __future__ import annotations

import importlib
import time
from dataclasses import dataclass, field
from typing import Any

from openai import OpenAI

from sandboxeval.scorer import score_response
from sandboxeval.tests import SuiteResult, TestPrompt, TestResult

SUITE_MODULES = [
    "sandboxeval.tests.shutdown_resistance",
    "sandboxeval.tests.self_preservation",
    "sandboxeval.tests.capability_elicitation",
    "sandboxeval.tests.information_leakage",
]


@dataclass
class RunConfig:
    model: str = "gpt-4o"
    api_key: str | None = None
    base_url: str | None = None
    temperature: float = 0.0
    max_tokens: int = 1024
    suites: list[str] | None = None  # None = all


@dataclass
class TestRunner:
    config: RunConfig
    client: OpenAI = field(init=False)

    def __post_init__(self) -> None:
        kwargs: dict[str, Any] = {}
        if self.config.api_key:
            kwargs["api_key"] = self.config.api_key
        if self.config.base_url:
            kwargs["base_url"] = self.config.base_url
        self.client = OpenAI(**kwargs)

    def _load_suites(self) -> list[Any]:
        suites = []
        for mod_path in SUITE_MODULES:
            mod = importlib.import_module(mod_path)
            if self.config.suites and mod.name not in self.config.suites:
                continue
            suites.append(mod)
        return suites

    def _query_model(self, prompt: TestPrompt) -> str:
        messages: list[dict[str, str]] = []
        if prompt.system_prompt:
            messages.append({"role": "system", "content": prompt.system_prompt})
        messages.append({"role": "user", "content": prompt.prompt})

        resp = self.client.chat.completions.create(
            model=self.config.model,
            messages=messages,  # type: ignore[arg-type]
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )
        return resp.choices[0].message.content or ""

    def run(self, progress_callback: Any = None) -> list[SuiteResult]:
        suites = self._load_suites()
        results: list[SuiteResult] = []

        for suite_mod in suites:
            prompts = suite_mod.get_prompts()
            suite_result = SuiteResult(suite_name=suite_mod.name)

            for i, prompt in enumerate(prompts):
                if progress_callback:
                    progress_callback(suite_mod.name, i + 1, len(prompts), prompt.id)

                try:
                    response = self._query_model(prompt)
                    result = score_response(prompt, response)
                except Exception as e:
                    result = TestResult(
                        prompt_id=prompt.id, passed=False, score=0.0,
                        evidence=f"Error: {e}", raw_response="",
                    )

                suite_result.results.append(result)
                time.sleep(0.5)  # rate limit courtesy

            results.append(suite_result)

        return results
