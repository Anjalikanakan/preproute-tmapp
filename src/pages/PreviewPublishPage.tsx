import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  publishTest, getTestById, fetchBulkQuestions,
} from '../api/endpoints';
import { useTestContext } from '../context/TestContext';
import {
  CheckCircle, Pencil, Plus, Download, Italic, Bold, Underline, Strikethrough, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, ImageIcon, 
  ChevronsLeft, ChevronsRight, CircleCheck, 
} from 'lucide-react';
import SubjectIcon from '../assets/images/ar_stickers.svg';
import TimerIcon from '../assets/images/timer.svg';
import MarksIcon from '../assets/images/leaderboard.svg';
import TotalIcon from '../assets/images/quiz.svg';
import DifficultyIcon from '../assets/images/cognition.svg';
import { BreadCrumb } from '../components/BreadCrumb';

const TABS = [
  { key: 'chapterwise', label: 'Chapter Wise' },
  { key: 'pyq', label: 'PYQ' },
  { key: 'mock', label: 'Mock Test' },
];

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Difficult',
};

const LIVE_OPTIONS = [
  { key: 'always',  label: 'Always Available' },
  { key: '3weeks',  label: '3 Weeks' },
  { key: '1week',   label: '1 Week' },
  { key: '1month',  label: '1 Month' },
  { key: '2weeks',  label: '2 Weeks' },
  { key: 'custom',  label: 'Custom Duration' },
];

