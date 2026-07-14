import sessions from "../data/sessions.js";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getSessionsByMovieId(movieId) {
  await wait(500);

  return sessions.filter((session) => {
    return session.movieId === movieId;
  });
}

async function getSessionById(sessionId) {
  await wait(400);

  const session = sessions.find((sessionItem) => {
    return sessionItem.id === sessionId;
  });

  if (!session) {
    throw new Error("Seans bulunamadı.");
  }

  return session;
}

const sessionService = {
  getSessionsByMovieId,
  getSessionById,
};

export default sessionService;