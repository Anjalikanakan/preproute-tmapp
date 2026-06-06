import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllTests, deleteTest } from '../api/endpoints';
import { useTestContext } from '../context/TestContext';
import type { Test } from '../types';
import { Plus, Pencil, Trash2, Eye, Search, BookOpen, CheckCircle, FileText } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setCurrentTest, clearTestContext } = useTestContext();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await getAllTests();
      setTests(res.data.data || []);
    } catch {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleCreateNew = () => {
    clearTestContext();
    navigate('/test/create');
  };

  const handleEdit = (test: Test) => {
    setCurrentTest(test);
    navigate(`/test/${test.id}/edit`);
  };

  const handleView = (test: Test) => {
    setCurrentTest(test);
    navigate(`/test/${test.id}/preview`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      setDeletingId(id);
      await deleteTest(id);
      toast.success('Test deleted');
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = tests.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter || (statusFilter === 'draft' && !t.status);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: tests.length,
    live: tests.filter((t) => t.status === 'live').length,
    draft: tests.filter((t) => t.status === 'draft' || !t.status).length,
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'live') return <span className="badge badge-live">Live</span>;
    return <span className="badge badge-draft">Draft</span>;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage and monitor all your tests</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          <Plus size={18} />
          Create New Test
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-total"><BookOpen size={20} /></div>
          <div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-live"><CheckCircle size={20} /></div>
          <div>
            <div className="stat-number">{stats.live}</div>
            <div className="stat-label">Live Tests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-draft"><FileText size={20} /></div>
          <div>
            <div className="stat-number">{stats.draft}</div>
            <div className="stat-label">Drafts</div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search tests..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['all', 'live', 'draft'].map((s) => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner large" />
          <p>Loading tests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>{search ? 'No tests found' : 'No tests yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Create your first test to get started'}</p>
          {!search && (
            <button className="btn-primary" onClick={handleCreateNew}>
              <Plus size={16} /> Create Test
            </button>
          )}
        </div>
      ) : (
        <div className="tests-table-wrapper">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Subject</th>
                <th>Topics</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div className="test-name-cell">
                      <span className="test-name">{test.name}</span>
                      {test.total_questions && <span className="test-meta">{test.total_questions} questions</span>}
                    </div>
                  </td>
                  <td><span className="subject-chip">{test.subject}</span></td>
                  <td>
                    <div className="topics-list">
                      {(test.topics || []).slice(0, 2).map((t, i) => (
                        <span key={i} className="topic-chip">{t}</span>
                      ))}
                      {(test.topics || []).length > 2 && (
                        <span className="topic-chip more">+{test.topics.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(test.status)}</td>
                  <td className="date-cell">{formatDate(test.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleView(test)} title="Preview">
                        <Eye size={15} />
                      </button>
                      <button className="action-btn edit" onClick={() => handleEdit(test)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(test.id)}
                        disabled={deletingId === test.id}
                        title="Delete"
                      >
                        {deletingId === test.id ? <span className="spinner small" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