export default function PreviewPublishPage() {
  const navigate   = useNavigate();
  const { id }     = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const viewOnly   = searchParams.get('mode') === 'view';
  const { currentTest, setCurrentTest, questions, setQuestions } = useTestContext();

  const [publishing,      setPublishing]      = useState(false);
  const [sidebarCollapsed,setSidebarCollapsed] = useState(false);
  const [publishTab,      setPublishTab]      = useState<'draft' | 'scheduled'>('draft');
  const [liveUntil,       setLiveUntil]       = useState('always');
  const [endDate,         setEndDate]         = useState('');
  const [endTime,         setEndTime]         = useState('');
  const [scheduleDate,    setScheduleDate]    = useState('');
  const [scheduleTime,    setScheduleTime]    = useState('');
  const [currentIndex,    setCurrentIndex]    = useState(0);

  useEffect(() => {
    if (!id) return;
    getTestById(id).then(r => {
      const test = r.data.data;
      setCurrentTest(test);
      if (test.questions?.length) {
        fetchBulkQuestions(test.questions)
          .then(qr => setQuestions(qr.data.data || []))
          .catch(() => {});
      }
    }).catch(() => toast.error('Failed to load test'));
  }, [id]);

  const handlePublish = async () => {
    if (!id) return;
    if (publishTab === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      toast.error('Please select a schedule date and time');
      return;
    }
    try {
      setPublishing(true);
      const scheduled_date = publishTab === 'scheduled' ? `${scheduleDate}T${scheduleTime}:00` : undefined;
      await publishTest(id, publishTab === 'draft' ? 'live' : 'scheduled', scheduled_date);
      toast.success(publishTab === 'draft' ? 'Test published successfully!' : `Test scheduled for ${scheduleDate} at ${scheduleTime}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      console.log(e);
      toast.error(e.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const testType  = currentTest?.type      ?? 'chapter';
  const diffKey   = currentTest?.difficulty ?? '';
  const diffLabel = DIFF_LABELS[diffKey]    ?? '';
  const totalQ    = currentTest?.total_questions ?? Math.max(questions.length, 1);
  const topicTags    = currentTest?.topics     ?? [];
  const subTopicTags = currentTest?.sub_topics ?? [];

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
              <div className="aq-sidebar__count">Total Questions : {totalQ}</div>
              <div className="aq-sidebar__list">
                {Array.from({ length: totalQ }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`aq-q-item${questions[i] ? ' saved' : ''}`}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <CircleCheck className="aq-q-item__dot" size={12} />
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
          </div>

          <div className="pp-header">
            <span className="pp-header__title">Test created</span>
            <span className="pp-header__badge">
              <CheckCircle size={15} /> All {totalQ} Questions done
            </span>
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
                  {currentTest?.total_time ?? 60} Min</span>
                <span className="divider">|</span>
                <span>
                  <img src={TotalIcon} alt="test_time" className="img-fluid" />
                  {totalQ} Q's</span>
                <span className="divider">|</span>
                <span>
                  <img src={MarksIcon} alt="test_time" className="img-fluid" />
                  {currentTest?.total_marks ?? 250} Marks</span>
              </div>
            </div>

            <div className="aq-info-card__meta">
              <div className="aq-meta-row">
                <span className="aq-meta-label">Subject</span>
                <span className="aq-meta-value">: {currentTest?.subject ?? '—'}</span>
              </div>
              {topicTags.length > 0 && (
                <div className="aq-meta-row">
                  <span className="aq-meta-label">Topic</span>
                  <div className="aq-tags">
                    {topicTags.map((t, i) => (
                      <span key={i} className="aq-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {subTopicTags.length > 0 && (
                <div className="aq-meta-row">
                  <span className="aq-meta-label">Sub Topic</span>
                  <div className="aq-tags">
                    {subTopicTags.map((st, i) => (
                      <span key={i} className="aq-tag">{st}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {viewOnly && (() => {
            const q = questions[currentIndex];
            if (!q) return (
              <div className="aq-editor">
                <div className="aq-editor__header">
                  <span className="aq-q-counter">
                    Question <span className="aq-q-counter__num">{currentIndex + 1}</span>
                    <span className="aq-q-counter__total">/{totalQ}</span>
                  </span>
                </div>
                <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No question data available.</p>
              </div>
            );
            const opts = [
              { key: 'option1', label: q.option1 },
              { key: 'option2', label: q.option2 },
              { key: 'option3', label: q.option3 },
              { key: 'option4', label: q.option4 },
            ];
            return (
              <div className="aq-editor viewOnly">
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
                <form>
                  <div className='aq-toolbar'>
                    <button type="button" title="Italic"><Italic size={13} /></button>
                    <button type="button" title="Bold"><Bold size={13} /></button>
                    <button type="button" title="Underline"><Underline size={13} /></button>
                    <button type="button" title="Strikethrough"><Strikethrough size={13} /></button>
                    <span className="aq-toolbar__sep" />
                    <button type="button" title="Link"><Link2 size={13} /></button>
                    <span className="aq-toolbar__sep" />
                    <button type="button" title="Align left"><AlignLeft size={13} /></button>
                    <button type="button" title="Align center"><AlignCenter size={13} /></button>
                    <button type="button" title="Align right"><AlignRight size={13} /></button>
                    <button type="button" title="Justify"><AlignJustify size={13} /></button>
                    <span className="aq-toolbar__sep" />
                    <button type="button" title="Insert image"><ImageIcon size={13} /></button>
                  </div>

                  <div className="aq-field" style={{ pointerEvents: 'none' }}>
                  <p className="aq-textarea" style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}>{q.question}</p>
                  </div>

                  <p className="aq-options-label">Options</p>
                  <div className="aq-options">
                    {opts.map(opt => (
                      <div key={opt.key} className={`aq-option${q.correct_option === opt.key ? ' correct' : ''}`}>
                        <input
                          type="radio"
                          className="aq-opt-radio"
                          readOnly
                          checked={q.correct_option === opt.key}
                        />
                        <div className="aq-option-input">
                          <span className="aq-opt-input" style={{ display: 'block', padding: '8px 12px' }}>{opt.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="aq-solution">
                      <p className="aq-solution__label">Solution</p>
                      <div className="aq-field aq-solution__field" style={{ pointerEvents: 'none' }}>
                        <p className="aq-textarea" style={{ minHeight: 60, whiteSpace: 'pre-wrap' }}>{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            );
          })()}

          {!viewOnly && (
            <div className="pp-publish-card">
              <div className="type-tabs">
                <button type="button"
                  className={`tab-btn${publishTab === 'draft' ? ' active' : ''}`}
                  onClick={() => setPublishTab('draft')}
                >
                  Publish Now
                </button>
                <button type="button"
                  className={`tab-btn${publishTab === 'scheduled' ? ' active' : ''}`}
                  onClick={() => setPublishTab('scheduled')}
                >
                  Schedule Publish
                </button>
              </div>
              {publishTab === 'scheduled' && (
                <div className="pp-schedule">
                  <h4 className="pp-header__title">Select Date and Time</h4>
                  <div className="pp-custom-duration">
                    <div className="pp-date-input">
                      <input
                        type="date"
                        className="form-input w-100"
                        placeholder="Select Date"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="select-wrapper">
                      <select
                        className="form-input w-100"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                      >
                        <option value="">Select Time</option>
                        {Array.from({ length: 24 }).flatMap((_, h) =>
                          ['00', '30'].map(m => {
                            const val = `${String(h).padStart(2, '0')}:${m}`;
                            return <option key={val} value={val}>{val}</option>;
                          })
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <div className="pp-live-until">
                <h4 className="pp-header__title">Live Until</h4>
                <p className="pp-live-until__desc">
                  Choose how long this test should remain available on the platform.
                </p>

                <div className="pp-duration-grid">
                  {LIVE_OPTIONS.map(opt => (
                    <label key={opt.key} className="pp-radio-item">
                      <input
                        type="radio"
                        name="liveUntil"
                        value={opt.key}
                        checked={liveUntil === opt.key}
                        onChange={() => setLiveUntil(opt.key)}
                        className="aq-opt-radio"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {liveUntil === 'custom' && (
                  <div className="pp-custom-duration">
                    <div className="pp-date-input">
                      <input
                        type="date"
                        className="form-input w-100"
                        placeholder="Select End Date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="select-wrapper">
                      <select
                        className="form-input w-100"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                      >
                        <option value="">Select End Time</option>
                        {Array.from({ length: 24 }).flatMap((_, h) =>
                          ['00', '30'].map(m => {
                            const val = `${String(h).padStart(2, '0')}:${m}`;
                            return <option key={val} value={val}>{val}</option>;
                          })
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="pp-footer">
            {!viewOnly && (
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/test/${id}/questions`)}
              >
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary"
              style={{ padding: '10px 40px' }}
              onClick={viewOnly ? () => navigate('/dashboard') : handlePublish}
              disabled={!viewOnly && publishing}
            >
              {!viewOnly && publishing
                ? <span className="spinner-border spinner-border-sm" />
                : viewOnly ? 'OK' : 'Confirm'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
