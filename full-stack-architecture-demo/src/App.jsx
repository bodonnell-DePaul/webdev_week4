import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { getApiErrorMessage } from './api/client';
import {
  createDecision,
  createFeature,
  getProjects,
  getSummary,
  updateFeatureStatus as saveFeatureStatus,
} from './api/projectsApi';

const initialState = {
  projects: [],
  selectedProjectId: null,
  summary: null,
  loading: true,
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SUCCESS': {
      const selectedProjectId = state.selectedProjectId || action.projects[0]?.id || null;
      return {
        ...state,
        projects: action.projects,
        summary: action.summary,
        selectedProjectId,
        loading: false,
        error: '',
      };
    }
    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.projectId };
    case 'SET_ERROR':
      return { ...state, error: action.message, loading: false };
    default:
      return state;
  }
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function loadData() {
    try {
      const [projects, summary] = await Promise.all([
        getProjects(),
        getSummary(),
      ]);
      dispatch({ type: 'LOAD_SUCCESS', projects, summary });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', message: getApiErrorMessage(error, 'Unable to load projects') });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedProject = useMemo(
    () => state.projects.find((project) => project.id === state.selectedProjectId),
    [state.projects, state.selectedProjectId]
  );

  async function addFeature(feature) {
    if (!selectedProject) return;
    await createFeature(selectedProject.id, feature);
    await loadData();
  }

  async function updateFeatureStatus(featureId, status) {
    await saveFeatureStatus(featureId, status);
    await loadData();
  }

  async function addDecision(decision) {
    if (!selectedProject) return;
    await createDecision(selectedProject.id, decision);
    await loadData();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">CSC 436 Week 4</p>
          <h1>Project Architecture Board</h1>
        </div>
        <button className="ghost-button" onClick={loadData}>Refresh</button>
      </header>

      {state.error && <p className="notice error">{state.error}</p>}
      {state.loading && <p className="notice">Loading architecture data...</p>}

      <Summary summary={state.summary} />

      <section className="workspace">
        <ProjectList
          projects={state.projects}
          selectedProjectId={state.selectedProjectId}
          onSelect={(projectId) => dispatch({ type: 'SELECT_PROJECT', projectId })}
        />

        {selectedProject && (
          <section className="project-panel">
            <ProjectOverview project={selectedProject} />
            <FeatureBoard
              features={selectedProject.features}
              onStatusChange={updateFeatureStatus}
            />
            <FeatureForm onSubmit={addFeature} />
            <DecisionLog decisions={selectedProject.decisions} onSubmit={addDecision} />
          </section>
        )}
      </section>
    </main>
  );
}

function Summary({ summary }) {
  if (!summary) return null;

  return (
    <section className="summary-grid" aria-label="Architecture summary">
      <Metric label="Projects" value={summary.projectCount} />
      <Metric label="Features" value={summary.featureCount} />
      <Metric label="Decisions" value={summary.decisionCount} />
      <Metric label="Cached" value={summary.cached ? 'Yes' : 'No'} />
      <div className="summary-card wide">
        <h2>Feature Layers</h2>
        <LayerBars values={summary.byLayer} />
      </div>
      <div className="summary-card wide">
        <h2>Feature Status</h2>
        <LayerBars values={summary.byStatus} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LayerBars({ values }) {
  const max = Math.max(1, ...Object.values(values));
  return Object.entries(values).map(([label, value]) => (
    <div className="bar-row" key={label}>
      <span>{label}</span>
      <div className="bar-track"><div style={{ width: `${(value / max) * 100}%` }} /></div>
      <strong>{value}</strong>
    </div>
  ));
}

function ProjectList({ projects, selectedProjectId, onSelect }) {
  return (
    <aside className="project-list">
      <h2>Projects</h2>
      {projects.map((project) => (
        <button
          key={project.id}
          className={project.id === selectedProjectId ? 'selected project-button' : 'project-button'}
          onClick={() => onSelect(project.id)}
        >
          <span>{project.name}</span>
          <small>{project.status}</small>
        </button>
      ))}
    </aside>
  );
}

function ProjectOverview({ project }) {
  return (
    <section className="panel-section">
      <p className="eyebrow">Selected Project</p>
      <h2>{project.name}</h2>
      <p>{project.problem}</p>
      <p className="audience">Audience: {project.audience}</p>
    </section>
  );
}

function FeatureBoard({ features, onStatusChange }) {
  return (
    <section className="panel-section">
      <h2>Features by Architecture Layer</h2>
      <div className="feature-grid">
        {['UI', 'API', 'DATA'].map((layer) => (
          <div className="feature-column" key={layer}>
            <h3>{layer}</h3>
            {features.filter((feature) => feature.layer === layer).map((feature) => (
              <article className="feature-card" key={feature.id}>
                <div className="card-header">
                  <h4>{feature.title}</h4>
                  <span>{feature.priority}</span>
                </div>
                <p>{feature.description}</p>
                <select
                  value={feature.status}
                  onChange={(event) => onStatusChange(feature.id, event.target.value)}
                >
                  <option value="IDEA">Idea</option>
                  <option value="READY">Ready</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="DONE">Done</option>
                </select>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureForm({ onSubmit }) {
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    layer: 'UI',
    priority: 'MEDIUM',
  });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSubmit(draft);
      setDraft({ title: '', description: '', layer: 'UI', priority: 'MEDIUM' });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <section className="panel-section two-column">
      <div>
        <h2>Add Feature</h2>
        <p>Form fields are temporary UI state until the API accepts the request.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Feature title"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <textarea
          placeholder="Why this feature matters"
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
        <div className="form-row">
          <select value={draft.layer} onChange={(event) => setDraft({ ...draft, layer: event.target.value })}>
            <option value="UI">UI</option>
            <option value="API">API</option>
            <option value="DATA">Data</option>
          </select>
          <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        {error && <p className="inline-error">{error}</p>}
        <button type="submit">Save Feature</button>
      </form>
    </section>
  );
}

function DecisionLog({ decisions, onSubmit }) {
  const [draft, setDraft] = useState({ title: '', context: '', choice: '', consequence: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSubmit(draft);
      setDraft({ title: '', context: '', choice: '', consequence: '' });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <section className="panel-section decision-layout">
      <div>
        <h2>Decision Log</h2>
        {decisions.map((decision) => (
          <article className="decision" key={decision.id}>
            <h3>{decision.title}</h3>
            <p><strong>Choice:</strong> {decision.choice}</p>
            <p><strong>Consequence:</strong> {decision.consequence}</p>
          </article>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Decision title"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <textarea
          placeholder="Context"
          value={draft.context}
          onChange={(event) => setDraft({ ...draft, context: event.target.value })}
        />
        <textarea
          placeholder="Choice"
          value={draft.choice}
          onChange={(event) => setDraft({ ...draft, choice: event.target.value })}
        />
        <textarea
          placeholder="Consequence"
          value={draft.consequence}
          onChange={(event) => setDraft({ ...draft, consequence: event.target.value })}
        />
        {error && <p className="inline-error">{error}</p>}
        <button type="submit">Record Decision</button>
      </form>
    </section>
  );
}