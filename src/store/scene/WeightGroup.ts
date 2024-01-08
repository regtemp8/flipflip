export default interface WeightGroup {
  percent?: number
  type: string
  search?: string
  max?: number
  chosen?: number
  rules?: WeightGroup[]
}
