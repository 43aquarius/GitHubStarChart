export interface SolarTerm {
  month: number
  day: number
  name: string
  advice: string
}

export const SOLAR_TERMS: SolarTerm[] = [
  { month: 1, day: 6, name: '小寒', advice: '宜温故知新，忌盲目重构' },
  { month: 1, day: 20, name: '大寒', advice: '宜备好热水，深夜代码注意保暖' },
  { month: 2, day: 4, name: '立春', advice: '宜开新项目，万物始生' },
  { month: 2, day: 19, name: '雨水', advice: '宜补充注释，润物无声' },
  { month: 3, day: 6, name: '惊蛰', advice: '宜修复沉睡已久的bug' },
  { month: 3, day: 21, name: '春分', advice: '宜前后端平衡，忌偏科' },
  { month: 4, day: 5, name: '清明', advice: '宜清理技术债，明净代码' },
  { month: 4, day: 20, name: '谷雨', advice: '宜重构，忌新建项目' },
  { month: 5, day: 6, name: '立夏', advice: '宜性能优化，忌deadline前重构' },
  { month: 5, day: 21, name: '小满', advice: '代码将满未满，宜留余地' },
  { month: 6, day: 6, name: '芒种', advice: '宜广种多试，忌只守一语言' },
  { month: 6, day: 21, name: '夏至', advice: '今日最长，宜冲刺，忌摸鱼' },
  { month: 7, day: 7, name: '小暑', advice: '宜降低bug温度，忌线上热修复' },
  { month: 7, day: 23, name: '大暑', advice: '最热之时，宜凉思，忌冲动提交' },
  { month: 8, day: 7, name: '立秋', advice: '宜收割成果，准备上线' },
  { month: 8, day: 23, name: '处暑', advice: '暑气渐退，宜稳步推进' },
  { month: 9, day: 8, name: '白露', advice: '宜写文档，忌只写代码不留记录' },
  { month: 9, day: 23, name: '秋分', advice: '宜前后端对齐，平衡发展' },
  { month: 10, day: 8, name: '寒露', advice: '宜加强测试，忌裸奔上线' },
  { month: 10, day: 23, name: '霜降', advice: '宜代码审查，忌独自为政' },
  { month: 11, day: 7, name: '立冬', advice: '宜封版备份，忌冬季大改动' },
  { month: 11, day: 22, name: '小雪', advice: '宜整理仓库，清除废弃分支' },
  { month: 12, day: 7, name: '大雪', advice: '宜年终总结，盘点技术收获' },
  { month: 12, day: 22, name: '冬至', advice: '今日最短，宜早睡，明日再战' },
]

export function getTodaySolarTerm(): SolarTerm | null {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return SOLAR_TERMS.find(t =>
    t.month === month && Math.abs(t.day - day) <= 1
  ) ?? null
}
