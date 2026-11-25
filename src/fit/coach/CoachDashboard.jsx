// Coach dashboard: all clients, each client's page, and the form-check inbox.
// Coach = user with role 'admin' (the backend enforces this too).
// The view lives in the URL (?tab=inbox, ?client=12, ?client=12&clip=40) so the back button works.
// Links are relative so they work under /fit (web) and / (app).
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { T, FONT, MARKER, Paper, MarkerTitle } from '../theme';
import FormCheckInbox, { ClipDetail } from '../movement/CoachReview';
import { ClientList, ClientDetail } from './Clients';

export default function CoachDashboard() {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const tab = params.get('tab') === 'inbox' ? 'inbox' : 'clients';
    const clientId = params.get('client');
    const clipId = params.get('clip');
    const [newClips, setNewClips] = useState(0);

    const go = (next) => {
        const p = {};
        Object.entries(next).forEach(([k, v]) => { if (v != null && v !== '') p[k] = String(v); });
        setParams(p);
        window.scrollTo({ top: 0 });
    };

    const countNew = useCallback(async () => {
        try { setNewClips(((await axiosInstance.get('/api/movement/coach/clips', { params: { status: 'new' } })).data.clips || []).length); }
        catch (e) { console.error(e); }
    }, []);
    useEffect(() => {
        let cancelled = false;
        axiosInstance.get('/api/movement/coach/clips', { params: { status: 'new' } })
            .then(r => { if (!cancelled) setNewClips((r.data.clips || []).length); })
            .catch(e => console.error(e));
        return () => { cancelled = true; };
    }, []);

    if (user && user.role !== 'admin') {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#28221b', color: '#efe6d2', fontFamily: FONT, fontSize: '1.1rem', textAlign: 'center', padding: 20 }}>
                <div>This page is for coaches only. <Link to="../dashboard" style={{ color: T.highYellow }}>Back to your journal</Link></div>
            </div>
        );
    }

    const tabBtn = (v, label, badge) => (
        <button type="button" onClick={() => go({ tab: v === 'inbox' ? 'inbox' : null })} aria-pressed={tab === v}
            style={{ fontFamily: MARKER, fontSize: '0.9rem', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: tab === v ? T.highYellow : '#fffdf6', color: T.ink, display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            {label}
            {badge > 0 && <span style={{ fontFamily: FONT, fontSize: '0.75rem', background: T.margin, color: '#fff', borderRadius: 50, padding: '0 7px' }}>{badge}</span>}
        </button>
    );

    let body;
    if (tab === 'inbox') {
        body = <FormCheckInbox onOpenClient={(id) => go({ client: id })} onChanged={countNew} />;
    } else if (clientId && clipId) {
        body = (
            <div>
                <button type="button" onClick={() => go({ client: clientId })} style={{ fontFamily: FONT, background: 'none', border: 'none', color: '#f3ead6', cursor: 'pointer', fontSize: '0.95rem', padding: '0 0 10px' }}>&larr; back to client</button>
                <Paper margin style={{ padding: '22px 24px 26px 58px' }}>
                    <ClipDetail clipId={clipId} onChanged={countNew} />
                </Paper>
            </div>
        );
    } else if (clientId) {
        body = <ClientDetail key={clientId} clientId={clientId} onBack={() => go({})} onOpenClip={(id) => go({ client: clientId, clip: id })} />;
    } else {
        body = <ClientList onOpen={(id) => go({ client: id })} />;
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, padding: '20px 12px 60px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                <Paper lined={false} style={{ padding: '16px 22px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <MarkerTitle style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)' }}>Coach Dashboard</MarkerTitle>
                            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, background: T.highPink, opacity: 0.75, zIndex: -1 }} />
                        </div>
                        <Link to="../dashboard" style={{ fontFamily: FONT, color: T.blue, fontSize: '0.95rem' }}>&larr; my journal</Link>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {tabBtn('clients', 'Clients')}
                        {tabBtn('inbox', 'Form checks', newClips)}
                    </div>
                </Paper>
                {body}
            </div>
        </div>
    );
}
