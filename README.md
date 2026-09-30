# SAT Answer Review

A standalone React/Vite answer key for 108 hard questions selected from College Board Digital SAT Practice Tests 9, 10, and 11.

## Features

- 27 answers for each of four modules (108 total)
- Concise original instructional explanation for every question
- Search and filters for module and source test
- Original question images and source metadata
- Links to College Board's official detailed explanation PDFs
- Responsive layout and print-friendly answer review

## Run locally

```bash
npm install
npm run dev
```

## Validate and build

```bash
npm run validate:content
npm run lint
npm run build
```

The content validator checks the exact 27-question module counts, the 9-question contribution from each source test to every module, image coverage, answer keys, and explanation coverage.

## Source note

SAT is a registered trademark of College Board. This independent study resource is not endorsed by College Board. The question images and answer data are drawn from the publicly released Digital SAT Practice Tests 9, 10, and 11; concise explanations in this project are original instructional summaries.
