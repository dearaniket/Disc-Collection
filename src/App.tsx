import { useCallback, useMemo, useState } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Feed } from './components/Feed';
import { Stacks } from './components/Stacks';
import { Wishlist } from './components/Wishlist';
import { CaptureSheet, type Prefill } from './components/CaptureSheet';
import { EditSheet } from './components/EditSheet';
import { IconCapture, IconHeart, IconShelf, IconStacks } from './components/Icons';
import type { CaseItem, Kind } from './lib/types';

type Tab = 'shelf' | 'stacks' | 'wishlist';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { ready, cases, wishes, hasDemo, clearDemo } = useStore();
  const [tab, setTab] = useState<Tab>('shelf');
  const [kind, setKind] = useState<Kind>('game');
  const [focus, setFocus] = useState<{ id: string; n: number }>();
  const [editing, setEditing] = useState<string>();
  const [capture, setCapture] = useState<{ open: boolean; prefill?: Prefill }>({ open: false });
  const [lamp, setLamp] = useState('#2a2f39');
  const [confirmClear, setConfirmClear] = useState(false);

  const byKind = useMemo(
    () => ({
      game: cases.filter((c) => c.kind === 'game').sort((a, b) => b.no - a.no),
      movie: cases.filter((c) => c.kind === 'movie').sort((a, b) => b.no - a.no),
    }),
    [cases],
  );

  const openCase = useCallback((c: CaseItem) => {
    setKind(c.kind);
    setTab('shelf');
    setFocus({ id: c.id, n: Date.now() });
  }, []);

  const onActive = useCallback((c?: CaseItem) => setLamp(c?.tint ?? '#2a2f39'), []);
  const editingItem = cases.find((c) => c.id === editing);

  if (!ready) {
    return (
      <div className="boot" role="status">
        <span>Setting up your shelf…</span>
      </div>
    );
  }

  return (
    <div className="app" style={{ ['--lamp' as string]: lamp }}>
      <div className="lamp" aria-hidden="true" />

      <main className="view">
        {tab === 'shelf' && (
          <>
            <Feed
              key={kind}
              items={byKind[kind]}
              focusId={focus?.id}
              onEdit={(c) => setEditing(c.id)}
              onActive={onActive}
              empty={
                <div className="empty">
                  <h2>No {kind === 'game' ? 'games' : 'movies'} yet</h2>
                  <p>Photograph the front of a case and it lands here, ready to turn over and open.</p>
                  <button className="btn btn--primary" onClick={() => setCapture({ open: true, prefill: undefined })}>
                    Add a {kind === 'game' ? 'game' : 'movie'}
                  </button>
                </div>
              }
            />
            <header className="topbar">
              <div className="kinds" role="tablist" aria-label="Collection">
                {(['game', 'movie'] as const).map((k) => (
                  <button key={k} role="tab" aria-selected={kind === k} className="kinds__btn" onClick={() => setKind(k)}>
                    {k === 'game' ? 'Games' : 'Movies'} <span className="num">{byKind[k].length}</span>
                  </button>
                ))}
              </div>
              {hasDemo &&
                (confirmClear ? (
                  <div className="demo-pill demo-pill--confirm">
                    <span>Remove {cases.filter((c) => c.demo).length} sample cases?</span>
                    <button
                      onClick={async () => {
                        await clearDemo();
                        setConfirmClear(false);
                      }}
                    >
                      Remove
                    </button>
                    <button onClick={() => setConfirmClear(false)}>Keep</button>
                  </div>
                ) : (
                  <button className="demo-pill" onClick={() => setConfirmClear(true)}>
                    Sample shelf · Clear
                  </button>
                ))}
            </header>
          </>
        )}
        {tab === 'stacks' && <Stacks cases={cases} onOpen={openCase} />}
        {tab === 'wishlist' && <Wishlist onOwn={(w) => setCapture({ open: true, prefill: { title: w.title, kind: w.kind, format: w.format, wishId: w.id } })} />}
      </main>

      <nav className="tabbar" aria-label="Main">
        <TabButton on={tab === 'shelf'} onClick={() => setTab('shelf')} icon={<IconShelf />} label="Shelf" />
        <TabButton on={tab === 'stacks'} onClick={() => setTab('stacks')} icon={<IconStacks />} label="Stacks" />
        <button className="tabbar__capture" onClick={() => setCapture({ open: true, prefill: undefined })} aria-label="Capture a case">
          <IconCapture size={26} />
        </button>
        <TabButton
          on={tab === 'wishlist'}
          onClick={() => setTab('wishlist')}
          icon={<IconHeart />}
          label="Wishlist"
          badge={wishes.length || undefined}
        />
      </nav>

      <CaptureSheet
        open={capture.open}
        prefill={capture.prefill}
        onOpenChange={(o) => setCapture((c) => ({ ...c, open: o }))}
        onSaved={(c) => openCase(c)}
      />
      <EditSheet item={editingItem} onClose={() => setEditing(undefined)} />
    </div>
  );
}

function TabButton({ on, onClick, icon, label, badge }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button className="tabbar__btn" aria-current={on ? 'page' : undefined} onClick={onClick}>
      <span className="tabbar__icon">
        {icon}
        {badge != null && <i className="tabbar__badge num">{badge}</i>}
      </span>
      <span>{label}</span>
    </button>
  );
}
