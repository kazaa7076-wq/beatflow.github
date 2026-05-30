const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const songTitle = document.getElementById("song-title");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const volume = document.getElementById("volume");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const songItems = document.querySelectorAll("#song-list li");
const playerElement = document.querySelector(".player"); // For adding playing class

// Sample songs data - Replace with your actual song files and covers
const songs = [
  {
    title: "Still D.R.E.",
    artist: "Dr. Dre ft. Snoop Dogg",
    src: "music/song1.mp3",
    cover: "covers/cover1.jpg",
  },
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    src: "music/song2.mp3",
    cover: "covers/cover2.jpg",
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    src: "music/song3.mp3",
    cover: "covers/cover3.jpg",
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    src: "music/song4.mp3",
    cover: "covers/cover4.jpg",
  }
];

let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let audioDuration = 0; // To store audio duration

// Local Storage Keys
const CURRENT_SONG_INDEX_KEY = "musicPlayerCurrentSongIndex";
const SHUFFLE_STATE_KEY = "musicPlayerShuffleState";
const REPEAT_STATE_KEY = "musicPlayerRepeatState";
const VOLUME_KEY = "musicPlayerVolume";

// --- Initialization and Local Storage ---

function initializePlayer() {
  const savedIndex = localStorage.getItem(CURRENT_SONG_INDEX_KEY);
  const savedShuffle = localStorage.getItem(SHUFFLE_STATE_KEY);
  const savedRepeat = localStorage.getItem(REPEAT_STATE_KEY);
  const savedVolume = localStorage.getItem(VOLUME_KEY);

  // Set initial values from local storage or defaults
  currentIndex = savedIndex ? parseInt(savedIndex) : 0;
  isShuffle = savedShuffle ? JSON.parse(savedShuffle) : false;
  isRepeat = savedRepeat ? JSON.parse(savedRepeat) : false;
  const vol = savedVolume ? parseFloat(savedVolume) : 0.8;

  volume.value = vol * 100;
  audio.volume = vol;

  // Update button states based on saved settings
  if (isShuffle) shuffleBtn.classList.add("active-mode");
  if (isRepeat) repeatBtn.classList.add("active-mode");

  // Load the song based on the saved index
  loadSong(currentIndex);
}

function savePlayerState() {
  localStorage.setItem(CURRENT_SONG_INDEX_KEY, currentIndex);
  localStorage.setItem(SHUFFLE_STATE_KEY, isShuffle);
  localStorage.setItem(REPEAT_STATE_KEY, isRepeat);
  localStorage.setItem(VOLUME_KEY, audio.volume);
}

// --- Time Formatting ---

function formatTime(seconds) {
  // Handles cases where seconds might be NaN or Infinity (e.g., before metadata loads)
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// --- UI Updates ---

function updateActiveSong() {
  songItems.forEach(item => item.classList.remove("active"));
  // Ensure the index is valid before trying to add the class
  if (songItems[currentIndex]) {
    songItems[currentIndex].classList.add("active");
  }
}

function loadSong(index) {
  // Basic validation for the index
  if (index < 0 || index >= songs.length) {
    console.error("Invalid song index:", index);
    return;
  }
  const song = songs[index];
  audio.src = song.src;
  cover.src = song.cover;
  songTitle.textContent = song.title;
  artist.textContent = song.artist;
  updateActiveSong();

  // Reset progress bar and time when loading a new song
  progress.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00"; // Reset duration as well
}

function togglePlayPauseIcon(isPlaying) {
  playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  playerElement.classList.toggle("playing", isPlaying); // Add/remove class for cover animation
}

// --- Core Player Logic ---

function playSong() {
  if (!audio.src) return; // Don't play if no source is set
  // Attempt to play and catch potential errors (e.g., user gesture required)
  audio.play().catch(error => {
    console.warn("Playback failed:", error);
    // You might want to display a message to the user here
  });
}

function pauseSong() {
  audio.pause();
}

function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function getRandomIndex() {
  if (songs.length === 0) return -1; // Handle empty playlist
  if (songs.length === 1) return 0; // Only one song, return index 0

  let randomIndex = Math.floor(Math.random() * songs.length);
  // Ensure the random index is different from the current one, if possible
  while (randomIndex === currentIndex) {
    randomIndex = Math.floor(Math.random() * songs.length);
  }
  return randomIndex;
}

function playNextSong() {
  if (songs.length === 0) return; // Do nothing if playlist is empty

  currentIndex = isShuffle ? getRandomIndex() : (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  playSong();
  savePlayerState(); // Save state after changing song
}

function playPrevSong() {
  if (songs.length === 0) return; // Do nothing if playlist is empty

  // Calculate previous index, handling wrap-around and shuffle
  currentIndex = isShuffle ? getRandomIndex() : (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
  savePlayerState(); // Save state after changing song
}

// --- Event Listeners ---

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", playNextSong);
prevBtn.addEventListener("click", playPrevSong);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active-mode", isShuffle);
  savePlayerState(); // Save shuffle state
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active-mode", isRepeat);
  savePlayerState(); // Save repeat state
});

songItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    if (index !== currentIndex) {
      currentIndex = index;
      loadSong(currentIndex);
      playSong();
      savePlayerState(); // Save state when a new song is selected
    } else {
      // If clicking the currently active song, toggle play/pause
      togglePlay();
    }
  });
});

// Event fired when the browser has finished loading the media data
audio.addEventListener("loadedmetadata", () => {
  audioDuration = audio.duration; // Store the duration
  durationEl.textContent = formatTime(audioDuration);
});

// Event fired when the playback position is updated
audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  currentTimeEl.textContent = formatTime(currentTime);
  // Update progress bar only if duration is available and valid
  if (!isNaN(audioDuration) && audioDuration > 0) {
    progress.style.width = `${(currentTime / audioDuration) * 100}%`;
  }
});

// Event fired when the user clicks on the progress container
progressContainer.addEventListener("click", (e) => {
  // Prevent seeking if audio source is not ready or duration is invalid
  if (!audio.src || isNaN(audioDuration) || audioDuration === 0) return;

  const width = progressContainer.clientWidth; // Get the width of the progress bar container
  const clickX = e.offsetX; // Get the horizontal coordinate of the click within the container
  // Calculate the new current time based on click position
  audio.currentTime = (clickX / width) * audioDuration;
});

// Event fired when the current song ends
audio.addEventListener("ended", () => {
  if (isRepeat) {
    // If repeat is on, reset current time and play immediately
    audio.currentTime = 0;
    playSong();
    return; // Stop further processing for 'ended' event
  }
  // If repeat is off, play the next song automatically
  playNextSong();
});

// Update play/pause icon and animation class when playback starts or pauses
audio.addEventListener("play", () => {
  togglePlayPauseIcon(true);
});

audio.addEventListener("pause", () => {
  togglePlayPauseIcon(false);
});

// Event listener for volume slider changes
volume.addEventListener("input", () => {
  audio.volume = volume.value / 100; // Set audio volume (0.0 to 1.0)
  savePlayerState(); // Save volume state
});

// --- Initial Load ---
initializePlayer(); // Load saved state when the page loads
