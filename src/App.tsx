import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Download, 
  MapPin, 
  GraduationCap, 
  Target, 
  Heart, 
  BookOpen, 
  Users, 
  AlertCircle,
  Copy,
  Printer,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PROVINCES, 
  SUBJECT_COMBINATIONS, 
  TARGET_TIERS, 
  CITY_PREFERENCES, 
  BUDGET_LEVELS, 
  PARENT_PRIORITIES, 
  STUDY_ISSUES, 
  OUTPUT_NEEDS 
} from './constants';

// --- Types ---
interface ExamRecord {
  id: string;
  name: string;
  date: string;
  totalScore: string;
  gradeRank: string;
  rankSize: string;
  provinceRank?: string;
  chinese?: string;
  math?: string;
  english?: string;
  physics?: string;
  chemistry?: string;
  biology?: string;
  politics?: string;
  history?: string;
  geography?: string;
  note?: string;
}

interface FormData {
  studentName: string;
  province: string;
  grade: string;
  is2026Current: string;
  examMode: string;
  subjectCombination: string;
  schoolName: string;
  city: string;
  
  targetScore: string;
  targetRank: string;
  targetTier: string;
  
  preferredMajors: string;
  avoidMajors: string;
  acceptAdjustment: string;
  acceptOutProvince: string;
  cityPreference: string;
  budget: string;
  parentPriorities: string[];
  
  strongSubjects: string;
  weakSubjects: string;
  weakPointDetail: string;
  easyImprove: string;
  subjectTrend: string;
  
  weekdayHours: string;
  weekendHours: string;
  hasTutoring: string;
  focusScore: number;
  executionScore: number;
  reviewScore: number;
  phoneInterference: number;
  stressScore: number;
  studyIssues: string[];
  
  careerGoal: string;
  dreamSchools: string;
  physicalLimit: string;
  outputNeeds: string[];
  adviceStyle: string;
  notes: string;
}

// --- Initial State ---
const initialFormData: FormData = {
  studentName: '',
  province: '',
  grade: '高三',
  is2026Current: '是',
  examMode: '',
  subjectCombination: '',
  schoolName: '',
  city: '',
  targetScore: '',
  targetRank: '',
  targetTier: '',
  preferredMajors: '',
  avoidMajors: '',
  acceptAdjustment: '看情况',
  acceptOutProvince: '是',
  cityPreference: '新一线',
  budget: '一般 (普通公办标准)',
  parentPriorities: [],
  strongSubjects: '',
  weakSubjects: '',
  weakPointDetail: '',
  easyImprove: '',
  subjectTrend: '',
  weekdayHours: '',
  weekendHours: '',
  hasTutoring: '没有',
  focusScore: 50,
  executionScore: 50,
  reviewScore: 50,
  phoneInterference: 50,
  stressScore: 50,
  studyIssues: [],
  careerGoal: '就业优先',
  dreamSchools: '',
  physicalLimit: '',
  outputNeeds: [],
  adviceStyle: '张雪峰蒸馏版',
  notes: ''
};

const createEmptyExam = (): ExamRecord => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  date: '',
  totalScore: '',
  gradeRank: '',
  rankSize: '',
});

