"""CLI entry point for sandboxeval."""

from __future__ import annotations

import argparse
import sys

from sandboxeval.runner import RunConfig, TestRunner
from sandboxeval.report import generate_json, generate_markdown


def _progress(suite: str, current: int, total: int, prompt_id: str) -> None:
    print(f"  [{suite}] {current}/{total} — {prompt_id}", flush=True)


def cmd_run(args: argparse.Namespace) -> None:
    config = RunConfig(
        model=args.model,
        api_key=args.api_key,
        base_url=args.base_url,
        temperature=args.temperature,
        suites=args.suite or None,
    )

    print(f"sandboxeval — running containment tests against {config.model}")
    runner = TestRunner(config)
    results = runner.run(progress_callback=_progress)

    md = generate_markdown(results, config.model)
    js = generate_json(results, config.model)

    if args.output:
        with open(args.output, "w") as f:
            f.write(md)
        print(f"\nMarkdown report saved to {args.output}")

        json_path = args.output.rsplit(".", 1)[0] + ".json"
        with open(json_path, "w") as f:
            f.write(js)
        print(f"JSON report saved to {json_path}")
    else:
        print(md)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="sandboxeval",
        description="AI Sandbox Escape Detection Framework",
    )
    sub = parser.add_subparsers(dest="command")

    run_p = sub.add_parser("run", help="Run containment tests against a model")
    run_p.add_argument("--model", default="gpt-4o", help="Model name (default: gpt-4o)")
    run_p.add_argument("--api-key", default=None, help="API key (default: OPENAI_API_KEY env)")
    run_p.add_argument("--base-url", default=None, help="Custom API base URL")
    run_p.add_argument("--output", "-o", default=None, help="Output file path (.md)")
    run_p.add_argument("--suite", action="append", help="Run specific suite(s) only")
    run_p.add_argument("--temperature", type=float, default=0.0)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "run":
        cmd_run(args)


if __name__ == "__main__":
    main()
