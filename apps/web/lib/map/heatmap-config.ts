import { Styles } from "./layers"

export type MetricType = 'capital_growth_score' | 'risk_score' | 'cash_flow_score'

export const HEATMAP_GRADIENTS: Record<MetricType, Record<number, string>> = {
  capital_growth_score: {
    0.0: '#00ff00',
    0.5: '#ffff00',
    1.0: '#ff0000'
  },
  risk_score: {
    0.0: '#00ff00',
    0.5: '#ffff00',
    1.0: '#ff0000'
  },
  cash_flow_score: {
    0.0: '#0000ff',
    0.5: '#80ff00',
    1.0: '#00ff00'
  }
}

export const HEATMAP_LEGENDS: Record<MetricType, Styles[]> = {
  capital_growth_score: [
    { label: 'Low', fillColor: HEATMAP_GRADIENTS.capital_growth_score[0.0], groupName: 'Capital Growth', idKey: [] },
    { label: 'Medium', fillColor: HEATMAP_GRADIENTS.capital_growth_score[0.5], groupName: 'Capital Growth', idKey: [] },
    { label: 'High', fillColor: HEATMAP_GRADIENTS.capital_growth_score[1.0], groupName: 'Capital Growth', idKey: [] }
  ],
  risk_score: [
    { label: 'Low', fillColor: HEATMAP_GRADIENTS.risk_score[0.0], groupName: 'Risk', idKey: [] },
    { label: 'Medium', fillColor: HEATMAP_GRADIENTS.risk_score[0.5], groupName: 'Risk', idKey: [] },
    { label: 'High', fillColor: HEATMAP_GRADIENTS.risk_score[1.0], groupName: 'Risk', idKey: [] }
  ],
  cash_flow_score: [
    { label: 'Negative', fillColor: HEATMAP_GRADIENTS.cash_flow_score[0.0], groupName: 'Cash Flow', idKey: [] },
    { label: 'Neutral', fillColor: HEATMAP_GRADIENTS.cash_flow_score[0.5], groupName: 'Cash Flow', idKey: [] },
    { label: 'Positive', fillColor: HEATMAP_GRADIENTS.cash_flow_score[1.0], groupName: 'Cash Flow', idKey: [] }
  ]
}

export const HEATMAP_CONFIG = {
  radius: 25,
  blur: 15,
  maxZoom: 10,
  minOpacity: 0.5,
  max: 1.0
}

export const METRIC_LABELS: Record<MetricType, string> = {
  capital_growth_score: 'Capital Growth',
  risk_score: 'Investment Risk',
  cash_flow_score: 'Cash Flow'
}