export default function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [exams, setExams] = useState<ExamRecord[]>([createEmptyExam(), createEmptyExam()]);
  const [summary, setSummary] = useState<string>('');
  const [showStatus, setShowStatus] = useState<string>('未导出');

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (listName: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentList = prev[listName] as string[];
      if (currentList.includes(value)) {
        return { ...prev, [listName]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [listName]: [...currentList, value] };
      }
    });
  };

  const addExam = () => {
    setExams(prev => [...prev, createEmptyExam()]);
  };

  const removeExam = (id: string) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
  };

  const updateExam = (id: string, field: keyof ExamRecord, value: string) => {
    setExams(prev => prev.map(exam => exam.id === id ? { ...exam, [field]: value } : exam));
  };

  const generateReport = () => {
    const report = buildTextSummary(formData, exams);
    setSummary(report);
    setShowStatus('已生成报告');
  };

  const loadSampleData = () => {
    setFormData({
      ...initialFormData,
      studentName: '林同学',
      province: '江苏',
      grade: '高三',
      examMode: '3+1+2',
      subjectCombination: '物化生',
      targetTier: '211',
      preferredMajors: '计算机、人工智能、电子信息',
      avoidMajors: '医学、土木',
      parentPriorities: ['就业率', '未来考公考编'],
      weakSubjects: '数学、物理',
      focusScore: 70,
      executionScore: 65,
      studyIssues: ['拖延症', '物理基础不牢'],
      outputNeeds: ['大学推荐', '录取可能性(冲稳保)'],
    });
    const sampleExams = [
      { id: '1', name: '高三上期中', date: '2024-11', totalScore: '582', gradeRank: '145', rankSize: '1200' },
      { id: '2', name: '南京市一模', date: '2025-01', totalScore: '596', gradeRank: '120', rankSize: '1200' }
    ];
    setExams(sampleExams as any);
    setShowStatus('已载入样例数据');
  };

  const copyToClipboard = async () => {
    if (!summary) generateReport();
    await navigator.clipboard.writeText(summary);
    setShowStatus('已复制代码到剪贴板');
  };

  // --- Derived ---
  const completionRate = useMemo(() => {
    const required = ['studentName', 'province', 'examMode', 'subjectCombination', 'targetTier', 'preferredMajors'];
    const filled = required.filter(key => !!(formData as any)[key]).length;
    return Math.round((filled / required.length) * 100);
  }, [formData]);

  return (
    <div className="min-h-screen pb-20 selection:bg-navy/10">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-navy via-navy/95 to-teal p-8 md:p-12 text-paper shadow-2xl"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gold text-xs font-black uppercase tracking-widest mb-4">
                Parent Intake Form
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
                2026 高三家长信息采集页
              </h1>
              <p className="text-paper/70 text-lg md:text-xl font-medium leading-relaxed">
                建立深度的“学生画像”，帮助我为您提供最精准的大学建议、专业定位及提分路径。
                <br className="hidden md:block" />请尽可能详细填写，这将直接决定分析报告的可信度。
              </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[240px]">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-gold text-xs font-bold mb-1 uppercase tracking-wider">当前填写进度</div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-black">{completionRate}%</span>
                  <span className="text-xs text-white/40">核心字段 ${completionRate >= 100 ? '已填完' : '待完善'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    className="h-full bg-linear-to-r from-gold to-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract background art */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 mt-8 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation / Metrics (Sticky Sidebar on Desktop) */}
        <aside className="lg:col-span-3 w-full lg:sticky lg:top-8 space-y-6">
          <div className="paper-panel p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-navy" />
              填写步骤
            </h3>
            <nav className="space-y-1">
              {[
                { id: 'core', label: '1. 基础身份', icon: GraduationCap },
                { id: 'scores', label: '2. 成绩位次', icon: Target },
                { id: 'prefs', label: '3. 偏好预算', icon: Heart },
                { id: 'study', label: '4. 学习状态', icon: BookOpen },
                { id: 'limits', label: '5. 限制要求', icon: AlertCircle },
                { id: 'export', label: '6. 导出回传', icon: Download },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-navy/5 text-muted hover:text-navy transition-all group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-black/5">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                  <div className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1 leading-none">填表贴士</div>
                  <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                    至少填入3次考试记录，能产生更精准的趋势曲线。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Form Body */}
        <div className="lg:col-span-9 space-y-8 w-full">
          
          {/* Section 1: Core Info */}
          <section id="core" className="paper-panel">
            <div className="bg-linear-to-r from-navy/5 to-transparent px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Section 01</span>
                <h2 className="text-2xl font-black tracking-tight text-navy">学生基础身份</h2>
              </div>
              <GraduationCap className="w-8 h-8 text-navy/10" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="label-title">学生姓名/代称 <span className="text-red-500">*</span></label>
                  <input 
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="input-field" 
                    placeholder="如：小林 / 同学A" 
                  />
                </div>
                <div>
                  <label className="label-title">所在省份 <span className="text-red-500">*</span></label>
                  <select name="province" value={formData.province} onChange={handleInputChange} className="input-field">
                    <option value="">请选择</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-title">高考模式 <span className="text-red-500">*</span></label>
                  <select name="examMode" value={formData.examMode} onChange={handleInputChange} className="input-field">
                    <option value="">请选择</option>
                    <option value="3+3">3+3 (京、沪、浙等)</option>
                    <option value="3+1+2">3+1+2 (粤、苏、湘等)</option>
                    <option value="老高考">老高考 (河南、四川等)</option>
                  </select>
                </div>
                <div>
                  <label className="label-title">选科组合 <span className="text-red-500">*</span></label>
                  <select name="subjectCombination" value={formData.subjectCombination} onChange={handleInputChange} className="input-field">
                    <option value="">请选择</option>
                    {SUBJECT_COMBINATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-title">所在学校 (可不填)</label>
                  <input name="schoolName" value={formData.schoolName} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="label-title">所在城市</label>
                  <input name="city" value={formData.city} onChange={handleInputChange} className="input-field" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Exam Records */}
          <section id="scores" className="paper-panel">
            <div className="bg-linear-to-r from-navy/5 to-transparent px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Section 02</span>
                <h2 className="text-2xl font-black tracking-tight text-navy">历次考试与目标</h2>
              </div>
              <Target className="w-8 h-8 text-navy/10" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-10 border-b border-black/5">
                <div>
                  <label className="label-title">目标高考总分</label>
                  <input name="targetScore" value={formData.targetScore} onChange={handleInputChange} className="input-field" type="number" />
                </div>
                <div>
                  <label className="label-title">目标省位次</label>
                  <input name="targetRank" value={formData.targetRank} onChange={handleInputChange} className="input-field" type="number" />
                </div>
                <div>
                  <label className="label-title">期望大学层级 <span className="text-red-500">*</span></label>
                  <select name="targetTier" value={formData.targetTier} onChange={handleInputChange} className="input-field">
                    <option value="">请选择</option>
                    {TARGET_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {exams.map((exam, idx) => (
                    <motion.div 
                      key={exam.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 rounded-2xl border border-black/5 bg-paper-2 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-navy/30 bg-white px-3 py-1 rounded-full border border-black/5 uppercase tracking-tighter"> 
                          Exam {idx + 1}
                        </span>
                        <button onClick={() => removeExam(exam.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted mb-1 block">考试名称</label>
                          <input 
                            value={exam.name} 
                            onChange={(e) => updateExam(exam.id, 'name', e.target.value)} 
                            className="w-full text-sm py-2 px-3 rounded-lg border bg-white focus:outline-none" 
                            placeholder="如：高三第一次月考" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted mb-1 block">总分</label>
                          <input 
                            value={exam.totalScore} 
                            onChange={(e) => updateExam(exam.id, 'totalScore', e.target.value)} 
                            className="w-full text-sm py-2 px-3 rounded-lg border bg-white focus:outline-none" 
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted mb-1 block">年级排名</label>
                          <input 
                            value={exam.gradeRank} 
                            onChange={(e) => updateExam(exam.id, 'gradeRank', e.target.value)} 
                            className="w-full text-sm py-2 px-3 rounded-lg border bg-white focus:outline-none" 
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted mb-1 block">排名总人数</label>
                          <input 
                            value={exam.rankSize} 
                            onChange={(e) => updateExam(exam.id, 'rankSize', e.target.value)} 
                            className="w-full text-sm py-2 px-3 rounded-lg border bg-white focus:outline-none" 
                            type="number"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={addExam}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-black/10 hover:border-navy/20 hover:bg-navy/5 text-muted hover:text-navy transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-widest">新增考试记录</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Preferences */}
          <section id="prefs" className="paper-panel">
            <div className="bg-linear-to-r from-navy/5 to-transparent px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Section 03</span>
                <h2 className="text-2xl font-black tracking-tight text-navy">大学偏好与预算</h2>
              </div>
              <Heart className="w-8 h-8 text-navy/10" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="label-title text-teal font-black">意向专业方向 <span className="text-red-500">*</span></label>
                    <textarea 
                      name="preferredMajors" 
                      value={formData.preferredMajors} 
                      onChange={handleInputChange} 
                      className="input-field min-h-[100px]" 
                      placeholder="如：电子信息、计算机、人工智能、经济学" 
                    />
                  </div>
                  <div>
                    <label className="label-title text-red-700/60">不接受的专业 <span className="text-red-500">*</span></label>
                    <input 
                      name="avoidMajors" 
                      value={formData.avoidMajors} 
                      onChange={handleInputChange} 
                      className="input-field" 
                      placeholder="如：医学、土木、学前教育" 
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="label-title">城市/地理偏好</label>
                    <select name="cityPreference" value={formData.cityPreference} onChange={handleInputChange} className="input-field">
                      {CITY_PREFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-title">家庭预算方案</label>
                    <select name="budget" value={formData.budget} onChange={handleInputChange} className="input-field">
                      {BUDGET_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-title">是否出省</label>
                      <select name="acceptOutProvince" value={formData.acceptOutProvince} onChange={handleInputChange} className="input-field">
                        <option>是</option>
                        <option>否</option>
                        <option>看情况</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-title">专业调剂</label>
                      <select name="acceptAdjustment" value={formData.acceptAdjustment} onChange={handleInputChange} className="input-field">
                        <option>接受</option>
                        <option>不接受</option>
                        <option>看情况</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-paper-2 p-6 rounded-[22px] border border-black/5">
                <label className="label-title mb-4">家长最看重的维度 (多选)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PARENT_PRIORITIES.map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => handleCheckboxToggle('parentPriorities', p)}
                      className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        formData.parentPriorities.includes(p) 
                        ? 'bg-navy text-white border-navy ring-4 ring-navy/10' 
                        : 'bg-white text-muted border-black/5 hover:border-navy/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Study State */}
          <section id="study" className="paper-panel">
            <div className="bg-linear-to-r from-navy/5 to-transparent px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Section 04</span>
                <h2 className="text-2xl font-black tracking-tight text-navy">学习力与学科状态</h2>
              </div>
              <BookOpen className="w-8 h-8 text-navy/10" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-black/5">
                <div className="space-y-6">
                  <div>
                    <label className="label-title">最擅长的学科</label>
                    <input name="strongSubjects" value={formData.strongSubjects} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div>
                    <label className="label-title">最薄弱的学科</label>
                    <input name="weakSubjects" value={formData.weakSubjects} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="label-title">近期学科趋势说明</label>
                    <textarea 
                      name="subjectTrend" 
                      value={formData.subjectTrend} 
                      onChange={handleInputChange} 
                      className="input-field min-h-[100px]" 
                      placeholder="如：数学成绩在大规模模拟中偏稳，物理大题容易丢分。" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: '专注度', name: 'focusScore', left: '涣散', right: '极佳' },
                  { label: '执行力', name: 'executionScore', left: '拖延', right: '雷厉' },
                  { label: '纠错复盘习惯', name: 'reviewScore', left: '没有', right: '深刻' },
                  { label: '手机/娱乐干扰', name: 'phoneInterference', left: '无', right: '极强' },
                  { label: '焦虑/心理压力', name: 'stressScore', left: '松弛', right: '极大' },
                ].map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-navy">{s.label}</span>
                      <span className="text-xl font-black text-navy/20">{(formData as any)[s.name]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-muted font-bold min-w-[30px]">{s.left}</span>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={(formData as any)[s.name]}
                        onChange={(e) => handleSliderChange(s.name, parseInt(e.target.value))}
                        className="flex-1 accent-navy h-1.5 rounded-full bg-black/5 appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-muted font-bold min-w-[30px]">{s.right}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Limits */}
          <section id="limits" className="paper-panel">
            <div className="bg-linear-to-r from-navy/5 to-transparent px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Section 05</span>
                <h2 className="text-2xl font-black tracking-tight text-navy">限制、要求与风险</h2>
              </div>
              <AlertCircle className="w-8 h-8 text-navy/10" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="label-title">目标/底线职业导向</label>
                    <input name="careerGoal" value={formData.careerGoal} onChange={handleInputChange} className="input-field" placeholder="如：只要名校背景，不介意跨行" />
                  </div>
                  <div>
                    <label className="label-title">报考身体/政审限制</label>
                    <textarea 
                      name="physicalLimit" 
                      value={formData.physicalLimit} 
                      onChange={handleInputChange} 
                      className="input-field min-h-[100px]" 
                      placeholder="如：近视600度以上、色弱、家族政审等" 
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-navy/5 p-5 rounded-2xl">
                    <label className="label-title mb-3">希望输出的内容 (多选) <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                       {OUTPUT_NEEDS.map(n => (
                        <label key={n} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.outputNeeds.includes(n)}
                            onChange={() => handleCheckboxToggle('outputNeeds', n)}
                            className="w-4 h-4 rounded border-black/10 text-navy focus:ring-navy" 
                          />
                          <span className={`${formData.outputNeeds.includes(n) ? 'text-navy font-bold' : 'text-muted'} text-xs transition-colors group-hover:text-navy`}>{n}</span>
                        </label>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-title">希望得到的分析风格</label>
                    <select name="adviceStyle" value={formData.adviceStyle} onChange={handleInputChange} className="input-field">
                      <option>张雪峰蒸馏版 (大白话、直接、说重点)</option>
                      <option>专业报告版 (严谨数据、深度背景)</option>
                      <option>两个都要 (混合模式)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Export */}
          <section id="export" className="paper-panel">
            <div className="bg-navy p-8 text-paper">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black mb-1">完成信息录入</h2>
                  <p className="text-paper/60 text-sm font-medium">请审核上方内容，随后导出回传给我。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={loadSampleData} className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    载入样例
                  </button>
                  <button onClick={() => { setFormData(initialFormData); setExams([createEmptyExam()]); }} className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-red-300">
                    <RotateCcw className="w-3 h-3" />
                    重置
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="space-y-4">
                  <button 
                    onClick={generateReport}
                    className="w-full py-5 rounded-2xl bg-gold text-navy text-lg font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3 group"
                  >
                    <ClipboardCheck className="w-6 h-6 group-hover:animate-bounce" />
                    生成回传摘要
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={copyToClipboard}
                      className="py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      复制摘要
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      直接打印
                    </button>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${summary ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
                      <span className="text-xs font-bold text-paper/40">当前状态</span>
                    </div>
                    <p className="text-sm font-medium text-paper/80">{showStatus}</p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-white/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <textarea 
                    readOnly
                    value={summary}
                    placeholder="报告预览区域..."
                    className="relative w-full h-full min-h-[200px] bg-white/5 border border-white/10 rounded-2xl p-6 text-paper/90 text-sm font-mono focus:outline-none resize-none leading-relaxed"
                  />
                  {!summary && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Download className="w-8 h-8 text-white/10 mx-auto mb-2" />
                        <span className="text-xs text-white/20 font-bold tracking-widest uppercase">请生成报告</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold to-yellow-600 flex items-center justify-center text-navy font-black italic">A</div>
                  <div>
                    <div className="text-xs font-black text-paper/20 tracking-tighter uppercase italic">Export Engine</div>
                    <div className="text-xs font-bold text-paper/60 uppercase tracking-[0.3em]">Built for 2026 Gaokao</div>
                  </div>
                </div>
                <div className="text-[10px] text-white/20 font-mono">
                  VERSION 2.4.0 • REVISION DATA COLLECTOR
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-20 border-t border-black/5 py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-6 opacity-20 filter grayscale">
           <span className="h-px w-10 bg-navy" />
           <Target className="w-6 h-6" />
           <span className="h-px w-10 bg-navy" />
        </div>
        <p className="text-xs text-muted font-bold tracking-widest uppercase">
          祝愿学子 2026 金榜题名 • 信息决定高度
        </p>
      </footer>
    </div>
  );
}

// --- Helper Functions ---
function buildTextSummary(data: FormData, exams: ExamRecord[]): string {
  const examText = exams
    .filter(e => e.name || e.totalScore)
    .map((e, idx) => `  ${idx + 1}. [${e.date || '未知时间'}] ${e.name}：总分 ${e.totalScore || '--'}，年级排位 ${e.gradeRank || '--'}/${e.rankSize || '--'}`)
    .join('\n');

  return `--- 2026 高考采集报告：${data.studentName || '某同学'} ---

【核心资料】
身份信息：${data.province} / ${data.examMode} / ${data.subjectCombination}
目标定位：总分 ${data.targetScore || '--'}分 / 位次 ${data.targetRank || '--'} / 期望 ${data.targetTier}

【历次战绩】
${examText || '  (未填写考试记录)'}

【意向方向】
专业偏好：${data.preferredMajors || '未具体说明'}
不考虑专业：${data.avoidMajors || '无'}
地理偏好：${data.cityPreference} (是否出省：${data.acceptOutProvince})
家长关注：${data.parentPriorities.join('、') || '未选'}

【学情诊断】
学科：强项[${data.strongSubjects || '未明'}]，弱项[${data.weakSubjects || '未明'}]
趋势：${data.subjectTrend || '未说明'}
状态评分：专注度(${data.focusScore})｜执行力(${data.executionScore})｜复盘习惯(${data.reviewScore})
心理/环境：手机干扰(${data.phoneInterference})｜焦虑感(${data.stressScore})
当前学习问题：${data.studyIssues.join('、') || '暂无说明'}

【服务需求】
报考限制：${data.physicalLimit || '无'}
希望获得：${data.outputNeeds.join('、') || '院校/专业建议'}
分析风格：${data.adviceStyle}
补充：${data.notes || '无'}

报告生成时间：${new Date().toLocaleString()}
`;
}
