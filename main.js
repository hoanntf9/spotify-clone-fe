// Import components
import "./layouts/app-layout.js";
import "./components/app-sidebar/app-sidebar.js";
import "./components/app-footer/app-footer.js";

import endpoints from "./utils/endpoints.js";
import { toast } from "./utils/toast.js";
import {
  setItemStorage,
  clearStorage,
  getItemStorage,
} from "./utils/storage.js";
import {
  escapeHtml,
  formartTrackDuration,
  formatTrackPlayCount,
} from "./utils/common.js";
import httpRequest from "./utils/httpRequest.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  // Function to show / hide `eye password` icon;
  function bindTogglePassword() {
    const eyeToggles = document.querySelectorAll(".input-with-eye .eye-toggle");

    eyeToggles.forEach((toggle) => {
      const icon = toggle.querySelector(".icon-eye");
      const input = toggle.closest(".input-with-eye")?.querySelector("input");

      if (!icon || !input) return;

      const clonedToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(clonedToggle, toggle);

      clonedToggle.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        icon.classList.toggle("fa-eye", !isPassword);
        icon.classList.toggle("fa-eye-slash", isPassword);

        input.focus();
      });
    });
  }

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    bindTogglePassword();
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    bindTogglePassword();
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  // Tạo chức năng login
  loginForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const authButtons = document.querySelector(".auth-buttons");
      const userMenu = document.querySelector(".user-menu");
      const email = document.querySelector("#loginEmail").value;
      const password = document.querySelector("#loginPassword").value;
      const userAvatarImage = document.querySelector("#user-avatar-img");

      const credentials = {
        email,
        password,
      };

      try {
        const { access_token, message, user } = await httpRequest.post(
          endpoints.authLogin,
          credentials
        );

        if (user) {
          toast({
            text: message,
            type: "success",
          });

          setItemStorage("accessToken", access_token);
          setItemStorage("user", user);
          this.reset();
          closeModal();

          authButtons.classList.remove("show");
          userMenu.classList.add("show");

          const srcAvatar = user?.avatar_url
            ? user?.avatar_url
            : "./default-avatar.png";

          userAvatarImage.src = srcAvatar;
        }
      } catch (error) {
        const errorCode = error?.response?.code;
        const errorMessage = error?.response?.message;

        if (
          errorCode === "INVALID_CREDENTIALS" ||
          errorCode === "VALIDATION_ERROR"
        ) {
          toast({
            text: errorMessage,
            type: "error",
          });
        }
      }
    });

  // Tạo chức năng đăng ký
  signupForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.querySelector("#signupEmail").value;
      const password = document.querySelector("#signupPassword").value;

      const credentials = {
        email,
        password,
      };

      try {
        const { user, access_token, message } = await httpRequest.post(
          endpoints.authRegister,
          credentials
        );

        if (user) {
          toast({
            text: message,
            type: "success",
          });

          setItemStorage("accessToken", access_token);
          showLoginForm();
          authButtons.classList.add("show");
        }
      } catch (error) {
        const errorCode = error?.response?.code;
        const errorMessage = error?.response?.message;

        if (errorCode === "EMAIL_EXISTS") {
          toast({
            text: errorMessage || "Email Exists",
            type: "error",
          });
        }
      }
    });
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Tạo chức năng logout
  logoutBtn.addEventListener("click", async function () {
    userDropdown.classList.remove("show");

    const { message } = await httpRequest.post(endpoints.authLogout);

    if (message) {
      toast({
        text: "Logout successfully",
        type: "success",
      });

      clearStorage();

      const origin = window.location.origin;
      const pathName = window.location.pathname;
      window.location.href = origin + pathName;
    }
  });
});

// Xử lý khi F5 `reload` lại trang thì check hiển thị avatar trên header.
document.addEventListener("DOMContentLoaded", async function () {
  const authButtons = document.querySelector(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");
  const userAvatarImage = document.querySelector("#user-avatar-img");

  const accessToken = getItemStorage("accessToken");
  const user = getItemStorage("user");

  if (accessToken) {
    userMenu.classList.add("show");
    userAvatarImage.src = user?.avatar_url
      ? user?.avatar_url
      : "./default-avatar.png";
    return;
  } else {
    authButtons.classList.add("show");
  }
});

// Today's biggest hits
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const { playlists } = await httpRequest.get(endpoints.playlists);
    if (playlists.length) {
      rendenBiggestHits(playlists);
    }
  } catch (error) {
    console.log(error);
  }
});

