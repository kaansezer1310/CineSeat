import { useState } from "react";

import SessionButton from "./SessionButton.jsx";

function getUniqueDates(sessions) {
  const seen = new Set();
  const dates = [];

  sessions.forEach((session) => {
    if (!seen.has(session.date)) {
      seen.add(session.date);
      dates.push(session.date);
    }
  });

  return dates;
}

function SessionList({ sessions, onSessionSelect }) {
  const uniqueDates = getUniqueDates(sessions);
  const [selectedDate, setSelectedDate] = useState(
    uniqueDates[0] ?? null
  );

  if (sessions.length === 0) {
    return (
      <div className="temporary-panel">
        Bu filme ait aktif seans bulunmuyor.
      </div>
    );
  }

  // `selectedDate` yalnızca ilk render'da uniqueDates[0]'a eşitleniyor;
  // veri değişip o tarih artık listede yoksa (ör. seanslar yenilendi) ilk
  // geçerli tarihe geri düşülür — ayrı bir useEffect gerekmez.
  const activeDate = uniqueDates.includes(selectedDate)
    ? selectedDate
    : uniqueDates[0];

  const sessionsForActiveDate = sessions.filter(
    (session) => session.date === activeDate
  );

  return (
    <div className="session-section">
      <div className="session-section-heading">
        <h2>Seans Seç</h2>

        <p>
          Önce bir tarih, ardından koltuk planını görmek için bir saat seç.
        </p>
      </div>

      <div
        className="session-date-picker"
        role="tablist"
        aria-label="Seans tarihi"
      >
        {uniqueDates.map((date) => {
          const isActive = date === activeDate;

          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? "chip chip--active" : "chip"}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          );
        })}
      </div>

      <div className="session-grid">
        {sessionsForActiveDate.map((session) => {
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
