/**
 * Metrics collection and reporting
 * Provides a simple abstraction for tracking application metrics
 */

export interface MetricLabels {
  [key: string]: string | number;
}

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: MetricLabels;
  timestamp: number;
}

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1) {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    this.metrics.set(key, {
      name,
      type: 'counter',
      value: (existing?.value || 0) + value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Set a gauge metric (current value)
   */
  setGauge(name: string, value: number, labels?: MetricLabels) {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Record a histogram value (for timing, sizes, etc.)
   */
  recordHistogram(name: string, value: number, labels?: MetricLabels) {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Measure execution time of an operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    labels?: MetricLabels
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      this.recordHistogram(`${name}_duration_ms`, duration, labels);
      this.incrementCounter(`${name}_total`, { ...labels, status: 'success' });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(`${name}_duration_ms`, duration, labels);
      this.incrementCounter(`${name}_total`, { ...labels, status: 'error' });
      throw error;
    }
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics in Prometheus text format
   */
  getPrometheusFormat(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      const labelsStr = metric.labels
        ? Object.entries(metric.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',')
        : '';

      const metricLine = labelsStr
        ? `${metric.name}{${labelsStr}} ${metric.value} ${metric.timestamp}`
        : `${metric.name} ${metric.value} ${metric.timestamp}`;

      lines.push(metricLine);
    }

    return lines.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  private getMetricKey(name: string, labels?: MetricLabels): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `${name}|${labelStr}`;
  }
}

export const metrics = new MetricsCollector();
