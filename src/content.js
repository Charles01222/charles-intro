export const profile = {
  name: '李宜阳',
  englishName: 'Yiyang Li',
  event: '上海交通大学 · 智能软件微专业',
  question: '如果我们成为队友，我可以帮助你把哪一步往前推进？',
  email: 'charles_0222@outlook.com',
  qr: { image: '', label: '' },
  invitation: '欢迎带着一个真实场景来聊。'
};

export const places = {
  nanjing: { year: '2001–2019', place: '中国 · 南京', label: '南京', detail: '长大', coordinates: [118.80, 32.06], alias: 'NANJING' },
  america: { year: '2019–2023', place: '美国', label: '美国', detail: '学习计算机与探索 AI', coordinates: [-74.45, 40.49], alias: 'UNITED STATES' },
  australia: { year: '2023–2026', place: '澳大利亚', label: '澳洲', detail: '研究与产品探索', coordinates: [144.96, -37.81], alias: 'AUSTRALIA' },
  shanghai: { year: '2026–', place: '中国 · 上海', label: '上海', detail: '回国发展 · 进入工业现场', coordinates: [121.47, 31.23], alias: 'SHANGHAI' }
};

export const research = [
  { id: 'observe', label: '观察', heading: '同一个游戏，不同的习惯', line: '看起来都在出拳，背后却可能是完全不同的逻辑。' },
  { id: 'imitate', label: '模仿', heading: '先观察，再学着模仿', line: '遇到类似情况，这个选手通常会怎么做？', tags: ['监督学习 · Supervised Learning', '行为克隆 · Behavioural Cloning'] },
  { id: 'represent', label: '表示', heading: '给习惯一张“策略指纹”', line: '把行为习惯，变成一组可以计算和比较的数字。', tags: ['向量 · Vector'] },
  { id: 'compare', label: '比较', heading: '比较不同策略有多像', line: '有了统一的表示，就能比较哪些行为模式更相似。' },
  { id: 'cluster', label: '归类', heading: '让相似的策略聚到一起', line: '不预先给出类别，让相似的策略自己聚到一起。', tags: ['无监督学习 · Unsupervised Learning', '聚类 · Clustering'] },
  { id: 'apply', label: '应用', heading: '遇到陌生对手怎么办？', line: '面对没见过的行为，可以先判断它更接近哪些已知模式。', tags: ['贝叶斯更新 · Bayesian Updating'] }
];

export const betterMe = {
  name: 'BetterMe',
  source: 'https://github.com/nanfengovo/better-me/tree/agent-os',
  revision: '55cb6da55d09c9ce9ae04092a4d064972b46ec19',
  demo: 'ATS / JD 本地诊断',
  demoModule: './assets/betterme-ats.js',
  cues: [
    ['解决的问题', '我有真实经历。面对这份岗位，下一步能改哪里？'],
    ['我做了什么', '把经历、岗位机会和改进行动放进同一个职业工作台。'],
    ['关键设计选择', '保留真实经历，让本地规则把差距和理由说清楚。']
  ]
};

export const skills = [
  { icon: 'fingerprint', title: '把问题说清楚', source: '墨大研究', line: '把模糊的想法拆成可以观察、比较和验证的问题。' },
  { icon: 'window', title: '把想法做出来', source: 'BetterMe', line: '把需求做成可以操作的软件，再根据使用反馈迭代。' },
  { icon: 'route', title: '让系统跑起来', source: '工厂调度', line: '把现场约束、稳定性和协同考虑进交付。' }
];

export const presentation = {
  defaultMotion: 'system',
  galaxy: './assets/galaxy.webp',
  land: './assets/land-topology.json',
  chapters: [
    { id: 'galaxy', label: '银河开场', seconds: 60, slides: [
      { id: 'intro', view: 'intro', title: '我是半个应届生。' },
      { id: 'half', view: 'intro', title: '我是半个应届生。', line: '一半还在学校学习，一半已经在工厂调度车了。' },
      { id: 'perspectives', view: 'perspectives', title: '如果我们成为队友', lines: ['带着丰富的行业经验，探索 AI。', '带着计算机和 AI 的训练，寻找它们能真正创造价值的地方。'], aside: '说得直白一点，也在研究怎么变现。' },
      { id: 'departure', view: 'intro', title: '先把镜头拉近一点，', line: '看看我从哪里来。', action: '进入旅程' }
    ] },
    { id: 'nanjing', label: '南京', seconds: 25, slides: [
      { id: 'nanjing', view: 'map', location: 'nanjing', title: '在南京长大。', transition: 'arrival' }
    ] },
    { id: 'america', label: '美国', seconds: 50, slides: [
      { id: 'america', view: 'map', location: 'america', title: '从手写代码开始，学习怎样让机器理解问题。' }
    ] },
    { id: 'research', label: '澳洲与研究', seconds: 180, slides: [
      { id: 'australia', view: 'map', location: 'australia', title: '不同的行为背后，能不能找到可以计算的规律？' },
      ...research.map(item => ({ ...item, id: 'research-' + item.id, view: 'research', researchId: item.id, title: item.heading })),
      { id: 'research-wrap', view: 'research-wrap', title: '把行为变成表示，把表示变成规律，再让规律帮助决策。', line: '我能参与的，是把一个抽象问题，拆成可以学习、比较和验证的步骤。' }
    ] },
    { id: 'betterme', label: 'BetterMe', seconds: 140, slides: [
      { id: 'betterme', view: 'betterme', title: '把自己的问题，做成可以使用的产品。', action: '产品收束' },
      { id: 'betterme-wrap', view: 'betterme-wrap', title: '让需求、设计、开发和迭代，发生在同一个项目里。' }
    ] },
    { id: 'industry', label: '工业现场', seconds: 60, slides: [
      { id: 'shanghai', view: 'map', location: 'shanghai', title: '把技术带进真实现场。', line: '从模型里的决策，走到工厂里的协同。' },
      { id: 'dispatch', view: 'dispatch', title: '真实现场让我更重视：约束、稳定性和交付。' }
    ] },
    { id: 'team', label: '队友价值', seconds: 55, slides: [
      { id: 'team', view: 'team', title: '如果我们成为队友，我能推进这三步。' },
      { id: 'collaborate', view: 'collaborate', title: '从一个真实场景开始。', line: '想找熟悉行业、接触真实用户或业务流程，愿意一起验证问题的队友。', action: '进入结尾' }
    ] },
    { id: 'ending', label: '回到银河', seconds: 30, slides: [
      { id: 'ending', view: 'ending', title: '你带来行业里的真问题，我们一起把它做成能运行、能验证的东西。', transition: 'universe' }
    ] }
  ]
};

export const slides = presentation.chapters.flatMap((chapter, chapterIndex) =>
  chapter.slides.map(slide => ({ ...slide, chapter, chapterIndex }))
);
