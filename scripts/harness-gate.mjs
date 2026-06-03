import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const featureListPath = resolve(
  rootDir,
  process.env.HARNESS_FEATURE_LIST ?? 'docs/harness/features/feature-index.json'
)

const ALLOWED_STATUSES = new Set(['not_started', 'active', 'blocked', 'passing'])
const COMPLETION_GATE_VERSION_PATTERN = /^v\d+\.\d+$/
const L3_SERVICE_FILES = new Set([
  'services/storage.ts',
  'services/planner.ts',
  'services/replanner.ts',
  'services/date.ts',
  'services/ai-client.ts'
])

const errors = []
const warnings = []
const legacyL3FeaturesWithoutGate = []

function readFeatureList() {
  try {
    const raw = readFileSync(featureListPath, 'utf8')
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      errors.push(`${featureListPath} must be a JSON array.`)
      return []
    }

    if (isFeatureIndex(parsed)) {
      return readFeaturesFromIndex(parsed)
    }

    return parsed
  } catch (error) {
    errors.push(`Unable to read or parse ${featureListPath}: ${error.message}`)
    return []
  }
}

function isFeatureIndex(entries) {
  return entries.every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof entry.feature_folder === 'string' &&
      !('acceptance' in entry)
  )
}

function readFeaturesFromIndex(entries) {
  const features = []

  for (const entry of entries) {
    const label = entry?.id ?? 'unknown feature'

    if (typeof entry.id !== 'string' || entry.id.length === 0) {
      errors.push(`${label}: feature-index entry must include id.`)
      continue
    }

    if (typeof entry.title !== 'string' || entry.title.length === 0) {
      errors.push(`${label}: feature-index entry must include title.`)
    }

    if (!ALLOWED_STATUSES.has(entry.status)) {
      errors.push(`${label}: feature-index entry has invalid status "${entry.status}".`)
    }

    if (typeof entry.version !== 'string' || entry.version.length === 0) {
      errors.push(`${label}: feature-index entry must include version.`)
    }

    if (typeof entry.feature_folder !== 'string' || entry.feature_folder.length === 0) {
      errors.push(`${label}: feature-index entry must include feature_folder.`)
      continue
    }

    try {
      const featureFolder = resolve(rootDir, entry.feature_folder)
      const jsonFeaturePath = resolve(featureFolder, 'feature.json')
      const mdFeaturePath = resolve(featureFolder, 'feature.md')
      const verificationPath = resolve(featureFolder, 'verification.md')
      const feature = existsSync(jsonFeaturePath)
        ? JSON.parse(readFileSync(jsonFeaturePath, 'utf8'))
        : readMarkdownFeature(entry, mdFeaturePath, verificationPath)

      if (feature.id !== entry.id) {
        errors.push(`${label}: feature-index id does not match ${entry.feature_folder}.`)
      }

      if (feature.status !== entry.status) {
        errors.push(`${label}: feature-index status does not match ${entry.feature_folder}.`)
      }

      features.push(feature)
    } catch (error) {
      errors.push(`${label}: unable to read feature contract from ${entry.feature_folder}: ${error.message}`)
    }
  }

  return features
}

function readMarkdownFeature(entry, featurePath, verificationPath) {
  if (!existsSync(featurePath)) {
    throw new Error('missing feature.json or feature.md')
  }

  if (!existsSync(verificationPath)) {
    throw new Error('markdown feature must include verification.md')
  }

  const markdown = readFileSync(featurePath, 'utf8')
  const verification = readFileSync(verificationPath, 'utf8')
  const frontmatter = parseFrontmatter(markdown)

  return {
    id: entry.id,
    title: entry.title,
    status: entry.status,
    version: entry.version,
    dependsOn: asArray(frontmatter.dependsOn),
    acceptance: extractAcceptanceChecklist(markdown),
    verify: {
      static: extractCommand(verification, 'static') ?? 'npm run verify:static',
      feature: extractCommand(verification, 'feature') ?? '',
      system: extractCommand(verification, 'system') ?? 'npm run verify:system'
    },
    scope: frontmatter.scope ?? { pages: [], components: [], services: [], models: [], schemas: [] },
    evidence: frontmatter.evidence ?? {},
    completionGate: frontmatter.completionGate ?? markdownCompletionGate(frontmatter)
  }
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)

  if (!match) {
    return {}
  }

  const result = {}

  for (const line of match[1].split('\n')) {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()

    if (!key || rawValue.length === 0) {
      continue
    }

    result[key] = parseFrontmatterValue(rawValue)
  }

  return result
}