function rendenBiggestHits(playlists) {
  const hitsGrid = document.querySelector("#hits-grid");
  const urlPlaylist = "https://example.com/playlist-cover.jpg";

  const html = playlists
    .map((playlist) => {
      return `
        <div class="hit-card">
          <div class="hit-card-cover">
            <img src=${escapeHtml(
              playlist.image_url && !playlist.image_url.includes(urlPlaylist)
                ? playlist.image_url
                : "./../../playlist-default.png"
            )} alt=${playlist?.image_url} />
            <button class="hit-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="hit-card-info">
            <h3 class="hit-card-title">${escapeHtml(
              playlist.name ? playlist.name : "Han"
            )}</h3>
            <p class="hit-card-artist">Playlist • ${escapeHtml(
              playlist.user_username ? playlist.user_username : "Han"
            )}</p>
          </div>
        </div>
      `;
    })
    .join("");

  hitsGrid.innerHTML = html;
}

// Popular Artists
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const { artists } = await httpRequest.get(endpoints.artists);
    if (artists.length) {
      renderPopularArtists(artists);
    }
  } catch (error) {
    console.log(error);
  }
});

function renderPopularArtists(artists) {
  const artistsGrid = document.querySelector("#artists-grid");

  const html = artists
    .map((artist) => {
      return `
        <div class="artist-card">
          <div class="artist-card-cover">
            <img src=${escapeHtml(
              artist.image_url ? artist.image_url : "./placeholder.svg"
            )}  alt=${artist.name} />
            <button class="artist-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="artist-card-info">
            <h3 class="artist-card-name">${escapeHtml(artist.name)}</h3>
            <p class="artist-card-type">Artist</p>
          </div>
        </div>
      `;
    })
    .join("");

  artistsGrid.innerHTML = html;
}

// Xử lý sự kiện khi back/forward: popstate
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const playlistId = params.get("playlist");

  renderPageFromUrl();

  // Cập nhật active cho sidebar
  const sidebar = document.querySelector("app-sidebar");
  if (sidebar && playlistId) {
    sidebar.setActivePlaylist(playlistId);
  }
});

// Xử lý sự kiện khi click item bên trong sidebar bắn ra bên ngoài
document.addEventListener("playlist-selected", function (e) {
  const wrapDetail = document.querySelector(".wrap-detail");
  const wrapContent = document.querySelector(".wrap-content");

  wrapDetail.classList.add("show");
  wrapContent.classList.add("hide");

  renderPageFromUrl();
});

// Xử lý khi click vào từng item thì nhận lại event `playlist-selected`
document.addEventListener("DOMContentLoaded", () => renderPageFromUrl());

function renderPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const playlistId = params.get("playlist");

  const wrapDetail = document.querySelector(".wrap-detail");
  const wrapContent = document.querySelector(".wrap-content");

  if (playlistId) {
    wrapDetail.classList.add("show");
    wrapContent.classList.add("hide");
    loadPlaylistDetail(playlistId);
  } else {
    wrapDetail.classList.remove("show");
    wrapContent.classList.remove("hide");
  }
}

async function loadPlaylistDetail(playlistId) {
  try {
    const { tracks } = await httpRequest.get(`/playlists/${playlistId}/tracks`);
    renderTracks(tracks);
  } catch (error) {
    console.log("error");
  }
}

function renderTracks(tracks) {
  const trackList = document.querySelector(".track-list");

  if (!tracks.length) {
    trackList.innerHTML =
      "<p>No tracks, please create track in playlist...</p>";
    return;
  }

  const html = tracks
    .map(
      (track, index) =>
        `<div class="track-item">
            <div class="track-number">${index + 1}</div>
            <div class="track-image">
            <img src=${
              track.artist_image_url
                ? track.artist_image_url
                : "./playlist-default.png"
            } alt="Cho Tôi Lang Thang">
            </div>
            <div class="track-info">
            <div class="track-name">${escapeHtml(track.track_title)}</div>
            </div>
            <div class="track-plays">${formatTrackPlayCount(
              track.track_play_count
            )}</div>
            <div class="track-duration">${formartTrackDuration(
              track.track_duration
            )}</div>
            <button class="track-menu-btn">
            <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>`
    )
    .join("");

  trackList.innerHTML = html;
}

