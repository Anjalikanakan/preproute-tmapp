import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  bulkCreateQuestions, getTestById, updateTest,
  fetchBulkQuestions, getSubjects, getTopicsBySubject, getSubTopicsByTopics,
} from '../api/endpoints';
import { useTestContext } from '../context/TestContext';
import type { Question, Subject, Topic, SubTopic } from '../types';
import {
  Trash2, Pencil, CircleMinus, CircleCheck,
  Bold, Italic, Underline, Strikethrough, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Download, Plus, ChevronsLeft, ChevronsRight,
  Image as ImageIcon,
} from 'lucide-react';
import { BreadCrumb } from '../components/BreadCrumb';
import SubjectIcon from '../assets/images/ar_stickers.svg';
import TimerIcon from '../assets/images/timer.svg';
import MarksIcon from '../assets/images/leaderboard.svg';
import TotalIcon from '../assets/images/quiz.svg';
import DifficultyIcon from '../assets/images/cognition.svg';


const schema = z.object({
  question:       z.string().min(1, 'Question text is required'),
  option1:        z.string().min(1, 'Option 1 is required'),
  option2:        z.string().min(1, 'Option 2 is required'),
  option3:        z.string().min(1, 'Option 3 is required'),
  option4:        z.string().min(1, 'Option 4 is required'),
  subject:        z.string().optional(),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation:    z.string().optional(),
  difficulty:     z.string().optional(),
  topic_id:       z.string().optional(),
  sub_topic_id:   z.string().optional(),
  media_url:      z.string().optional(),
});

type QuestionForm = z.infer<typeof schema>;

const TABS = [
  { key: 'chapterwise', label: 'Chapter Wise' },
  { key: 'pyq', label: 'PYQ' },
  { key: 'mock', label: 'Mock Test' },
];

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Difficult',
};

