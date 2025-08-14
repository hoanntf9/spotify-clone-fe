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
      window.location.href = "/";
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

// Profile Logic

async function updateCurrentUser(path, profile) {
  const res = await httpRequest.put(path, profile);
  return res;
}

document.addEventListener("DOMContentLoaded", function () {
  const modalProfile = document.getElementById("modalProfile");
  const profileName = document.getElementById("profile-name");
  const closeBtn = modalProfile.querySelector(".close-btn");
  const nameInput = document.getElementById("profileNameInput");
  const saveBtn = modalProfile.querySelector(".save-btn");
  const avatarInput = document.getElementById("avatarInput");
  const profileAvatar = document.getElementById("profileAvatar");
  const avatarPreview = document.getElementById("avatarPreview");
  const userAvatarURL = document.getElementById("user-avatar-img");

  async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "demo_unsigned");

    const cloudName = "dqi86z9gb";

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    return data.secure_url; // URL ảnh Cloudinary
  }

  // Khi reload `F5` vẫn hiển thị thông tin tên của người dùng
  const user = getItemStorage("user");
  console.log(user);
  if (user) {
    profileName.textContent = user?.display_name;
    avatarPreview.src = user?.avatar_url;
    profileAvatar.src = user?.avatar_url;
    userAvatarURL.src = user?.avatar_url;
  } else {
    window.location.href = "index.html";
  }

  function openModal() {
    profileName.addEventListener("click", function () {
      modalProfile.style.display = "block";
    });

    const currentUser = getItemStorage("user");

    if (currentUser && currentUser.display_name)
      nameInput.value = currentUser.display_name;
    else {
      nameInput.value = "";
    }
  }

  function hideModalProfile() {
    modalProfile.style.display = "none";
  }

  function closeModal() {
    closeBtn.addEventListener("click", hideModalProfile);
    window.addEventListener("click", function (e) {
      if (e.target === modalProfile) {
        hideModalProfile();
      }
    });
  }

  // Xem ảnh trước khi chọn
  avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      avatarPreview.src = imageUrl;
    }
  });

  saveBtn.addEventListener("click", async function () {
    const file = avatarInput.files[0];
    let uploadedImageUrl = null;

    if (file) {
      try {
        uploadedImageUrl = await uploadImageToCloudinary(file);
      } catch (err) {
        toast({ text: "Upload image profile fail", type: "error" });
        return;
      }
    }

    const nameInputValue = nameInput.value.trim();
    const { email, username, display_name } = getItemStorage("user");
    console.log(email, username, display_name);
    const profile = {
      email,
      username,
      display_name,
      display_name: nameInputValue,
      avatar_url: file ? uploadedImageUrl : "",
    };

    try {
      const { message, user } = await updateCurrentUser(
        endpoints.usersMe,
        profile
      );

      toast({
        text: message,
        type: "success",
      });

      hideModalProfile();
      profileName.textContent = user?.display_name;
      profileAvatar.src = user?.avatar_url;
      userAvatarURL.src = user?.avatar_url;
      setItemStorage("user", user);
    } catch (error) {
      console.log(error);
    }
  });
  openModal();
  closeModal();
});
