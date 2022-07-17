export const playAudio = (audio) => {
  try {
    audio.play();
  } catch (error) {
    console.error(error);
  }
};
