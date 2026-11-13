import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000';

const STATUSES = [
    { value: 'Onboarding', label: 'Onboarding' },
    { value: 'Discovery', label: 'Discovery' },
    { value: 'Strategy', label: 'Strategy' },
    { value: 'Development', label: 'Development' },
    { value: 'Launch', label: 'Launch' },
    { value: 'Live', label: 'Live' },
];

const PREVIEW_CLIENTS = [
    {
        id: 1,
        first_name: 'Maya',
        last_name: 'Chen',
        email: 'maya@northline.co',
        Project: {
            name: 'Northline Launch',
            status: 'Discovery',
            progress: 18,
            nextInvoiceDate: '2026-11-12',
            subscriptionAmount: 2400,
        },
    },
    {
        id: 2,
        first_name: 'Julian',
        last_name: 'Ortiz',
        email: 'julian@atelier.io',
        Project: {
            name: 'Atelier Studio',
            status: 'Development',
            progress: 64,
            nextInvoiceDate: '2026-10-30',
            subscriptionAmount: 1800,
        },
    },
    {
        id: 3,
        first_name: 'Priya',
        last_name: 'Shah',
        email: 'priya@lumen.health',
        Project: {
            name: 'Lumen Wellness',
            status: 'Launch',
            progress: 92,
            nextInvoiceDate: '',
            subscriptionAmount: 3200,
        },
    },
];

function projectFrom(client) {
    return {
        name: client.Project?.name || '',
        status: client.Project?.status || 'Onboarding',
        progress: Number(client.Project?.progress ?? 0),
        nextInvoiceDate: normalizeDate(client.Project?.nextInvoiceDate),
        subscriptionAmount: Number(client.Project?.subscriptionAmount ?? 0),
    };
}

function normalizeDate(value) {
    if (!value || value === 'TBD') return '';
    return String(value).slice(0, 10);
}

function statusOptions(current) {
    if (STATUSES.some((item) => item.value === current)) return STATUSES;
    return [{ value: current, label: current }, ...STATUSES];
}

