export const profile = {
  name: '李宜阳',
  englishName: 'Yiyang Li',
  event: '上海交通大学 · 智能软件微专业',
  email: 'charles_0222@outlook.com',
  qr: { image: '', label: '' },
  invitation: '如果我们的故事有交集，欢迎来聊。'
};

const openingName = `${profile.name} / ${profile.englishName}`;

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
  demoModule: './assets/betterme-ats.js'
};

export const presentation = {
  defaultMotion: 'system',
  galaxy: './assets/galaxy.webp',
  land: './assets/land-topology.json',
  chapters: [
    { id: 'galaxy', label: '开篇', seconds: 55, slides: [
      { id: 'intro', view: 'intro', title: openingName, identity: true },
      { id: 'half', view: 'intro', title: openingName, identity: true, subtitle: '我是半个应届生' },
      { id: 'perspectives', view: 'intro', title: '我一直好奇，机器怎么做决定。', line: '这个问题后来把我带到了实验室、职业工作台和工厂。' },
      { id: 'departure', view: 'intro', title: '故事从南京开始。', action: '翻开第一章' }
    ] },
    { id: 'nanjing', label: '故城 · 南京', seconds: 25, slides: [
      { id: 'nanjing', view: 'map', location: 'nanjing', title: '在南京长大。', transition: 'arrival' }
    ] },
    { id: 'america', label: '渡海 · 美国', seconds: 50, slides: [
      { id: 'america', view: 'map', location: 'america', title: '从手写代码开始，学习怎样让机器理解问题。' }
    ] },
    { id: 'research', label: '求索 · 墨尔本', seconds: 170, slides: [
      { id: 'australia', view: 'map', location: 'australia', title: '不同的行为背后，能不能找到可以计算的规律？' },
      ...research.map(item => ({ ...item, id: 'research-' + item.id, view: 'research', researchId: item.id, title: item.heading })),
      { id: 'research-wrap', view: 'research-wrap', title: '把行为变成表示，把表示变成规律，再让规律帮助决策。' }
    ] },
    { id: 'betterme', label: '成形 · BetterMe', seconds: 160, slides: [
      { id: 'betterme', view: 'betterme', title: '我把求职做成了一张工作台。', action: '翻到上海篇' }
    ] },
    { id: 'industry', label: '入场 · 上海', seconds: 110, slides: [
      { id: 'shanghai', view: 'map', location: 'shanghai', title: '把技术带进真实现场。', line: '从模型里的决策，走到工厂里的协同。' },
      { id: 'dispatch', view: 'dispatch', title: '几辆车、几项任务，怎么跑才顺？', action: '翻到下一页' }
    ] },
    { id: 'ending', label: '留白', seconds: 30, slides: [
      { id: 'ending', view: 'ending', title: '下一页，留给还没发生的故事。', transition: 'universe' }
    ] }
  ]
};

export const slides = presentation.chapters.flatMap((chapter, chapterIndex) =>
  chapter.slides.map(slide => ({ ...slide, chapter, chapterIndex }))
);
