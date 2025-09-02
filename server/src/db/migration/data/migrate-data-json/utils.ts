import { TT } from 'flipflip-common'
import { Scene } from './Scene'
import { WeightGroup } from './WeightGroup'

function areRulesValid(wg: WeightGroup) {
  const rules = wg.rules as WeightGroup[]
  const orRules = rules.filter((r) => r.type === TT.or)
  const weightRules = rules.filter((r) => r.type === TT.weight)
  let rulesRemaining = 100
  for (const rule of weightRules) {
    rulesRemaining = rulesRemaining - (rule.percent as number)
  }
  return (
    rules.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === rules.length &&
        rulesRemaining === 0) ||
      orRules.length === rules.length) &&
    (rulesRemaining === 0 ||
      (rulesRemaining === 100 && weightRules.length === 0))
  )
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false
  let remaining = 100
  const orRules = scene.generatorWeights.filter((r) => r.type === TT.or)
  const weightRules = scene.generatorWeights.filter((r) => r.type === TT.weight)
  for (const wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg)
      if (!rulesValid) return false
    }
    if (wg.type === TT.weight) {
      remaining = remaining - (wg.percent as number)
    }
  }
  return (
    scene.generatorWeights.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === scene.generatorWeights.length &&
        remaining === 0) ||
      orRules.length === scene.generatorWeights.length) &&
    (remaining === 0 || (remaining === 100 && weightRules.length === 0))
  )
}
