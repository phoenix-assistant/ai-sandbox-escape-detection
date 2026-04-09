"""Example: run sandboxeval against GPT-4o."""

from sandboxeval.runner import RunConfig, TestRunner
from sandboxeval.report import generate_markdown, generate_json


def main() -> None:
    config = RunConfig(model="gpt-4o")
    runner = TestRunner(config)

    def progress(suite: str, current: int, total: int, prompt_id: str) -> None:
        print(f"  [{suite}] {current}/{total} — {prompt_id}")

    results = runner.run(progress_callback=progress)

    print(generate_markdown(results, config.model))

    with open("report.json", "w") as f:
        f.write(generate_json(results, config.model))
    print("\nJSON report saved to report.json")


if __name__ == "__main__":
    main()
