import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  Sparkles,
  X, 
  Check,
  ChevronRight
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useNavigate } from "react-router-dom";
import { useLearningStats, getLastVisitedLearningPage } from "@/lib/utils";
import { toast } from "sonner";

// 定义议题类型
interface Topic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: "入门" | "进阶";
  duration: number;
  isAIGenerated?: boolean;
}

// 定义用户进度类型
interface UserProgress {
  completedTopics: number;
  lastStudyTime: string;
  progressPercentage: number;
}

// 模拟AI生成的议题类型
interface AIGeneratedTopic {
  title: string;
  description: string;
  tags: string[];
  difficulty: "入门" | "进阶";
  duration: number;
}

const Home = () => {
  const navigate = useNavigate();
  
  // 处理继续上次学习
  const handleContinueLastLearning = () => {
    const lastPage = getLastVisitedLearningPage();
    if (lastPage && lastPage.routePath) {
      navigate(lastPage.routePath);
    } else {
      // 如果没有记录，跳转到议题广场
      navigate('/');
    }
  };
  // 状态管理
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | '入门' | '进阶'>('all');
  
  // 从localStorage加载议题数据，如果没有则使用默认数据
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const savedTopics = localStorage.getItem('ControvLearn_topics');
      if (savedTopics) {
        return JSON.parse(savedTopics);
      }
    } catch (error) {
      console.error('Failed to load topics from localStorage:', error);
    }
    
    // 默认议题数据
    return [
      {
        id: "1",
        title: "核污染水排海是否可接受？",
        description: "探讨核污染水排海的科学依据、环境影响和国际争议",
        tags: ["环境", "科技伦理"],
        difficulty: "进阶",
        duration: 35,
        source: 'default'
      },
      {
        id: "2",
        title: "人工智能是否会取代人类工作？",
        description: "分析AI技术发展对就业市场的影响和未来职业趋势",
        tags: ["AI技术", "就业"],
        difficulty: "入门",
        duration: 25,
        source: 'default'
      },
      {
        id: "3",
        title: "基因编辑技术的伦理边界在哪里？",
        description: "讨论CRISPR等基因编辑技术的应用前景和伦理挑战",
        tags: ["生物技术", "伦理"],
        difficulty: "进阶",
        duration: 40,
        source: 'default'
      },
      {
        id: "4",
        title: "新能源汽车是否真的环保？",
        description: "从全生命周期角度评估新能源汽车的环境影响",
        tags: ["环境", "可持续发展"],
        difficulty: "入门",
        duration: 20,
        source: 'default'
      },
      {
        id: "5",
        title: "社交媒体是否损害了青少年的心理健康？",
        description: "研究社交媒体使用与青少年心理健康之间的关系",
        tags: ["心理健康", "社会影响"],
        difficulty: "入门",
        duration: 30,
        source: 'default'
      },
      {
        id: "6",
        title: "大数据时代的个人隐私该如何保护？",
        description: "探讨数据收集、使用和保护的平衡问题",
        tags: ["数据隐私", "科技伦理"],
        difficulty: "进阶",
        duration: 35,
        source: 'default'
      }
    ];
  });
  
  // 使用统一的统计hook
  const { 
    goalTopics, 
    completedTopics, 
    progressPercent 
  } = useLearningStats(topics);
  
  // 根据选择的难度筛选议题
  const filteredTopics = topics.filter(topic => {
    if (selectedDifficulty === 'all') return true;
    return topic.difficulty === selectedDifficulty;
  });
  
  // 格式化最后学习时间
  const lastVisitedPage = getLastVisitedLearningPage();
  const lastStudyTime = lastVisitedPage 
    ? new Date(lastVisitedPage.visitedAt).toLocaleString() 
    : "2025-12-20 16:30";
  
  // 最后学习的议题和步骤
  const lastStudyTopic = lastVisitedPage?.topicTitle || "";
  const lastStudyStepId = lastVisitedPage?.stepId || 0;

  // AI生成议题表单状态
  const [interestArea, setInterestArea] = useState("");
  const [controversyAngle, setControversyAngle] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<"入门" | "进阶">("入门");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState<AIGeneratedTopic | null>(null);

  // 图表数据
  const chartData = [
    { name: "已完成", value: completedTopics },
    { name: "未完成", value: goalTopics - completedTopics }
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];

  // 生成模拟日期数据 - 基于当前日期(2026-01-07)向前推算6周
  const generateTrendData = () => {
    const data = [];
    const today = new Date('2026-01-07');
    
    for (let i = 5; i >= 0; i--) {
      // 计算日期（每周间隔）
      const date = new Date(today);
      date.setDate(date.getDate() - i * 7);
      
      // 格式化为 MM-DD 格式
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${month}-${day}`;
      
      // 保留原有的小时数据
      const hoursData = [2.5, 3.8, 2.1, 4.2, 3.5, 4.8];
      data.push({ date: dateStr, hours: hoursData[i] });
    }
    
    return data;
  };
  
  const studyTrendData = generateTrendData();

  // 处理AI生成议题
  const handleGenerateTopic = () => {
    if (!interestArea.trim()) return;
    
    setIsGenerating(true);
    
    // 模拟AI生成过程 - 生成"安乐死"议题
    setTimeout(() => {
      const newTopic: AIGeneratedTopic = {
        title: '安乐死是否应该合法化？',
        description: '围绕尊严死亡与生命价值展开的公共争议',
        tags: ['医疗伦理', 'AI生成'],
        difficulty: difficultyLevel,
        duration: difficultyLevel === "入门" ? 25 : 40
      };
      
      setGeneratedTopic(newTopic);
      setIsGenerating(false);
    }, 1500);
  };

  // 添加AI生成的议题到主列表
  const addGeneratedTopic = () => {
    if (!generatedTopic) return;
    
    const newTopic: Topic = {
      id: 'ai-euthanasia-01', // 使用固定ID确保只有一个"安乐死"议题
      title: generatedTopic.title,
      description: generatedTopic.description,
      tags: generatedTopic.tags,
      difficulty: generatedTopic.difficulty,
      duration: generatedTopic.duration,
      isAIGenerated: true,
      source: 'ai' // 添加source字段用于统计
    };
    
    // 检查是否已存在该议题
    const exists = topics.some(t => t.id === newTopic.id);
    if (!exists) {
      const updatedTopics = [newTopic, ...topics];
      setTopics(updatedTopics);
      // 保存到localStorage
      localStorage.setItem('ControvLearn_topics', JSON.stringify(updatedTopics));
    }
    
    setGeneratedTopic(null);
    setInterestArea("");
    setControversyAngle("");
    setDrawerOpen(false);
    toast.success('已将「安乐死是否应该合法化？」添加到你的议题列表');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 font-bold text-xl">ControvLearn</div>
            <div className="text-gray-500 text-sm hidden md:inline-block">科学争议素养微课</div>
          </div>
          
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-blue-600 font-medium flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                议题广场
              </a>
              <a href="/my-learning" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <User className="w-4 h-4 mr-2" />
                我的学习
              </a>
              <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                帮助
              </a>
            </nav>
          
           <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                张
              </div>
              <span className="text-gray-700">张同学</span>
            </div>
            <button className="md:hidden text-gray-600" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* 主视觉区 */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                  选择一个科学争议，<br />开始一段思考之旅
                </h1>
                <p className="text-gray-600 text-lg mb-8 max-w-lg">
                  ControvLearn 帮助你练习"阅读—论证—反思"的科学思维方法，提升你的科学争议素养。
                </p>
               <button 
                onClick={handleContinueLastLearning}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续上次学习
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              {lastStudyTopic && (
                <p className="text-sm text-gray-600 mt-2">
                  上次学习：{lastStudyTopic} · 已进行到步骤 {lastStudyStepId}
                </p>
              )}
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <motion.div 
                  className="relative w-full max-w-md h-64 bg-white rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
                          思考之旅
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">科学</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">争议</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">思考</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 我的进度概览区 */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">我的学习进度</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">已完成议题</h3>
                    <p className="text-2xl font-bold text-gray-800">{completedTopics}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">最近学习</h3>
                    <p className="text-lg font-bold text-gray-800">{lastStudyTime}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">当前争议素养目标完成度</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">目标: {goalTopics}个议题</span>
                    <span className="text-sm font-medium text-blue-600">{progressPercent}%</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* 学习趋势图表 */}
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">近期学习趋势</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={studyTrendData}>
                   <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 议题卡片网格区 */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">议题广场</h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDifficulty('all')}
                >
                  全部
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === '入门' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDifficulty('入门')}
                >
                  入门
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === '进阶' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDifficulty('进阶')}
                >
                  进阶
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 ${topic.isAIGenerated ? 'ring-1 ring-blue-200' : ''}`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {topic.isAIGenerated && (
                    <div className="bg-blue-50 px-3 py-1 text-xs text-blue-700 font-medium flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      由 AI 生成
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{topic.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {topic.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      <span 
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          topic.difficulty === "入门" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                       <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {topic.duration}分钟
                        </div>
                        <div className="flex space-x-2">
                          {/* 显示删除按钮只针对AI生成的议题 */}
                          {topic.source === 'ai' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('确定要删除这个 AI 生成的议题吗？删除后相关学习进度将一并更新。')) {
                                  // 从状态中移除该议题
                                  const newTopics = topics.filter(t => t.id !== topic.id);
                                  setTopics(newTopics);
                                  // 保存到localStorage
                                  localStorage.setItem('ControvLearn_topics', JSON.stringify(newTopics));
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              删除
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              // 跳转到议题介绍页
                              window.location.href = `/topic/${topic.id}`;
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                          >
                            进入学习
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </button>
                        </div>
                      </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* AI议题生成侧边栏 */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">让 AI 帮你定制议题</h2>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto">
              {!generatedTopic ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    输入你感兴趣的方向，AI 会为你生成一个标准化的科学争议议题卡片。
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        感兴趣的大致领域
                      </label>
                      <input
                        type="text"
                        value={interestArea}
                        onChange={(e) => setInterestArea(e.target.value)}
                        placeholder="例如：校园管理、AI 技术、环境污染、健康与饮食……"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        想要的争议角度（可选）
                      </label>
                      <input
                        type="text"
                        value={controversyAngle}
                        onChange={(e) => setControversyAngle(e.target.value)}
                        placeholder="例如：是否应该禁止……？是否应该优先……？"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        预期学习难度
                      </label>
                      <select
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value as "入门" | "进阶")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="入门">入门</option>
                        <option value="进阶">进阶</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGenerateTopic}
                    disabled={isGenerating || !interestArea.trim()}
                    className={`mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center ${
                      !interestArea.trim() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin mr-2">
                          <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                        </div>
                        生成中...
                      </>
                    ) : (
                      "生成议题"
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center text-blue-600 mb-4">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="font-medium">AI 生成议题</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{generatedTopic.title}</h3>
                  <p className="text-gray-600 mb-4">{generatedTopic.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {generatedTopic.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    <span 
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        generatedTopic.difficulty === "入门" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {generatedTopic.difficulty}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {generatedTopic.duration}分钟
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={addGeneratedTopic}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      将此议题添加到我的议题列表
                    </button>
                    
                    <button
                      onClick={() => {
                        setGeneratedTopic(null);
                        setInterestArea("");
                        setControversyAngle("");
                      }}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      生成新的议题
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景遮罩 */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setDrawerOpen(false)}
          ></motion.div>
        )}
      </AnimatePresence>

             {/* 底部悬浮按钮 */}
            <motion.button
              className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawerOpen(true)}
            >
              <Sparkles className="w-6 h-6" />
            </motion.button>
    </div>
  );
};

export default Home;