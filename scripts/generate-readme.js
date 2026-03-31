#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const ROW_REGEX = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/

function parseTable(lines, startIndex) {
  const rows = []
  let i = startIndex
  let headerSkipped = false
  let separatorSkipped = false

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line.startsWith('|')) break

    if (!headerSkipped) {
      headerSkipped = true
      i++
      continue
    }

    if (!separatorSkipped && /^\|[-\s|]+\|$/.test(line)) {
      separatorSkipped = true
      i++
      continue
    }

    const match = line.match(ROW_REGEX)
    if (match) {
      rows.push({ key: match[1].trim(), value: match[2].trim() })
    }

    i++
  }

  return rows
}

function findSectionTable(lines, sectionHeader) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === sectionHeader) {
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j].trim()
        if (line.startsWith('|')) {
          return parseTable(lines, j)
        }
        if (line.startsWith('#')) break
      }
    }
  }
  return []
}

function generateReadme(claudeMdPath, readmePath) {
  const content = fs.readFileSync(claudeMdPath, 'utf-8')
  const lines = content.split('\n')

  const identity = findSectionTable(lines, '## Project Identity')
  const techStack = findSectionTable(lines, '## Tech Stack')
  const directory = findSectionTable(lines, '## Directory Overview')

  const projectName = identity.find(r => r.key === '프로젝트명')?.value || 'Project'
  const description = identity.find(r => r.key === '설명')?.value || ''

  let readme = `# ${projectName}\n\n${description}\n`

  readme += '\n## Tech Stack\n\n'
  if (techStack.length > 0) {
    readme += '| 항목 | 값 |\n|------|-----|\n'
    for (const row of techStack) {
      readme += `| ${row.key} | ${row.value} |\n`
    }
  }

  readme += '\n## Directory Overview\n\n'
  if (directory.length > 0) {
    readme += '| 경로 | 역할 |\n|------|------|\n'
    for (const row of directory) {
      readme += `| ${row.key} | ${row.value} |\n`
    }
  }

  fs.writeFileSync(readmePath, readme, 'utf-8')
}

try {
  const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md')
  const readmePath = path.join(process.cwd(), 'README.md')

  if (!fs.existsSync(claudeMdPath)) {
    process.stderr.write('Error: CLAUDE.md not found in current directory\n')
    process.exit(1)
  }

  generateReadme(claudeMdPath, readmePath)
  console.log('README.md generated successfully.')
} catch (error) {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
}
