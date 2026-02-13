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