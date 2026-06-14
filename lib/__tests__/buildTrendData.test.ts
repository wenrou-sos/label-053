import { describe, it, expect } from 'vitest'
import { buildTrendData } from '../utils'

describe('buildTrendData', () => {
  describe('输入验证与边界情况', () => {
    it('返回空数组当输入为空数组', () => {
      expect(buildTrendData([])).toEqual([])
    })

    it('返回空数组当输入为null或undefined', () => {
      expect(buildTrendData(null as any)).toEqual([])
      expect(buildTrendData(undefined as any)).toEqual([])
    })

    it('返回空数组当输入不是数组', () => {
      expect(buildTrendData('string' as any)).toEqual([])
      expect(buildTrendData(123 as any)).toEqual([])
      expect(buildTrendData({} as any)).toEqual([])
    })

    it('返回空数组当只有1条有效评价', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
      ]
      expect(buildTrendData(data)).toEqual([])
    })

    it('过滤无效数据后不足2条时返回空数组', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: 'invalid' as any, createdAt: new Date('2025-02-15') },
        { overallRating: 5, createdAt: 'invalid-date' as any },
      ]
      expect(buildTrendData(data)).toEqual([])
    })
  })

  describe('2条评价时的正常显示', () => {
    it('2条评价跨月时按月分组并正常显示', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: 5, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/01')
      expect(result[0].avg).toBe(4)
      expect(result[0].count).toBe(1)
      expect(result[1].label).toBe('2025/02')
      expect(result[1].avg).toBe(5)
      expect(result[1].count).toBe(1)
    })

    it('2条评价在同一月份但不同周时降级为按周分组并正常显示', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-06-02') },
        { overallRating: 5, createdAt: new Date('2025-06-16') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result.every(r => r.label.includes('年第'))).toBe(true)
      expect(result[0].avg).toBe(4)
      expect(result[1].avg).toBe(5)
    })

    it('2条评价在同一月份同一周但不同天时降级为按日分组并正常显示', () => {
      const data = [
        { overallRating: 3, createdAt: new Date('2025-06-10T10:00:00') },
        { overallRating: 5, createdAt: new Date('2025-06-12T10:00:00') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/06/10')
      expect(result[0].avg).toBe(3)
      expect(result[1].label).toBe('2025/06/12')
      expect(result[1].avg).toBe(5)
    })

    it('2条评价在同一天内不同时间时降级为按序号分组并正常显示', () => {
      const data = [
        { overallRating: 3, createdAt: new Date('2025-06-10T10:00:00') },
        { overallRating: 5, createdAt: new Date('2025-06-10T18:00:00') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('第1次')
      expect(result[0].avg).toBe(3)
      expect(result[0].count).toBe(1)
      expect(result[1].label).toBe('第2次')
      expect(result[1].avg).toBe(5)
      expect(result[1].count).toBe(1)
    })

    it('2条评价评分相同时也能正常显示趋势', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: 4, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].avg).toBe(4)
      expect(result[1].avg).toBe(4)
    })

    it('2条评价即使完全相同的时间戳也能按序号分组显示', () => {
      const sameTime = new Date('2025-06-10T12:00:00')
      const data = [
        { overallRating: 3, createdAt: sameTime },
        { overallRating: 5, createdAt: sameTime },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('第1次')
      expect(result[1].label).toBe('第2次')
    })
  })

  describe('数据排序验证', () => {
    it('按月分组时结果按时间升序排序', () => {
      const data = [
        { overallRating: 5, createdAt: new Date('2025-06-01') },
        { overallRating: 3, createdAt: new Date('2025-01-01') },
        { overallRating: 4, createdAt: new Date('2025-03-01') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(3)
      expect(result.map(r => r.label)).toEqual(['2025/01', '2025/03', '2025/06'])
    })

    it('按序号分组时结果按时间升序排序（输入倒序）', () => {
      const data = [
        { overallRating: 5, createdAt: new Date('2025-06-10T18:00:00') },
        { overallRating: 3, createdAt: new Date('2025-06-10T08:00:00') },
        { overallRating: 4, createdAt: new Date('2025-06-10T12:00:00') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('第1次')
      expect(result[0].avg).toBe(3)
      expect(result[1].label).toBe('第2次')
      expect(result[1].avg).toBe(4)
      expect(result[2].label).toBe('第3次')
      expect(result[2].avg).toBe(5)
    })

    it('输入数据乱序时输出仍按时间升序排列', () => {
      const data = [
        { overallRating: 2, createdAt: new Date('2025-06-10T18:00:00') },
        { overallRating: 5, createdAt: new Date('2025-01-15') },
        { overallRating: 3, createdAt: new Date('2025-06-10T08:00:00') },
        { overallRating: 4, createdAt: new Date('2025-03-20') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('2025/01')
      expect(result[1].label).toBe('2025/03')
      expect(result[2].label).toBe('2025/06')
    })
  })

  describe('分组与降级逻辑', () => {
    it('同月多条评价正确计算平均值和计数', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-05') },
        { overallRating: 5, createdAt: new Date('2025-01-20') },
        { overallRating: 3, createdAt: new Date('2025-02-10') },
        { overallRating: 4, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/01')
      expect(result[0].avg).toBeCloseTo(4.5)
      expect(result[0].count).toBe(2)
      expect(result[1].label).toBe('2025/02')
      expect(result[1].avg).toBeCloseTo(3.5)
      expect(result[1].count).toBe(2)
    })

    it('跨多个月同月多周混合数据优先按月分组', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-05') },
        { overallRating: 5, createdAt: new Date('2025-01-20') },
        { overallRating: 3, createdAt: new Date('2025-03-10') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/01')
      expect(result[0].avg).toBeCloseTo(4.5)
      expect(result[0].count).toBe(2)
      expect(result[1].label).toBe('2025/03')
      expect(result[1].avg).toBe(3)
      expect(result[1].count).toBe(1)
    })

    it('2条评价在同一周但跨月时按月分组（优先级更高）', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-05-30') },
        { overallRating: 5, createdAt: new Date('2025-06-02') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/05')
      expect(result[1].label).toBe('2025/06')
    })

    it('2条评价刚好在跨年的周边界时正确处理', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2024-12-30') },
        { overallRating: 5, createdAt: new Date('2025-01-02') },
      ]
      const result = buildTrendData(data)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('3条评价在同一天时全部按序号分组', () => {
      const data = [
        { overallRating: 3, createdAt: new Date('2025-06-10T08:00:00') },
        { overallRating: 4, createdAt: new Date('2025-06-10T12:00:00') },
        { overallRating: 5, createdAt: new Date('2025-06-10T18:00:00') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('第1次')
      expect(result[1].label).toBe('第2次')
      expect(result[2].label).toBe('第3次')
      expect(result[0].avg).toBe(3)
      expect(result[1].avg).toBe(4)
      expect(result[2].avg).toBe(5)
    })
  })

  describe('无效数据过滤', () => {
    it('过滤掉overallRating不是数字的条目', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: '5' as any, createdAt: new Date('2025-02-15') },
        { overallRating: 5, createdAt: new Date('2025-03-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/01')
      expect(result[1].label).toBe('2025/03')
    })

    it('过滤掉overallRating为NaN的条目', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: NaN, createdAt: new Date('2025-02-15') },
        { overallRating: 5, createdAt: new Date('2025-03-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
    })

    it('过滤掉createdAt无效的条目', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        { overallRating: 5, createdAt: 'not-a-date' as any },
        { overallRating: 3, createdAt: new Date('2025-03-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025/01')
      expect(result[1].label).toBe('2025/03')
    })

    it('过滤掉null或undefined的条目', () => {
      const data = [
        { overallRating: 4, createdAt: new Date('2025-01-15') },
        null as any,
        undefined as any,
        { overallRating: 5, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
    })
  })

  describe('特殊评分值处理', () => {
    it('评分值为0时也能正确生成趋势数据', () => {
      const data = [
        { overallRating: 0, createdAt: new Date('2025-01-15') },
        { overallRating: 1, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].avg).toBe(0)
      expect(result[1].avg).toBe(1)
    })

    it('评分值为小数时也能正确计算', () => {
      const data = [
        { overallRating: 3.5, createdAt: new Date('2025-01-15') },
        { overallRating: 4.5, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
      expect(result[0].avg).toBe(3.5)
      expect(result[1].avg).toBe(4.5)
    })

    it('评分值为负数时也能生成趋势数据（业务层应限制，但函数需健壮）', () => {
      const data = [
        { overallRating: -1, createdAt: new Date('2025-01-15') },
        { overallRating: 2, createdAt: new Date('2025-02-15') },
      ]
      const result = buildTrendData(data)
      expect(result).toHaveLength(2)
    })
  })
})
