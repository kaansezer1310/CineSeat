import SessionButton from "./SessionButton.jsx";

function SessionList({ sessions, onSessionSelect }) {
  if (sessions.length === 0) {
    return (
      <div className="temporary-panel">
        Bu filme ait aktif seans bulunmuyor.
      </div>
    );
  }

  return (
    <div className="session-section">
      <div className="session-section-heading">
        <h2>Seans Seç</h2>

        <p>
          Koltuk planını görmek için bir saat seç.
        </p>
      </div>

      <div className="session-grid">
        {sessions.map((session) => {
          return (
            <SessionButton
              key={session.id}
              session={session}
              onSelect={onSessionSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

export default SessionList;