// Music Player App
document.addEventListener("DOMContentLoaded", async function () {
  // Gọi dữ liệu từ danh sách bài hát từ API
  const { tracks } = await httpRequest.get(endpoints.tracks);

  if (tracks.length) {
    player._tracks = tracks;
  }
  player._start();
});

const player = {
  NEXT: 1,
  PREV: -1,
  PREV_THROTTLE: 2,
  _trackListElement: document.querySelector("#track-list"),
  _artistNameElement: document.querySelector("#artist-name"),
  _monthlyListenersElement: document.querySelector(".monthly-listeners"),
  _heroImageElement: document.querySelector("#hero-image"),
  _audioElement: document.querySelector("#audio"),
  _togglePlayElement: document.querySelector("#btn-toggle-play"),
  _playIconElement: document.querySelector("#play-icon"),
  _timeEndElement: document.querySelector("#time-end"),
  _timeStartElement: document.querySelector("#time-start"),
  _progressElement: document.querySelector(".progress-bar"),
  _prevElement: document.querySelector(".btn-prev"),
  _nextElement: document.querySelector(".btn-next"),
  _randomElement: document.querySelector(".btn-random"),
  _repeatElement: document.querySelector(".btn-repeat"),
  _playerTitle: document.querySelector(".player-title"),
  _playerArtist: document.querySelector(".player-artist"),
  _playerImage: document.querySelector(".player-image"),
  _muteElement: document.querySelector(".btn-mute"),
  _iconMuteElement: document.querySelector(".icon-mute"),
  _volumeSlider: document.querySelector(".volume-slider"),
  _faVolumeIcon: document.querySelector(".fa-volume-icon"),

  _lastVolume: 0.5, // 0 - 1
  _isMuted: false,
  _isRandom: false,
  _isLoop: false,
  _isPlaying: false,
  _tracks: [],
  _currentIndex: 0,
  _start() {
    this._render();
    this._handlePlayback();

    // Hiển thị tippy khi hover vào control player
    tippy(this._togglePlayElement, { content: "Play" });
    tippy(this._nextElement, { content: "Next" });
    tippy(this._prevElement, { content: "Previous" });
    tippy(this._repeatElement, { content: "Enable Repeat" });
    tippy(this._randomElement, { content: "Enable shuffle" });
    tippy(this._faVolumeIcon, { content: "Mute" });

    // DOM events
    this._togglePlayElement.onclick = this._togglePlay.bind(this);

    // Khi click vào nút `play`
    this._audioElement.onplay = () => {
      this._playIconElement.classList.remove("fa-play");
      this._playIconElement.classList.add("fa-pause");
      // this._trackName.classList.add("active");
      // Chuyển đổi trạng thái sang bật nhạc
      this._isPlaying = true;
      // Sao lại cần phải gọi hàm render ở đây!!!!
      this._render();
    };

    // Khi click vào nút `pause`
    this._audioElement.onpause = () => {
      this._playIconElement.classList.remove("fa-pause");
      this._playIconElement.classList.add("fa-play");

      // Chuyển đổi trạng thái sang tắt nhạc
      this._isPlaying = false;

      // Sao lại cần phải gọi hàm render ở đây!!!!
      this._render();
    };

    this._prevElement.onclick = this._handleControl.bind(this, this.PREV);
    this._nextElement.onclick = this._handleControl.bind(this, this.NEXT);
    // Khi người dùng nhấn vào nút loop
    this._repeatElement.onclick = () => {
      this._isLoop = !this._isLoop;

      this._audioElement.loop = this._isLoop;
      this._repeatElement.classList.toggle("active", this._isLoop);
    };

    // Khi người dùng nhấn vào nút random
    this._randomElement.onclick = () => {
      this._isRandom = !this._isRandom;

      this._randomElement.classList.toggle("active", this._isRandom);

      this._handleForNewIndex();
    };

    // Khi audio được phát và được update
    this._audioElement.ontimeupdate = () => {
      // Check khi người dùng seeking thì không update thời gian nhạc
      if (this._progressElement.seeking) {
        return;
      }

      // Lấy thời gian hiện tại của bài hát đang phát được tính bằng (s)
      const currentTime = this._audioElement.currentTime;

      // Lấy tổng thời lượng của bài hát tính bằng (s)
      const duration = this._audioElement.duration;

      // Tính phần trăm bài hát đã phát xong (%)
      const progress = (currentTime / duration) * 100;

      // Cập nhật giá trị vào thanh tiến trình
      this._progressElement.value = progress || 0;

      // Update start time khi đang phát nhạc
      this._timeStartElement.textContent = this._formatTime(currentTime);

      // Cập nhật màu vào thanh tiến trình
      this._updateProgressBarColor(progress || 0);
    };

    // Xử lý khi đang bật loop mà hát hết bài thì xử lý
    this._audioElement.onended = () => {
      if (this._isLoop) {
        // Loop toàn playlist
        this._currentIndex = (this._currentIndex + 1) % this._tracks.length;
        this._handleForNewIndex();
        this._audioElement.play();
      } else if (this._isRandom) {
        // Nếu bật random
        this._currentIndex = this._getRandomIndex();
        this._handleForNewIndex();
        this._audioElement.play();
      } else {
        // Không loop, không random: chỉ next đến bài tiếp
        if (this._currentIndex < this._tracks.length - 1) {
          this._currentIndex++;
          this._handleForNewIndex();
          this._audioElement.play();
        } else {
          // Nếu hết bài và không loop playlist thì dừng
          this._isPlaying = false;
          this._render();
        }
      }
    };

    this._progressElement.onmousedown = () => {
      this._progressElement.seeking = true;
    };

    this._progressElement.onmouseup = () => {
      const nextStep = +this._progressElement.value;

      this._audioElement.currentTime =
        (this._audioElement.duration / 100) * nextStep;

      this._progressElement.seeking = false;
    };

    // Mute
    this._muteElement.onclick = () => {
      this._isMuted = !this._isMuted;

      if (this._isMuted) {
        // mute
        this._iconMuteElement.className = "fa-solid fa-microphone-slash";
        this._audioElement.volume = 0;
        this._playIconElement.classList.remove("fa-pause");
        this._playIconElement.classList.add("fa-play");
        this._audioElement.pause();

        this._volumeSlider.value = 0;

        // Chuyển đổi trạng thái sang bật nhạc
        this._isPlaying = false;

        // Câp nhật lại thanh trình duyệt background color
        this._updateVolumeColor(0);

        this._render();
      } else {
        // play
        this._iconMuteElement.className = "fas fa-microphone";
        this._audioElement.volume = this._lastVolume;
        this._playIconElement.classList.remove("fa-play");
        this._playIconElement.classList.add("fa-pause");

        this._audioElement.play();

        this._volumeSlider.value = this._lastVolume * 100;

        // Chuyển đổi trạng thái sang tắt nhạc
        this._isPlaying = true;

        // Câp nhật lại thanh trình duyệt background color
        this._updateVolumeColor(this._lastVolume * 100);

        // Tại sao phải gọi hàm render ở đây????
        this._render();
      }
    };

    // Kéo thả volumn
    this._volumeSlider.oninput = () => {
      const volume = this._volumeSlider.value / 100;
      this._audioElement.volume = volume;
      this._updateVolumeColor(volume * 100 || 0);

      this._faVolumeIcon.classList.remove(
        "fa-volume-xmark",
        "fa-volume-low",
        "fa-volume-high"
      );

      if (volume === 0) {
        this._faVolumeIcon.classList.add("fa-solid", "fa-volume-xmark");
      } else if (volume < 0.5) {
        this._faVolumeIcon.classList.add("fa-solid", "fa-volume-low");
      } else {
        this._faVolumeIcon.classList.add("fa-solid", "fa-volume-high");
      }
    };
  },
  _render() {
    const html = this._tracks
      .map((track, index) => {
        const isCurrentSongPlaying =
          index === this._currentIndex && this._isPlaying;
        return `
          <div 
            class="track-item ${isCurrentSongPlaying ? "playing" : ""}"
            data-index="${index}"
          >
            <div class="track-number">
              ${
                isCurrentSongPlaying
                  ? `<div class="equalizer">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  `
                  : index + 1
              }
            </div>

            <div class="track-image">
              <img
                src=${escapeHtml(track.image_url)}
                alt${track.image_url}
              />
            </div>
            <div class="track-info">
              <div class="track-name ${
                isCurrentSongPlaying ? "active" : ""
              }">${escapeHtml(track.title)}</div>
              <div class="track-artist-name ${
                isCurrentSongPlaying ? "active" : ""
              }">${escapeHtml(track.artist_name)}</div>
            </div>
            <div class="track-plays">${formatTrackPlayCount(
              track.play_count
            )}</div>
            <div class="track-duration">${formartTrackDuration(
              track.duration
            )}</div>
            <button class="track-menu-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
          `;
      })
      .join("");

    this._trackListElement.innerHTML = html;

    const trackEls = document.querySelectorAll(".track-item");
    trackEls.forEach((el) => el.classList.remove("active"));

    // Gán active cho bài hiện tại
    const currentTrackEl = document.querySelector(
      `.track-item[data-index="${this._currentIndex}"]`
    );

    if (currentTrackEl) {
      currentTrackEl.classList.add("active");

      // Auto scroll vào tầm nhìn
      currentTrackEl.scrollIntoView({
        behavior: "smooth",
        block: "center", // nearest hoặc "center" nếu muốn luôn ở giữa
      });
    }

    // Click vào từng bài thì phát luôn bài đó
    trackEls.forEach((el) => {
      el.addEventListener("click", () => {
        const index = Number(el.dataset.index);
        this._playTrack(index);
      });
    });
  },
  _playTrack(index) {
    this._currentIndex = index;
    this._audioElement.src = this._tracks[index].audio_url;
    this._audioElement.play();
    this._isPlaying = true;

    // Render lại để update UI
    this._render();
  },
  _handlePlayback() {
    const currentSong = this._getCurrentSong();
    this._artistNameElement.textContent = currentSong.title;
    this._playerTitle.textContent = currentSong.title;
    this._playerArtist.textContent = currentSong.artist_name;
    this._playerImage.src = currentSong.image_url;

    this._monthlyListenersElement.textContent = `${formatTrackPlayCount(
      currentSong.play_count
    )} monthly listeners`;
    this._heroImageElement.src = currentSong.image_url;
    this._audioElement.volume = this._lastVolume;

    this._audioElement.src = currentSong.audio_url;

    this._volumeSlider.value = this._lastVolume * 100;

    //Ban đầu set luôn background color cho input volume
    const initVolume = this._volumeSlider.value; // 0–100
    const percentage = (initVolume / 100) * 100;

    this._volumeSlider.style.background = `linear-gradient(
      to right,
      #1db954 0%,
      #1db954 ${percentage}%,
      #ccc ${percentage}%,
      #ccc 100%
    )`;

    // oncanplay
    this._audioElement.oncanplay = () => {
      if (this._isPlaying) {
        this._audioElement.play();
      }

      // Hiển thì thời gian kết thúc bằng tổng thời gian của audio cho trước
      this._timeEndElement.textContent = this._formatTime(
        this._audioElement.duration
      );
    };
  },
  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  },
  _handleControl(step) {
    this._isPlaying = true;

    const shouldReset = this._audioElement.currentTime > this.PREV_THROTTLE;

    if (step === this.PREV && shouldReset) {
      this._audioElement.currentTime = 0;
      return;
    }

    if (this._isRandom) {
      this._currentIndex = this._getRandomIndex();
    } else {
      this._currentIndex += step;
    }

    this._handleForNewIndex();
  },
  _getRandomIndex() {
    if (this._tracks.length === 1) {
      return this._currentIndex;
    }

    let randIndex = null;

    do {
      randIndex = Math.floor(Math.random() * this._tracks.length);
    } while (randIndex === this._currentIndex);

    return randIndex;
  },
  _handleForNewIndex() {
    this._currentIndex =
      (this._currentIndex + this._tracks.length) % this._tracks.length;
    this._handlePlayback();
    this._render();
  },
  _updateProgressBarColor(value) {
    const progress = Math.min(100, Math.max(0, Number(value.toFixed(2)))) + 0.5;

    this._progressElement.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${progress}%, #ccc ${progress}%, #ccc 100%)`;
  },
  _updateVolumeColor(value) {
    const progress = Math.min(100, Math.max(0, Number(value.toFixed(2)))) + 0.5;

    this._volumeSlider.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${progress}%, #ccc ${progress}%, #ccc 100%)`;
  },
  _getCurrentSong() {
    return this._tracks[this._currentIndex];
  },
  _togglePlay() {
    // Khi click vào nút play thì toggle play song
    if (this._audioElement.paused) {
      this._audioElement.play();
    } else {
      this._audioElement.pause();
    }
  },
};
