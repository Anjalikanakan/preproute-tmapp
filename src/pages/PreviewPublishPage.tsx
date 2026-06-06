import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  publishTest, getTestById, fetchBulkQuestions,
} from '../api/endpoints';
import { useTestContext } from '../context/TestContext';
import {
  CheckCircle, Pencil,
  ChevronsLeft, ChevronsRight, CircleCheck, 
} from 'lucide-react';
import SubjectIcon from '../assets/images/ar_stickers.svg';
import TimerIcon from '../assets/images/timer.svg';
import MarksIcon from '../assets/images/leaderboard.svg';
import TotalIcon from '../assets/images/quiz.svg';
import DifficultyIcon from '../assets/images/cognition.svg';
import { BreadCrumb } from '../components/BreadCrumb';

const TABS = [
  { key: 'chapter', label: 'Chapter Wise' },
  { key: 'practice', label: 'PYQ' },
  { key: 'mock', label: 'Mock Test' },
];

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard',
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
  const { currentTest, setCurrentTest, questions, setQuestions } = useTestContext();

  const [publishing,      setPublishing]      = useState(false);
  const [sidebarCollapsed,setSidebarCollapsed] = useState(false);
  const [publishTab,      setPublishTab]      = useState<'now' | 'schedule'>('now');
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
    try {
      setPublishing(true);
      await publishTest(id);
      toast.success('Test published successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
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

          <div className="pp-publish-card">
            <div className="type-tabs">
              <button type="button"
                className={`tab-btn${publishTab === 'now' ? ' active' : ''}`}
                onClick={() => setPublishTab('now')}
              >
                Publish Now
              </button>
              <button type="button"
                className={`tab-btn${publishTab === 'schedule' ? ' active' : ''}`}
                onClick={() => setPublishTab('schedule')}
              >
                Schedule Publish
              </button>
            </div>
            {publishTab === 'schedule' && (
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
          <div className="pp-footer">
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/test/${id}/questions`)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 40px' }}
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing
                ? <span className="spinner-border spinner-border-sm" />
                : 'Confirm'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
