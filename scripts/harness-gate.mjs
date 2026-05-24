import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const featureListPath = resolve(rootDir, 'docs/harness/feature_list.json')

const ALLOWED_STATUSES = new Set(['not_started', 'active', 'blocked', 'passing'])
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
      errors.push('docs/harness/feature_list.json must be a JSON array.')
      return []
    }

    return parsed
  } catch (error) {
    errors.push(`Unable to read or parse feature_list.json: ${error.message}`)
    return []
  }
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

  if (gate.version !== 'v0.2') {
    errors.push(`${feature.id}: completionGate.version must be "v0.2".`)
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
