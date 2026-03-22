---
name: readme-updater
description: '**WORKFLOW SKILL** — Update existing README.md files in projects. USE FOR: keeping README current with project changes; adding missing sections like installation, usage, API docs. DO NOT USE FOR: generating README from scratch if none exists; updating non-README files. INVOKES: file tools (read/write README.md), project analysis (read package.json, structure).'
---

# README Updater Skill

This skill provides a quick checklist for updating an existing README.md file in a project.

## Checklist

1. **Read Current README**: Use read_file to examine the existing README.md for current sections and content.

2. **Analyze Project**: 
   - Read package.json for project name, description, dependencies, scripts.
   - List project directories to understand structure (client/, server/, scraper/).

3. **Identify Missing/Outdated Sections**:
   - Project Description
   - Installation Instructions
   - Usage Examples
   - API Documentation (if applicable)
   - Contributing Guidelines
   - License

4. **Update Content**:
   - Add or revise sections based on project info.
   - Ensure links and badges are correct.
   - Use proper Markdown formatting.

5. **Validate and Write**: Check for errors, then use replace_string_in_file or create_file to update README.md.

6. **Optional: Preview Changes**: Run a build or test to ensure nothing broke.

This checklist ensures the README stays accurate and useful as the project evolves.