function SaveButton({ dirty, saving, onClick }) {
    return (
        <button
            type="button"
            className={`admin-save${dirty ? ' is-ready' : ''}`}
            onClick={onClick}
            disabled={!dirty || saving}
            aria-busy={saving}
        >
            {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
    );
}

function projectFieldList({ client, draft, layout, dirty, saving, onChange, onSave }) {
    const id = (name) => `${layout}-${name}-${client.id}`;
    const showLabels = layout === 'mobile';
    const who = `${client.first_name} ${client.last_name}`;

    return [
        <div className="admin-field" key="name">
            {showLabels && <label htmlFor={id('name')}>Project name</label>}
            <input
                id={id('name')}
                aria-label={showLabels ? undefined : `Project name for ${who}`}
                value={draft.name}
                onChange={(e) => onChange(client.id, 'name', e.target.value)}
            />
        </div>,
        <div className="admin-field" key="status">
            {showLabels && <label htmlFor={id('status')}>Status</label>}
            <select
                id={id('status')}
                aria-label={showLabels ? undefined : `Status for ${who}`}
                value={draft.status}
                onChange={(e) => onChange(client.id, 'status', e.target.value)}
            >
                {statusOptions(draft.status).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>,
        <div className="admin-field" key="progress">
            {showLabels && <label htmlFor={id('progress')}>Progress</label>}
            <div className="admin-progress">
                <input
                    id={id('progress')}
                    type="range"
                    min="0"
                    max="100"
                    aria-label={showLabels ? undefined : `Progress for ${who}`}
                    value={draft.progress}
                    onChange={(e) => onChange(client.id, 'progress', Number(e.target.value))}
                />
                <output htmlFor={id('progress')}>{draft.progress}%</output>
            </div>
        </div>,
        <div className="admin-field" key="invoice">
            {showLabels && <label htmlFor={id('invoice')}>Next invoice</label>}
            <input
                id={id('invoice')}
                type="date"
                aria-label={showLabels ? undefined : `Next invoice for ${who}`}
                value={draft.nextInvoiceDate}
                onChange={(e) => onChange(client.id, 'nextInvoiceDate', e.target.value)}
            />
        </div>,
        <div className="admin-field" key="amount">
            {showLabels && <label htmlFor={id('amount')}>Retainer</label>}
            <input
                id={id('amount')}
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={showLabels ? undefined : `Retainer for ${who}`}
                value={draft.subscriptionAmount}
                onChange={(e) => onChange(client.id, 'subscriptionAmount', e.target.value)}
            />
        </div>,
        <SaveButton key="save" dirty={dirty} saving={saving} onClick={() => onSave(client)} />,
    ];
}

function draftsFrom(rows) {
    const nextDrafts = {};
    rows.forEach((client) => {
        nextDrafts[client.id] = projectFrom(client);
    });
    return nextDrafts;
}

function AdminDashboard({ forcePreview } = {}) {
    const { logout } = useAuth();
    const [searchParams] = useSearchParams();
    const previewQuery = searchParams.get('preview');
    const previewMode =
        forcePreview ||
        (import.meta.env.DEV && window.location.pathname.startsWith('/admin/preview')
            ? previewQuery || 'data'
            : import.meta.env.DEV
              ? previewQuery
              : null);
    const previewRows = previewMode === 'data' ? PREVIEW_CLIENTS : [];

    const [clients, setClients] = useState(previewRows);
    const [drafts, setDrafts] = useState(() => draftsFrom(previewRows));
    const [savingId, setSavingId] = useState(null);
    const [loading, setLoading] = useState(!previewMode || previewMode === 'loading');
    const [error, setError] = useState(previewMode === 'error' ? 'Could not reach the client directory.' : '');
    const [message, setMessage] = useState('');
    const [tone, setTone] = useState('success');
    const [query, setQuery] = useState('');

    const announce = (text, nextTone = 'success') => {
        setMessage(text);
        setTone(nextTone);
        window.setTimeout(() => setMessage(''), 4000);
    };

    const hydrate = (rows) => {
        setClients(rows);
        setDrafts(draftsFrom(rows));
    };

    const fetchClients = async () => {
        if (previewMode === 'empty') {
            hydrate([]);
            setLoading(false);
            setError('');
            return;
        }
        if (previewMode === 'error') {
            setLoading(false);
            setError('Could not reach the client directory.');
            return;
        }
        if (previewMode === 'loading') {
            setLoading(true);
            setError('');
            return;
        }
        if (previewMode === 'data') {
            hydrate(PREVIEW_CLIENTS);
            setLoading(false);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axiosInstance.get(`${API_URL}/api/admin/clients`);
            hydrate(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.response?.data?.message || 'Could not load clients. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewMode]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return clients;
        return clients.filter((client) => {
            const draft = drafts[client.id] || {};
            return [client.first_name, client.last_name, client.email, draft.name, draft.status]
                .join(' ')
                .toLowerCase()
                .includes(needle);
        });
    }, [clients, drafts, query]);

    const stats = useMemo(() => {
        const live = clients.filter((client) => (drafts[client.id]?.status || '') === 'Live').length;
        const active = clients.length - live;
        return { total: clients.length, active, live };
    }, [clients, drafts]);

    const isDirty = (client) => {
        const original = projectFrom(client);
        const draft = drafts[client.id];
        if (!draft) return false;
        return JSON.stringify(original) !== JSON.stringify({
            ...draft,
            progress: Number(draft.progress),
            subscriptionAmount: Number(draft.subscriptionAmount),
        });
    };

    const updateDraft = (userId, field, value) => {
        setDrafts((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value },
        }));
    };

    const saveProject = async (client) => {
        const draft = drafts[client.id];
        setSavingId(client.id);
        try {
            const payload = {
                ...draft,
                nextInvoiceDate: draft.nextInvoiceDate || 'TBD',
                progress: Math.min(100, Math.max(0, Number(draft.progress) || 0)),
                subscriptionAmount: Number(draft.subscriptionAmount) || 0,
            };

            if (!previewMode) {
                await axiosInstance.put(`${API_URL}/api/admin/project/${client.id}`, payload);
            }

            setClients((prev) =>
                prev.map((row) => (row.id === client.id ? { ...row, Project: { ...row.Project, ...payload } } : row))
            );
            setDrafts((prev) => ({ ...prev, [client.id]: { ...payload, nextInvoiceDate: normalizeDate(payload.nextInvoiceDate) } }));
            announce(`Saved updates for ${client.first_name}`);
        } catch (err) {
            console.error('Save failed:', err);
            announce('Could not save changes. Try again.', 'error');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="admin-page">
            <a className="admin-skip" href="#client-directory">
                Skip to client directory
            </a>

            <div className="admin-shell">
                <header className="admin-header">
                    <div>
                        <p className="admin-kicker">Admin</p>
                        <h1 className="admin-title">
                            Mission <span>Control</span>
                        </h1>
                        <p className="admin-subtitle">Update project status, progress, and billing for every client.</p>
                    </div>
                    <button type="button" className="admin-logout" onClick={logout}>
                        Log Out
                    </button>
                </header>

                <div className="admin-toolbar">
                    <div className="admin-search">
                        <label htmlFor="client-search">Search clients</label>
                        <input
                            id="client-search"
                            type="search"
                            placeholder="Search clients"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-stats" aria-label="Client summary">
                        <div className="admin-stat">
                            <strong>{stats.total}</strong>
                            <span>Clients</span>
                        </div>
                        <div className="admin-stat">
                            <strong>{stats.active}</strong>
                            <span>In flight</span>
                        </div>
                        <div className="admin-stat">
                            <strong>{stats.live}</strong>
                            <span>Live</span>
                        </div>
                    </div>
                </div>

                <div role="status" aria-live="polite">
                    {message && (
                        <div className="admin-banner" data-tone={tone}>
                            {message}
                        </div>
                    )}
                </div>

                <section id="client-directory" className="admin-card" aria-labelledby="directory-heading">
                    <h2 id="directory-heading" className="admin-sr-only">
                        Client directory
                    </h2>

                    {loading && (
                        <div className="admin-skeleton" aria-busy="true" aria-label="Loading clients">
                            <span />
                            <span />
                            <span />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="admin-state">
                            <h2>Couldn’t load clients</h2>
                            <p>{error}</p>
                            <button type="button" className="admin-retry" onClick={fetchClients}>
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="admin-state">
                            <h2>{clients.length === 0 ? 'No clients yet' : 'No matching clients'}</h2>
                            <p>
                                {clients.length === 0
                                    ? 'When a member account is created, it will appear here with project controls.'
                                    : 'Try a different name, email, or project status.'}
                            </p>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <caption>Editable client projects</caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">Client</th>
                                            <th scope="col">Project</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Progress</th>
                                            <th scope="col">Invoice</th>
                                            <th scope="col">Retainer</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((client) => {
                                            const draft = drafts[client.id] || projectFrom(client);
                                            const fields = projectFieldList({
                                                client,
                                                draft,
                                                layout: 'desktop',
                                                dirty: isDirty(client),
                                                saving: savingId === client.id,
                                                onChange: updateDraft,
                                                onSave: saveProject,
                                            });

                                            return (
                                                <tr key={client.id} className={isDirty(client) ? 'is-dirty' : undefined}>
                                                    <td>
                                                        <div className="admin-client">
                                                            <strong>
                                                                {client.first_name} {client.last_name}
                                                            </strong>
                                                            <span>{client.email}</span>
                                                        </div>
                                                    </td>
                                                    {fields.map((field) => (
                                                        <td key={`${client.id}-${field.key}`}>{field}</td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="admin-cards">
                                {filtered.map((client) => {
                                    const draft = drafts[client.id] || projectFrom(client);
                                    return (
                                        <article
                                            key={`card-${client.id}`}
                                            className={`admin-mobile-card${isDirty(client) ? ' is-dirty' : ''}`}
                                        >
                                            <div className="admin-client">
                                                <strong>
                                                    {client.first_name} {client.last_name}
                                                </strong>
                                                <span>{client.email}</span>
                                            </div>
                                            {projectFieldList({
                                                client,
                                                draft,
                                                layout: 'mobile',
                                                dirty: isDirty(client),
                                                saving: savingId === client.id,
                                                onChange: updateDraft,
                                                onSave: saveProject,
                                            })}
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
