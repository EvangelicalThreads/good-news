'use client';

import { useEffect, useState } from 'react';

type GoodNewsCardType = {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  date: string;
};

type GoodNewsCardProps = {
  card: GoodNewsCardType;
  isModal?: boolean;
  minimized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
};

function GoodNewsCard({
  card,
  isModal = false,
  minimized = false,
  onClose,
  onMinimize,
}: GoodNewsCardProps) {
  const cardStyle = {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    textAlign: 'center' as const,
    backgroundColor: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    fontFamily: "'Inter', sans-serif",
    color: '#111',
    transition: 'all 0.3s ease',
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  };

  if (isModal) {
    return (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: 12, fontSize: 22 }}>{card.title}</h2>
          {card.image_url && (
            <img
              src={card.image_url}
              alt={card.title}
              style={{ width: '100%', borderRadius: 12, marginBottom: 12 }}
            />
          )}
          <p style={{ fontSize: 16, lineHeight: 1.5 }}>{card.content}</p>
          <button
            onClick={onClose}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#111',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              marginRight: 8,
            }}
          >
            Close
          </button>
          <button
            onClick={onMinimize}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#888',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Minimize
          </button>
        </div>
      </div>
    );
  }

  // Floating pinned card
  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 999,
          padding: '12px 24px',
          borderRadius: 24,
          backgroundColor: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          transition: 'all 0.3s ease',
        }}
        onClick={onMinimize} // restore full card
      >
        Good News
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        right: 40,
        zIndex: 999,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: 300,
      }}
      onClick={onMinimize} // minimizes card
    >
      <div style={cardStyle}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>{card.title}</h3>
        {card.image_url && (
          <img
            src={card.image_url}
            alt={card.title}
            style={{ width: '100%', borderRadius: 12, marginBottom: 8 }}
          />
        )}
        <p style={{ fontSize: 14, lineHeight: 1.4 }}>{card.content}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize?.();
          }}
          style={{
            marginTop: 12,
            padding: '6px 12px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#888',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Minimize
        </button>
      </div>
    </div>
  );
}

// Wrapper component
export default function GoodNewsWrapper() {
  const [currentCard, setCurrentCard] = useState<GoodNewsCardType | null>(null);
  const [showGoodNewsModal, setShowGoodNewsModal] = useState(false);
  const [minimized, setMinimized] = useState(() => {
    // initialize from localStorage so minimized persists
    return localStorage.getItem('goodNewsMinimized') === 'true';
  });

  useEffect(() => {
    async function fetchGoodNews() {
      try {
        const res = await fetch('/api/good-news');
        if (!res.ok) throw new Error('No Good News today');
        const data: GoodNewsCardType = await res.json();
        setCurrentCard(data);

        const todayStr = new Date().toISOString().split('T')[0];
        const lastSeen = localStorage.getItem('goodNewsLastSeen');
        if (lastSeen !== todayStr && !minimized) {
          setShowGoodNewsModal(true);
          localStorage.setItem('goodNewsLastSeen', todayStr);
        }
      } catch (err) {
        console.log('Failed to fetch Good News:', err);
      }
    }

    fetchGoodNews();
  }, [minimized]);

  // update localStorage whenever minimized changes
  useEffect(() => {
    localStorage.setItem('goodNewsMinimized', minimized ? 'true' : 'false');
  }, [minimized]);

  if (!currentCard) return null;

  return (
    <>
      {showGoodNewsModal && !minimized && (
        <GoodNewsCard
          isModal
          card={currentCard}
          onClose={() => setShowGoodNewsModal(false)}
          onMinimize={() => {
            setShowGoodNewsModal(false);
            setMinimized(true);
          }}
        />
      )}

      <GoodNewsCard
        card={currentCard}
        minimized={minimized}
        onMinimize={() => setMinimized(!minimized)}
        onClose={() => setShowGoodNewsModal(true)}
      />
    </>
  );
}
