import { useState } from "react";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Circle,
  Square
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
import { getLastVisitedLearningPage, useLearningStats } from "@/lib/utils";

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
  participatedTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  lastStudyTime: string;
}

// 定义学习环节类型
interface LearningStep {
  id: string;
  name: string;
  isCompleted: boolean;
}

// 定义学习记录类型
interface LearningRecord {
  id: string;
  topic: Topic;
  status: "not-started" | "in-progress" | "completed";
  steps: LearningStep[];
  lastOperationTime: string;
  // 反思信息（展开时显示）
  reflection?: {
    position: string; // 支持/反对/保留意见
    reflectionText: string;
    thinkingPrompts: string[];
  };
  // 是否展开查看详情
  isExpanded?: boolean;
}

  const MyLearning = () => {
  const navigate = useNavigate();
  
  // 从localStorage加载议题数据
  const getTopicsFromLocalStorage = (): Topic[] => {
    try {
      const savedTopics = localStorage.getItem('ControvLearn_topics');
      return savedTopics ? JSON.parse(savedTopics) : [];
    } catch (error) {
      console.error('Failed to get topics from localStorage:', error);
      // 如果localStorage中没有数据，使用默认数据
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
          id: "ai-123456",
          title: "校园生活中的科学争议",
          description: "这是一个关于校园生活的科学争议议题，适合入门学习者进行深入探讨和分析。",
          tags: ["校园生活", "AI生成"],
          difficulty: "入门",
          duration: 25,
          isAIGenerated: true,
          source: 'ai'
        }
      ];
    }
  };
  
  // 获取议题数据
  const localStorageTopics = getTopicsFromLocalStorage();
  
  // 使用统一的统计hook
  const { 
    participatedTopics, 
    completedTopics, 
    inProgressTopics 
  } = useLearningStats(localStorageTopics);

  // 模拟数据 - 学习记录
  // 过滤掉learningRecords中可能存在的无效记录
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([
    {
      id: "1",
      topic: localStorageTopics[0],
      status: "completed",
      steps: [
        { id: "1", name: "背景阅读", isCompleted: true },
        { id: "2", name: "观点分析", isCompleted: true },
        { id: "3", name: "判断立场", isCompleted: true },
        { id: "4", name: "反思总结", isCompleted: true }
      ],
      lastOperationTime: "2025-12-20 16:30",
      reflection: {
        position: "反对",
        reflectionText: "通过学习，我认为核污染水排海存在长期环境风险，需要更谨慎的评估和更安全的处理方案。",
        thinkingPrompts: ["证据充分性", "长期影响评估", "替代方案比较"]
      }
    },
    {
      id: "2",
      topic: localStorageTopics[1],
      status: "in-progress",
      steps: [
        { id: "1", name: "背景阅读", isCompleted: true },
        { id: "2", name: "观点分析", isCompleted: true },
        { id: "3", name: "判断立场", isCompleted: false },
        { id: "4", name: "反思总结", isCompleted: false }
      ],
      lastOperationTime: "2025-12-18 14:15"
    },
    {
      id: "3",
      topic: localStorageTopics[4],
      status: "not-started",
      steps: [
        { id: "1", name: "背景阅读", isCompleted: false },
        { id: "2", name: "观点分析", isCompleted: false },
        { id: "3", name: "判断立场", isCompleted: false },
        { id: "4", name: "反思总结", isCompleted: false }
      ],
      lastOperationTime: "2025-12-17 09:45"
    },
    {
      id: "4",
      topic: localStorageTopics[2],
      status: "completed",
      steps: [
        { id: "1", name: "背景阅读", isCompleted: true },
        { id: "2", name: "观点分析", isCompleted: true },
        { id: "3", name: "判断立场", isCompleted: true },
        { id: "4", name: "反思总结", isCompleted: true }
      ],
      lastOperationTime: "2025-12-15 11:30",
      reflection: {
        position: "保留意见",
        reflectionText: "基因编辑技术既有巨大潜力，也存在伦理风险，需要在科学发展和伦理规范之间找到平衡。",
        thinkingPrompts: ["伦理边界", "利益风险评估", "监管框架"]
      }
    },
    {
      id: "5",
      topic: localStorageTopics[3],
      status: "in-progress",
      steps: [
        { id: "1", name: "背景阅读", isCompleted: true },
        { id: "2", name: "观点分析", isCompleted: false },
        { id: "3", name: "判断立场", isCompleted: false },
        { id: "4", name: "反思总结", isCompleted: false }
      ],
      lastOperationTime: "2025-12-10 15:20"
    }
  ]);

  // 图表数据
  const chartData = [
    { name: "已完成", value: completedTopics },
    { name: "进行中", value: inProgressTopics },
    { name: "未开始", value: participatedTopics - completedTopics - inProgressTopics }
  ];
  const COLORS = ["#3B82F6", "#06B6D4", "#E5E7EB"];

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

  // 切换展开/收起状态
  const toggleExpand = (recordId: string) => {
    setLearningRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === recordId 
          ? { ...record, isExpanded: !record.isExpanded } 
          : record
      )
    );
  };

  // 继续学习（模拟）
  const continueLearning = (recordId: string) => {
    // 获取记录对应的议题ID
    const record = learningRecords.find(r => r.id === recordId);
    if (record) {
      // 跳转到议题介绍页
      window.location.href = `/topic/${record.topic.id}`;
    }
    
    // 更新学习状态为"学习中"（原型模拟）
    setLearningRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === recordId 
          ? { ...record, status: "in-progress" } 
          : record
      )
    );
  };

  // 获取状态对应的样式和文本
  const getStatusInfo = (status: string) => {
    switch(status) {
      case "completed":
        return { text: "已完成", className: "bg-green-100 text-green-800" };
      case "in-progress":
        return { text: "学习中", className: "bg-blue-100 text-blue-800" };
      case "not-started":
        return { text: "未开始", className: "bg-gray-100 text-gray-800" };
      default:
        return { text: "未知状态", className: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 - 复用S0-1样式 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 font-bold text-xl">ControvLearn</div>
            <div className="text-gray-500 text-sm hidden md:inline-block">科学争议素养微课</div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              议题广场
            </a>
            <a href="/my-learning" className="text-blue-600 font-medium flex items-center">
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
        {/* 页面主标题区 */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                我的学习档案
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-lg">
                这里记录了你在科学争议学习中的思考路径与进展
              </p>
            </div>
          </div>
        </section>

        {/* 学习总览概览区 */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">学习总览</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:translate-y-[-5px] transition-transform duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                <div>
                <h3 className="text-sm text-gray-500">已参与议题</h3>
               <p className="text-2xl font-bold text-gray-800">{participatedTopics}</p>
             </div>
           </div>
         </div>
               
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:translate-y-[-5px] transition-transform duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                 <h3 className="text-sm text-gray-500">已完成议题</h3>
                <p className="text-2xl font-bold text-gray-800">{completedTopics}</p>
              </div>
            </div>
          </div>
              
               <div 
                 className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:translate-y-[-5px] transition-transform duration-300"
               >
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                     <Clock className="w-6 h-6" />
                   </div>
                   <div>
                <h3 className="text-sm text-gray-500">进行中议题</h3>
               <p className="text-2xl font-bold text-gray-800">{inProgressTopics}</p>
             </div>
           </div>
         </div>
              
               <div 
                 className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:translate-y-[-5px] transition-transform duration-300"
               >
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                     <Award className="w-6 h-6" />
                   </div>
                   <div>
                <h3 className="text-sm text-gray-500">最近学习</h3>
               <p className="text-lg font-bold text-gray-800">
                 {getLastVisitedLearningPage() ? 
                   new Date(getLastVisitedLearningPage()!.visitedAt).toLocaleString() : 
                   "2025-12-20 16:30"
                 }
               </p>
             </div>
           </div>
         </div>
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

        {/* 我的议题学习记录列表 */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">我的学习记录</h2>
            </div>
            
              {/* 时间线式学习记录列表 - 过滤掉可能为null或undefined的记录 */}
              <div className="space-y-6">
                {learningRecords
                  .filter(Boolean)  // 过滤掉null和undefined
                  .filter(record => record && record.topic)  // 确保记录有topic属性
                  .map((record, index) => {
                const statusInfo = getStatusInfo(record.status);
                
                return (
                  <div key={record.id} className="relative">
                    {/* 时间线连接线 */}
                    {index < learningRecords.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2 z-0"></div>
                    )}
                    
                    {/* 时间线节点 */}
                    <div className={`absolute left-4 top-6 w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 z-10
                      ${record.status === 'completed' ? 'bg-green-500 text-white' : 
                        record.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'}`}
                    >
                      {record.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : record.status === 'in-progress' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    
                    {/* 议题卡片 */}
                     <div 
                       className="ml-12 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:translate-y-[-5px] transition-transform duration-300"
                     >
               {/* AI生成议题标识 */}
                         {record.topic && (record.topic.isAIGenerated || record.topic.source === 'ai') && (
                           <div className="bg-blue-50 px-3 py-1 text-xs text-blue-700 font-medium flex items-center mb-3">
                             <Sparkles className="w-3 h-3 mr-1" />
                             你创建的议题
                           </div>
                         )}
                        
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-800">{record.topic?.title || '未知议题'}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.className}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{record.topic?.description || '暂无描述'}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {record.topic?.tags?.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                tag === 'AI生成' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {tag}
                            </span>
                          )) || (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                              无标签
                            </span>
                          )}
                          {record.topic && (
                            <span 
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                record.topic.difficulty === "入门" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {record.topic.difficulty || '未知难度'}
                            </span>
                          )}
                          {record.topic && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                              {record.topic.duration || 0}分钟
                            </span>
                          )}
                        </div>
                      
                      {/* 学习环节进度 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">已完成环节</h4>
                        <div className="flex space-x-4">
                          {record.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center">
                              <div className={`mr-1 ${step.isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                                {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                              </div>
                              <span className="text-xs text-gray-600">{step.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          最近操作: {record.lastOperationTime}
                        </div>
                        
                        <div className="flex space-x-2">
                          {/* 根据状态显示不同按钮 */}
                          {record.status !== 'completed' && (
                            <button 
                              onClick={() => continueLearning(record.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                            >
                              继续学习
                              <ArrowRight className="ml-1 w-4 h-4" />
                            </button>
                          )}
                          
                          {/* 查看学习记录按钮 */}
                          <button 
                            onClick={() => toggleExpand(record.id)}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {record.isExpanded ? '收起记录' : '查看学习记录'}
                          </button>
                        </div>
                      </div>
                      
                      {/* 学习反思摘要（展开态） */}
                      {record.isExpanded && record.reflection && (
                        <div 
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <h4 className="text-sm font-medium text-gray-700 mb-2">我的反思</h4>
                          
                          <div className="mb-3">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800 mb-2 inline-block">
                              我的立场：{record.reflection.position}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {record.reflection.reflectionText}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {record.reflection.thinkingPrompts.map((prompt, promptIndex) => (
                              <span 
                                key={promptIndex} 
                                className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-800"
                              >
                                {prompt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyLearning;