import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getSubjects, getTopicsBySubject, getSubTopicsByTopics, createTest, updateTest, getTestById } from '../api/endpoints';
import { useTestContext } from '../context/TestContext';
import type { Subject, Topic, SubTopic, Test } from '../types';
import { ChevronDown } from 'lucide-react';
import { BreadCrumb } from '../components/BreadCrumb';

const schema = z.object({
  name: z.string().min(1, 'Test name is required'),
  type: z.string().min(1, 'Test type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.string().min(1, 'Difficulty is required'),
  correct_marks: z.number(),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Total time required'),
  total_marks: z.number().min(1, 'Total marks required'),
  total_questions: z.number().min(1, 'Total questions required'),
});

type FormData = z.infer<typeof schema>;


export default function CreateTestPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { setCurrentTest } = useTestContext();

  const [subjects,      setSubjects]      = useState<Subject[]>([]);
  const [topics,        setTopics]        = useState<Topic[]>([]);
  const [subTopics,     setSubTopics]     = useState<SubTopic[]>([]);
  const [loadedTest,    setLoadedTest]    = useState<Test | null>(null);
  const [loadingSubjects,  setLoadingSubjects]  = useState(true);
  const [loadingTopics,    setLoadingTopics]    = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'chapterwise',
      topics: [],
      sub_topics: [],
      correct_marks: 4,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 100,
      total_questions: 25,
      status: 'draft',
    },
  });

  const selectedSubject = watch('subject');
  const selectedTopics = watch('topics');
  const selectedType = watch('type');

  useEffect(() => {
    getSubjects().then((r) => {
      setSubjects(r.data.data || []);
      setLoadingSubjects(false);
    }).catch(() => setLoadingSubjects(false));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      getTestById(id).then((r) => {
        const t = r.data.data;
        setCurrentTest(t);
        setLoadedTest(t);
        setValue('name', t.name);
        setValue('type', t.type || 'chapterwise');
        setValue('difficulty', t.difficulty || 'medium');
        setValue('correct_marks', t.correct_marks || 4);
        setValue('wrong_marks', t.wrong_marks ?? -1);
        setValue('unattempt_marks', t.unattempt_marks ?? 0);
        setValue('total_time', t.total_time || 60);
        setValue('total_marks', t.total_marks || 100);
        setValue('total_questions', t.total_questions || 25);
      }).catch(() => toast.error('Failed to load test'));
    }
  }, [id]);

  useEffect(() => {
    if (!isEdit || !loadedTest || subjects.length === 0) return;
    const subjectId = loadedTest.subject_id
      ?? subjects.find(s => s.name === loadedTest.subject)?.id;
    if (subjectId) setValue('subject', subjectId);
  }, [isEdit, loadedTest, subjects]);

  useEffect(() => {
    if (!isEdit || !loadedTest || topics.length === 0) return;
    const ids = (loadedTest.topic_ids ?? loadedTest.topics ?? [])
      .map(v => topics.find(t => t.id === v || t.name === v)?.id)
      .filter(Boolean) as string[];
    if (ids.length > 0) setValue('topics', ids);
  }, [isEdit, loadedTest, topics]);

  useEffect(() => {
    if (!isEdit || !loadedTest || subTopics.length === 0) return;
    const ids = (loadedTest.sub_topic_ids ?? loadedTest.sub_topics ?? [])
      .map(v => subTopics.find(s => s.id === v || s.name === v)?.id)
      .filter(Boolean) as string[];
    if (ids.length > 0) setValue('sub_topics', ids);
  }, [isEdit, loadedTest, subTopics]);

  useEffect(() => {
    if (!selectedSubject) { setTopics([]); setSubTopics([]); return; }
    setLoadingTopics(true);
    getTopicsBySubject(selectedSubject).then((r) => {
      setTopics(r.data.data || []);
      setLoadingTopics(false);
    }).catch(() => setLoadingTopics(false));
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedTopics?.length) { setSubTopics([]); return; }
    setLoadingSubTopics(true);
    getSubTopicsByTopics(selectedTopics).then((r) => {
      setSubTopics(r.data.data || []);
      setLoadingSubTopics(false);
    }).catch(() => {
      Promise.all(selectedTopics.map(tid =>
        import('../api/endpoints').then(m => m.getSubTopicsByTopic(tid))
      )).then(results => {
        const all = results.flatMap(r => r.data.data || []);
        setSubTopics(all);
        setLoadingSubTopics(false);
      }).catch(() => setLoadingSubTopics(false));
    });
  }, [JSON.stringify(selectedTopics)]);


  const onSubmit = async (data: FormData, isDraft = false) => {
    try {
      const { ...rest } = data;
      let res;
      if (isEdit && id) {
        res = await updateTest(id, { ...rest, status: isDraft ? 'draft' : undefined });
      } else {
        res = await createTest({ ...rest, ...(isDraft ? { status: 'draft' } : {}) });
      }
      const test = res.data.data;
      setCurrentTest(test);
      toast.success(isDraft ? 'Saved as draft!' : 'Test saved! Now add questions.');
      navigate(`/test/${test.id}/questions`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to save test');
    }
  };

  const handleNextStep = handleSubmit((data) => onSubmit(data, true));

  const TABS = [
    { key: 'chapterwise', label: 'Chapter Wise' },
    { key: 'practice', label: 'PYQ' },
    { key: 'mock', label: 'Mock Test' },
  ];

  return (
    <div className="create-test-page">
      <BreadCrumb isEdit={isEdit} TABS={TABS} selectedType={selectedType}/>
      <div className="type-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn${selectedType === tab.key ? ' active' : ''}`}
            onClick={() => setValue('type', tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="form-card">
        <form>
          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <div className="select-wrapper">
                <select className={`form-input${errors.subject ? ' error' : ''}`} {...register('subject')}>
                  <option value="">{loadingSubjects ? 'Loading...' : 'Choose from Drop-down'}</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={15} className="select-chevron" />
              </div>
              {errors.subject && <span className="error-msg">{errors.subject.message}</span>}
            </div>

            <div className="form-group">
              <label>Name of Test</label>
              <input
                type="text"
                className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Enter name of Test"
                {...register('name')}
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Topic</label>
              <div className="select-wrapper">
                <select
                  className={`form-input${errors.topics ? ' error' : ''}`}
                  disabled={!selectedSubject || loadingTopics}
                  value={selectedTopics?.[0] ?? ''}
                  onChange={e => {
                    setValue('topics', e.target.value ? [e.target.value] : [], { shouldValidate: true });
                    setValue('sub_topics', []);
                  }}
                >
                  <option value="">{loadingTopics ? 'Loading...' : 'Choose from Drop-down'}</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={15} className="select-chevron" />
              </div>
              {errors.topics && <span className="error-msg">{errors.topics.message}</span>}
            </div>

            <div className="form-group">
              <label>Sub Topic</label>
              <div className="select-wrapper">
                <select
                  className="form-input"
                  disabled={!selectedTopics?.length || loadingSubTopics}
                  value={watch('sub_topics')?.[0] ?? ''}
                  onChange={e => setValue('sub_topics', e.target.value ? [e.target.value] : [])}
                >
                  <option value="">{loadingSubTopics ? 'Loading...' : 'Choose from Drop-down'}</option>
                  {subTopics.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
                <ChevronDown size={15} className="select-chevron" />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                className={`form-input${errors.total_time ? ' error' : ''}`}
                placeholder="Enter the time"
                {...register('total_time', { valueAsNumber: true })}
              />
              {errors.total_time && <span className="error-msg">{errors.total_time.message}</span>}
            </div>

            <div className="form-group">
              <label>Test Difficulty Level</label>
              <div className="radio-group">
                {[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Difficult' }].map(opt => (
                  <label key={opt.value} className="radio-item">
                    <input type="radio" value={opt.value} {...register('difficulty')} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.difficulty && <span className="error-msg">{errors.difficulty.message}</span>}
            </div>
          </div>

          <div className="marking-scheme">
            <span className="marking-scheme__label">Marking Scheme:</span>
            <div className="marking-scheme__grid">
              <div className="scheme-col">
                <label>Wrong Answer</label>
                <input type="number" step="0.5" className="form-input scheme-input" {...register('wrong_marks', { valueAsNumber: true })} />
              </div>
              <div className="scheme-col">
                <label>Unattempted</label>
                <input type="number" step="0.5" className="form-input scheme-input" {...register('unattempt_marks', { valueAsNumber: true })} />
              </div>
              <div className="scheme-col">
                <label>Correct Answer</label>
                <input type="number" step="0.5" className="form-input scheme-input" {...register('correct_marks', { valueAsNumber: true })} />
              </div>
              <div className="scheme-col">
                <label>No of Questions</label>
                <input type="number" className="form-input" placeholder="Ex:250" {...register('total_questions', { valueAsNumber: true })} />
                {errors.total_questions && <span className="error-msg">{errors.total_questions.message}</span>}
              </div>
              <div className="scheme-col">
                <label className="muted">Total Marks</label>
                <input type="number" className="form-input" placeholder="Ex:250" {...register('total_marks', { valueAsNumber: true })} />
                {errors.total_marks && <span className="error-msg">{errors.total_marks.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleNextStep}>
              {isSubmitting
                ? <span className="spinner-border spinner-border-sm" />
                : <><span>Next</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