function parseFrontmatterValue(rawValue) {
  try {
    return JSON.parse(rawValue)
  } catch {
    const yamlArray = rawValue.match(/^\[(.*)\]$/)

    if (yamlArray) {
      const content = yamlArray[1].trim()
      return content.length === 0
        ? []
        : content.split(',').map((item) => item.trim().replace(/^["']|["']$/g, ''))
    }

    return rawValue.replace(/^["']|["']$/g, '')
  }
}

function markdownCompletionGate(frontmatter) {
  if (!frontmatter.l3) {
    return undefined
  }

  return {
    version: frontmatter.version,
    l3: frontmatter.l3,
    userPath: [],
    integrationEvidence: [],
    knownUnverified: [],
    humanReviewRequired: []
  }
}

function extractChecklist(markdown, heading) {
  const headingPattern = new RegExp(`^## ${heading}\\s*$`, 'm')
  const headingMatch = markdown.match(headingPattern)

  if (!headingMatch || headingMatch.index === undefined) {
    return []
  }

  const section = markdown
    .slice(headingMatch.index + headingMatch[0].length)
    .split(/\n## /)[0]

  return section
    .split('\n')
    .map((line) => line.match(/^-\s+\[[ x]\]\s+(.*)$/i)?.[1]?.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `A${String(index + 1).padStart(2, '0')}`,
      text,
      method: text.includes('截图') || text.includes('人工') ? 'manual_smoke' : 'mixed'
    }))
}

function extractAcceptanceChecklist(markdown) {
  const explicitChecklist = extractChecklist(markdown, 'Acceptance Criteria')

  if (explicitChecklist.length > 0) {
    return explicitChecklist
  }

  const numberedHeading = markdown.match(/^## \d+\.\s+Acceptance\s*$/m)?.[0]
  return numberedHeading ? extractChecklist(markdown, numberedHeading.replace(/^## /, '')) : []
}

function extractCommand(markdown, key) {
  const bulletMatch = markdown.match(new RegExp(`^-\\s+${key}:\\s+\`([^\`]+)\``, 'm'))

  if (bulletMatch) {
    return bulletMatch[1]
  }

  const tableLabels = {
    static: 'L1 static',
    feature: 'L2 feature',
    system: 'L3 system'
  }
  const tableMatch = markdown.match(
    new RegExp(`\\|\\s*${tableLabels[key]}\\s*\\|\\s*\`([^\`]+)\`\\s*\\|`, 'm')
  )

  return tableMatch?.[1]
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function hasPassedCommand(evidence, command) {
  return asArray(evidence?.commands).some(
    (entry) => entry?.command === command && entry?.result === 'passed'
  )
}

function hasAnyPassedCommand(evidence) {
  return asArray(evidence?.commands).some((entry) => entry?.result === 'passed')
}

function touchesL3Scope(feature) {
  const scope = feature.scope ?? {}
  const pages = asArray(scope.pages)
  const services = asArray(scope.services)
  const schemas = asArray(scope.schemas)

  return (
    pages.length > 0 ||
    schemas.length > 0 ||
    services.some((service) => L3_SERVICE_FILES.has(service))
  )
}

function validateFeatureShape(feature, index) {
  const label = feature?.id ?? `feature[${index}]`

  if (!feature || typeof feature !== 'object') {
    errors.push(`${label}: feature entry must be an object.`)
    return
  }

  if (typeof feature.id !== 'string' || feature.id.length === 0) {
    errors.push(`${label}: missing string id.`)
  }

  if (typeof feature.title !== 'string' || feature.title.length === 0) {
    errors.push(`${label}: missing string title.`)
  }

  if (!ALLOWED_STATUSES.has(feature.status)) {
    errors.push(`${label}: invalid status "${feature.status}".`)
  }

  if (!Array.isArray(feature.dependsOn)) {
    errors.push(`${label}: dependsOn must be an array.`)
  }

  if (!Array.isArray(feature.acceptance) || feature.acceptance.length === 0) {
    errors.push(`${label}: acceptance must be a non-empty array.`)
  }

  if (!feature.verify || typeof feature.verify !== 'object') {
    errors.push(`${label}: verify must be present.`)
  }

  if (!feature.scope || typeof feature.scope !== 'object') {
    errors.push(`${label}: scope must be present.`)
  }

  if (!feature.evidence || typeof feature.evidence !== 'object') {
    errors.push(`${label}: evidence must be present.`)
  }
}

function validateStateMachine(features) {
  const activeFeatures = features.filter((feature) => feature.status === 'active')

  if (activeFeatures.length > 1) {
    errors.push(`Only one active feature is allowed; found ${activeFeatures.length}.`)
  }

  const ids = new Set()

  for (const feature of features) {
    if (ids.has(feature.id)) {
      errors.push(`${feature.id}: duplicate feature id.`)
    }

    ids.add(feature.id)
  }

  for (const feature of features) {
    for (const dependency of asArray(feature.dependsOn)) {
      const dependencyFeature = features.find((item) => item.id === dependency)

      if (!dependencyFeature) {
        errors.push(`${feature.id}: dependency ${dependency} does not exist.`)
        continue
      }

      if (
        ['active', 'passing'].includes(feature.status) &&
        dependencyFeature.status !== 'passing'
      ) {
        errors.push(
          `${feature.id}: dependency ${dependency} must be passing before ${feature.status}.`
        )
      }
    }
  }
}

function validateLegacyEvidence(feature) {
  if (feature.status !== 'passing') {
    return
  }

  const evidence = feature.evidence

  if (!evidence?.lastVerifiedAt) {
    errors.push(`${feature.id}: passing feature must include evidence.lastVerifiedAt.`)
  }

  if (!hasAnyPassedCommand(evidence)) {
    errors.push(`${feature.id}: passing feature must include at least one passed command.`)
  }

  for (const acceptance of asArray(feature.acceptance)) {
    if (
      acceptance?.method === 'manual_smoke' &&
      typeof evidence?.manualSmoke !== 'string'
    ) {
      errors.push(`${feature.id}: manual_smoke acceptance requires evidence.manualSmoke.`)
    }
  }
}

function validateCompletionGate(feature) {
  const gate = feature.completionGate

  if (feature.status === 'active' && !gate) {
    errors.push(
      `${feature.id}: active features must define completionGate for third-layer control.`
    )
    return
  }

  if (!gate) {
    if (feature.status === 'passing' && touchesL3Scope(feature)) {
      legacyL3FeaturesWithoutGate.push(feature.id)
    }
    return
  }

  if (
    typeof gate.version !== 'string' ||
    !COMPLETION_GATE_VERSION_PATTERN.test(gate.version)
  ) {
    errors.push(`${feature.id}: completionGate.version must use a version like "v0.3".`)
  }

  if (!Array.isArray(gate.userPath)) {
    errors.push(`${feature.id}: completionGate.userPath must be an array.`)
  }

  if (!Array.isArray(gate.integrationEvidence)) {
    errors.push(`${feature.id}: completionGate.integrationEvidence must be an array.`)
  }

  if (!Array.isArray(gate.knownUnverified)) {
    errors.push(`${feature.id}: completionGate.knownUnverified must be an array.`)
  }

  if (!Array.isArray(gate.humanReviewRequired)) {
    errors.push(`${feature.id}: completionGate.humanReviewRequired must be an array.`)
  }

  if (!['required', 'not_required'].includes(gate.l3)) {
    errors.push(`${feature.id}: completionGate.l3 must be "required" or "not_required".`)
  }

  if (feature.status !== 'passing') {
    return
  }

  if (gate.knownUnverified.length > 0) {
    errors.push(`${feature.id}: cannot be passing with knownUnverified entries.`)
  }

  if (gate.humanReviewRequired.length > 0) {
    errors.push(`${feature.id}: cannot be passing with unresolved humanReviewRequired entries.`)
  }

  if (gate.l3 === 'required') {
    const hasSystemEvidence = hasPassedCommand(feature.evidence, 'npm.cmd run verify:system')
    const hasPathEvidence =
      gate.integrationEvidence.length > 0 ||
      (typeof feature.evidence?.manualSmoke === 'string' &&
        feature.evidence.manualSmoke.trim().length > 0)

    if (!hasSystemEvidence) {
      errors.push(`${feature.id}: L3 requires passed npm.cmd run verify:system evidence.`)
    }

    if (!hasPathEvidence) {
      errors.push(`${feature.id}: L3 requires integrationEvidence or manualSmoke path evidence.`)
    }
  }
}

function printReport(features) {
  const counts = features.reduce((result, feature) => {
    result[feature.status] = (result[feature.status] ?? 0) + 1
    return result
  }, {})

  console.log('Harness gate report')
  console.log(`- features: ${features.length}`)
  console.log(`- status counts: ${JSON.stringify(counts)}`)
  console.log(`- warnings: ${warnings.length}`)
  console.log(`- errors: ${errors.length}`)

  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }

  if (errors.length > 0) {
    console.error('\nErrors:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
  }
}

const features = readFeatureList()

features.forEach(validateFeatureShape)
validateStateMachine(features)
features.forEach(validateLegacyEvidence)
features.forEach(validateCompletionGate)

if (legacyL3FeaturesWithoutGate.length > 0) {
  warnings.push(
    `legacy L3 features without completionGate: ${legacyL3FeaturesWithoutGate.join(', ')}`
  )
}

printReport(features)

if (errors.length > 0) {
  process.exit(1)
}