export default function AddQuestionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTest, setCurrentTest, questions, setQuestions } = useTestContext();

  const [editIndex,        setEditIndex]        = useState<number | null>(null);
  const [restored,         setRestored]         = useState(false);
  const storageKey = id ? `aq-idx-${id}` : null;
  const [currentIndex,     setCurrentIndex]     = useState(() =>
    storageKey ? Math.max(0, Number(localStorage.getItem(storageKey) ?? 0)) : 0
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [subjects,         setSubjects]         = useState<Subject[]>([]);
  const [topics,           setTopics]           = useState<Topic[]>([]);
  const [subTopics,        setSubTopics]        = useState<SubTopic[]>([]);
  const pendingSubTopicRef = useRef<string | null>(null);

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(schema),
    defaultValues: { correct_option: 'option1' },
  });

  const selectedTopic = watch('topic_id');
  const totalQ = currentTest?.total_questions ?? Math.max(questions.length, 1);

  const resolvedSubjectId = subjects.find(s => s.name === currentTest?.subject)?.id
                         ?? currentTest?.subject_id;

  useEffect(() => {
    getSubjects().then((r) => setSubjects(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    getTestById(id).then((r) => {
      const test = r.data.data;
      setCurrentTest(test);
      if (test.questions?.length) {
        fetchBulkQuestions(test.questions)
          .then((qr) => setQuestions(qr.data.data || []))
          .catch(() => {});
      }
    }).catch(() => toast.error('Failed to load test'));
  }, [id]);

  useEffect(() => {
    if (resolvedSubjectId) {
      getTopicsBySubject(resolvedSubjectId)
        .then((r) => setTopics(r.data.data || []))
        .catch(() => {});
    }
  }, [resolvedSubjectId]);

  useEffect(() => {
    if (selectedTopic) {
      getSubTopicsByTopics([selectedTopic])
        .then((r) => {
          setSubTopics(r.data.data || []);
          if (pendingSubTopicRef.current) {
            setValue('sub_topic_id', pendingSubTopicRef.current);
            pendingSubTopicRef.current = null;
          }
        })
        .catch(() => {});
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, String(currentIndex));
  }, [currentIndex, storageKey]);

  useEffect(() => {
    if (questions.length > 0 && !restored) {
      setRestored(true);
      const saved = storageKey ? Math.min(Number(localStorage.getItem(storageKey) ?? 0), questions.length - 1) : 0;
      loadQuestion(saved);
    }
  }, [questions.length]);

  const clearForm = () => {
    setValue('question',       '');
    setValue('option1',        '');
    setValue('option2',        '');
    setValue('option3',        '');
    setValue('option4',        '');
    setValue('correct_option', 'option1');
    setValue('explanation',    '');
    setValue('difficulty',     '');
    setValue('topic_id',       '');
    setValue('sub_topic_id',   '');
    setValue('subject',        resolvedSubjectId ?? '');
  };

  const onSubmitQuestion = (data: QuestionForm) => {
    const q: Question = { ...data, type: 'mcq', test_id: id };
    if (editIndex !== null) {
      const updated = [...questions];
      updated[editIndex] = { ...updated[editIndex], ...q };
      setQuestions(updated);
    } else {
      setQuestions([...questions, q]);
    }
    reset({ correct_option: 'option1' });
    setEditIndex(null);
    toast.success(editIndex !== null ? 'Question updated' : 'Question added');
  };

  const loadQuestion = (index: number) => {
    const q = questions[index];
    if (q) {
      setValue('question',       q.question);
      setValue('option1',        q.option1);
      setValue('option2',        q.option2);
      setValue('option3',        q.option3);
      setValue('option4',        q.option4);
      setValue('correct_option', (q.correct_option as QuestionForm['correct_option']) ?? 'option1');
      setValue('explanation',    q.explanation  ?? '');
      setValue('difficulty',     q.difficulty   ?? '');
      setValue('sub_topic_id',   '');
      setValue('topic_id',       q.topic_id     ?? '');
      if ((q.topic_id ?? '') === selectedTopic) {
        setValue('sub_topic_id', q.sub_topic_id ?? '');
      } else {
        pendingSubTopicRef.current = q.sub_topic_id ?? null;
      }
      setValue('subject',        q.subject ?? resolvedSubjectId ?? '');
      setEditIndex(index);
    } else {
      clearForm();
      setEditIndex(null);
    }
    setCurrentIndex(index);
  };

  const saveToBackend = async (list: Question[]) => {
    setSaving(true);
    try {
      const toPayload = ({ topic_id: _t, subject_id: _si, sub_topic_id: _sti, ...rest }: Question) => ({ ...rest, test_id: id });
      const newQs  = list.filter((q) => !q.id).map(toPayload);
      let   allIds = list.filter((q) => !!q.id).map((q) => q.id as string);

      if (newQs.length > 0) {
        const res     = await bulkCreateQuestions(newQs);
        const created = res.data.data || [];
        allIds = [...allIds, ...created.map((q) => q.id as string)];
        const updatedWithIds = list.map((q) => {
          if (!q.id) { const match = created.shift(); return match || q; }
          return q;
        });
        setQuestions(updatedWithIds);
      }

      await updateTest(id!, { questions: allIds, total_questions: allIds.length });
      toast.success('Questions saved!');
      navigate(`/test/${id}/preview`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  const isLastQuestion = currentIndex >= totalQ - 1;

  const handleSaveAndNext = handleSubmit((formData) => {
    const nextIndex = currentIndex + 1;

    const q: Question = {
      ...formData,
      type: 'mcq',
      test_id: id,
      subject: resolvedSubjectId ?? currentTest?.subject,
    };

    setRestored(true);

    const updatedList = editIndex !== null
      ? questions.map((existing, i) => i === editIndex ? { ...existing, ...q } : existing)
      : [...questions, q];

    setQuestions(updatedList);
    setEditIndex(null);

    if (!isLastQuestion) {
      const nextQ = updatedList[nextIndex];
      if (nextQ) {
        
        setValue('question',       nextQ.question);
        setValue('option1',        nextQ.option1);
        setValue('option2',        nextQ.option2);
        setValue('option3',        nextQ.option3);
        setValue('option4',        nextQ.option4);
        setValue('correct_option', (nextQ.correct_option as QuestionForm['correct_option']) ?? 'option1');
        setValue('explanation',    nextQ.explanation   ?? '');
        setValue('difficulty',     nextQ.difficulty    ?? '');
        setValue('topic_id',       nextQ.topic_id      ?? '');
        setValue('subject',        nextQ.subject       ?? resolvedSubjectId ?? '');
        setEditIndex(nextIndex);
      } else {
        clearForm();
      }
      setCurrentIndex(nextIndex);
    } else {
      toast.success('Questions saved, publish the test');
      reset({ correct_option: 'option1' });
      if (resolvedSubjectId) setValue('subject', resolvedSubjectId);
    }
  });

  const handleSubmitAll = async () => {
    if (questions.length === 0) { toast.error('Add at least one question'); return; }
    await saveToBackend(questions);
  };

  const testType  = currentTest?.type ?? 'chapter';
  const diffKey   = currentTest?.difficulty ?? '';
  const diffLabel = DIFF_LABELS[diffKey] ?? '';

  return (
    <div className="add-questions-page">
      <div className={`aq-layout${sidebarCollapsed ? ' aq-sidebar-collapsed' : ''}`}>

        <aside className="aq-sidebar">
          <div className="aq-sidebar__header">
            {!sidebarCollapsed && <span>Question creation</span>}
            <button
              className="aq-sidebar__toggle"
              onClick={() => setSidebarCollapsed(c => !c)}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              <div className="aq-sidebar__count">Total Questions : <span>{totalQ}</span></div>
              <div className="aq-sidebar__list">
                {Array.from({ length: totalQ }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`aq-q-item${questions[i] ? ' saved' : ''}${currentIndex === i ? ' active' : ''}`}
                    onClick={() => loadQuestion(i)}
                  >
                    {questions[i] ? <CircleCheck className="aq-q-item__dot" size={12} /> : <CircleMinus className="aq-q-item__dot" size={12} />}
                    <span className="aq-q-item__label">Question {i + 1}</span>
                    <ChevronsRight size={13} />
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <div className="aq-main">

          <div className="aq-topbar">
            <BreadCrumb isEdit={!!id} TABS={TABS} selectedType={testType} />
            <button
              className="btn btn-primary"
              style={{ padding: '9px 24px' }}
              onClick={handleSubmitAll}
              disabled={saving}
            >
              {saving
                  ? <span className="spinner-border spinner-border-sm" />
                  : 'Publish'}
            </button>
          </div>

          <div className="aq-info-card">
            <div className="aq-info-card__top">
              <span className="aq-type-badge">
                {TABS.find(t => t.key === testType)?.label ?? 'Chapter Wise'}
              </span>
              <button className="aq-edit-btn" onClick={() => navigate(`/test/${id}/edit`)}>
                <Pencil size={14} />
              </button>
            </div>

            <div className="aq-info-card__row">
              <div className="aq-info-card__chapter">
                <span className="aq-chapter-title">
                  <img src={SubjectIcon} alt="test_name" className="img-fluid" />
                  {currentTest?.name ?? 'Chapter 1'}</span>
                {diffLabel && (
                  <span className={`aq-diff-badge aq-diff-badge--${diffKey}`}>
                    <img src={DifficultyIcon} alt="test_difficulty" className="img-fluid me-1" />
                    {diffLabel}</span>
                )}
              </div>
              <div className="aq-info-stats">
                <span>
                  <img src={TimerIcon} alt="test_time" className="img-fluid" />
                  {currentTest?.total_time      ?? 60}  Min</span>
                <span className='divider'>|</span>
                <span>
                  <img src={TotalIcon} alt="test_time" className="img-fluid" />
                  {currentTest?.total_questions ?? 50}  Q's</span>
                <span className='divider'>|</span>
                <span>
                  <img src={MarksIcon} alt="test_time" className="img-fluid" />
                  {currentTest?.total_marks     ?? 250} Marks</span>
              </div>
            </div>

            <div className="aq-info-card__meta">
              <div className="aq-meta-row">
                <span className="aq-meta-label">Subject</span>
                <span className="aq-meta-value">: {currentTest?.subject ?? '—'}</span>
              </div>
              {(currentTest?.topics?.length ?? 0) > 0 && (
                <div className="aq-meta-row">
                  <span className="aq-meta-label">Topic</span>
                  <div className="aq-tags">: 
                    {currentTest?.topics.slice(0, 4).map(t => (
                      <span key={t} className="aq-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {(currentTest?.sub_topics?.length ?? 0) > 0 && (
                <div className="aq-meta-row">
                  <span className="aq-meta-label">Sub Topic</span>
                  <div className="aq-tags">: 
                    {currentTest?.sub_topics?.slice(0, 4).map(st => (
                      <span key={st} className="aq-tag">{st}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="aq-editor">
            <div className="aq-editor__header">
              <span className="aq-q-counter">
                Question{' '}
                <span className="aq-q-counter__num">{currentIndex + 1}</span>
                <span className="aq-q-counter__total">/{totalQ}</span>
              </span>
              <div className="aq-editor__btns">
                <button type="button" className="aq-btn-action"><Plus size={13} /> MCQ</button>
                <button type="button" className="aq-btn-action"><Download size={13} /> CSV</button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitQuestion)}>
              <button
                type="button"
                className="aq-delete-edits"
                onClick={() => reset({ correct_option: 'option1' })}
              >
                <Trash2 size={13} /> Delete All Edits
              </button>
              <div className={`aq-toolbar${errors.question ? ' error' : ''}`}>
                <button type="button" title="Italic"><Italic       size={13} /></button>
                <button type="button" title="Bold"><Bold         size={13} /></button>
                <button type="button" title="Underline"><Underline    size={13} /></button>
                <button type="button" title="Strikethrough"><Strikethrough size={13} /></button>
                <span className="aq-toolbar__sep" />
                <button type="button" title="Link"><Link2        size={13} /></button>
                <span className="aq-toolbar__sep" />
                <button type="button" title="Align left"><AlignLeft    size={13} /></button>
                <button type="button" title="Align center"><AlignCenter  size={13} /></button>
                <button type="button" title="Align right"><AlignRight   size={13} /></button>
                <button type="button" title="Justify"><AlignJustify size={13} /></button>
                <span className="aq-toolbar__sep" />
                <button type="button" title="Insert image"><ImageIcon    size={13} /></button>
              </div>

              <div className="aq-field">
                <textarea
                  className={`aq-textarea${errors.question ? ' error' : ''}`}
                  placeholder="Type here"
                  rows={4}
                  {...register('question')}
                />
                <button
                  type="button"
                  className="aq-field__del"
                  onClick={() => setValue('question', '')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {errors.question && (
                <span className="error-msg">{errors.question.message}</span>
              )}

              <p className="aq-options-label">Type the options below</p>
              <div className="aq-options">
                {(['option1', 'option2', 'option3', 'option4'] as const).map((opt) => (
                  <div key={opt} className="aq-option">
                    <input
                      type="radio"
                      value={opt}
                      {...register('correct_option')}
                      className="aq-opt-radio"
                    />
                    <div className='aq-option-input'>
                      <input
                        type="text"
                        className={`aq-opt-input${errors[opt] ? ' error' : ''}`}
                        placeholder="Type Option here"
                        {...register(opt)}
                      />
                      <button
                        type="button"
                        className="aq-field__del"
                        style={{ position: 'static' }}
                        onClick={() => setValue(opt, '')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="aq-solution">
                <p className="aq-solution__label">Add Solution</p>
                <div className="aq-field aq-solution__field">
                  <textarea
                    className="aq-textarea"
                    placeholder="Type here"
                    rows={4}
                    {...register('explanation')}
                  />
                  <button
                    type="button"
                    className="aq-field__del"
                    onClick={() => setValue('explanation', '')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="aq-settings">
                <h4 className="aq-settings__title">Question settings</h4>

                <div className="aq-settings__field">
                  <label>Level of Difficulty</label>
                  <div className="select-wrapper">
                    <select className="form-input w-100" {...register('difficulty')}>
                      <option value="">Select from Drop-down</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Difficult</option>
                    </select>
                  </div>
                </div>

                <div className="aq-settings__field">
                  <label>Topic</label>
                  <div className="select-wrapper">
                    <select className="form-input w-100" {...register('topic_id')}>
                      <option value="">Select from Drop-down</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="aq-settings__field">
                  <label>Sub-topic</label>
                  <div className="select-wrapper">
                    <select className="form-input w-100" {...register('sub_topic_id')}>
                      <option value="">Select from Drop-down</option>
                      {subTopics.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" style={{ display: 'none' }} />
            </form>
          </div>

          <div className="aq-footer">
            <button
              type="button"
              className="aq-footer__exit"
              onClick={() => navigate('/dashboard')}
            >
              Exit Test Creation
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '9px 28px' }}
              onClick={handleSaveAndNext}
              disabled={saving}
            >
              {isLastQuestion ? 'Save' : 'Next'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
