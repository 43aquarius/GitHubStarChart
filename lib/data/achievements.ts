import type { Achievement } from '../types'

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'midnight_guardian',
    name: '子时真君',
    icon: '🌙',
    condition: '深夜活跃比例 > 40%',
    desc: '在深夜的代码江湖中，你是孤独而强大的守护者。',
  },
  {
    id: 'streak_master',
    name: '连更战神',
    icon: '🔥',
    condition: '连续提交 > 100 天',
    desc: '日复一日，你的毅力如磐石般不可撼动。',
  },
  {
    id: 'bug_hunter',
    name: '北斗捕快',
    icon: '🔍',
    condition: 'Issue 数量 > 20',
    desc: '慧眼如炬，世间 Bug 无所遁形。',
  },
  {
    id: 'polyglot',
    name: '千言通才',
    icon: '📜',
    condition: '使用语言 > 5 种',
    desc: '博采众长，精通多门语言之妙。',
  },
  {
    id: 'maintainer',
    name: '玄武守卫',
    icon: '🛡️',
    condition: '维护仓库 > 10 个',
    desc: '稳扎稳打，你是代码世界的基石。',
  },
  {
    id: 'pioneer',
    name: '角木先锋',
    icon: '🚀',
    condition: '新项目创建 > 5 个',
    desc: '开疆拓土，不断探索未知的领域。',
  },
  {
    id: 'legendary',
    name: '星辰主宰',
    icon: '🌌',
    condition: '总提交数 > 5000',
    desc: '你的轨迹已汇聚成银河，指引后来者。',
  },
]
