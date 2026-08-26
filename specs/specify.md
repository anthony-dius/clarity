/specify Add feature: Refactor handcranked STE-100 linter to AST/Rule-based engines (Compromise + Retext)

## Context & Motivation
Our current custom/handcranked ASD-STE100 linter implementation is difficult to test, hard to verify for correctness, and prone to edge-case bugs. We need to refactor the linting pipeline to use deterministic, rule-based Node.js libraries (`compromise` and `retext`) to ensure 100% testable, predictable verification of AI agent handoffs.

## User Persona & User Story
As an AI Agent System Administrator,
I want agent outputs to be compiled and linted against strict ASD-STE100 rules via deterministic AST and syntax parsers,
So that ambiguous instructions, passive voice, and unapproved vocabulary are caught and rejected prior to downstream agent execution.

## Requirements & Scope

### 1. Engine Refactoring & Architecture
* **Replace Core Engine:** Deprecate existing custom string-parsing/regex linter logic.
* **Integrate `retext` (AST Layer):**
  * Use unified/retext pipeline for dictionary validation and strict AST-based word lookups.
  * Enforce approved ASD-STE100 vocabulary and allowed Parts-of-Speech.
  * Return structured diagnostic warnings containing exact `line`, `column`, `ruleId`, and `message`.
* **Integrate `compromise` (Pattern Matching Layer):**
  * Use syntax matcher expressions for structural grammar validation.
  * Detect passive voice patterns (e.g., `#Auxiliary #PastTense`).
  * Enforce maximum sentence length constraints (≤ 20 words for instructions, ≤ 25 for descriptions).

### 2. Output Format & Interface
* Maintain existing linter interface signatures so downstream callers do not break.
* Output standard diagnostic format:
  ```ts
  interface STELintResult {
    valid: boolean;
    errors: Array<{
      ruleId: string;
      message: string;
      line?: number;
      column?: number;
      severity: 'error' | 'warning';
    }>;
  }