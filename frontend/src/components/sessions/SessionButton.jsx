function SessionButton({ session, onSelect }) {
  function handleClick() {
    onSelect(session.id);
  }

  return (
    <button
      className="session-button"
      type="button"
      onClick={handleClick}
    >
      <span className="session-time">{session.time}</span>

      <span className="session-information">
        {session.hallName}
      </span>

      <span className="session-price">
        {session.price} TL
      </span>
    </button>
  );
}

export default SessionButton;