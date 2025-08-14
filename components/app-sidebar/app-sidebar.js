import { createShadowTempalate, createFileLoader } from "../../utils/common.js";
import endpoints from "../../utils/endpoints.js";
import httpRequest from "../../utils/httpRequest.js";
import { escapeHtml } from "../../utils/common.js";
import { setItemStorage } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";
const { loadMultipleFiles, loadFile } = createFileLoader(import.meta.url);

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const [cssTexts, htmlText] = await Promise.all([
      loadMultipleFiles([
        "./../../css/layout.css",
        "./../../css/reset.css",
        "./../../css/responsive.css",
        "./../../css/variables.css",
        "./../../css/components.css",
      ]),
      loadFile("./app-sidebar.html"),
    ]);

    this.shadowRoot.innerHTML = createShadowTempalate(cssTexts, htmlText);

    this.start();

    // Xử lý khi nhấn vào nút create thì hiển thị modal tạo create lên
    const createBtn = this.shadowRoot.querySelector("#create-btn");
    const createMenu = this.shadowRoot.querySelector("#create-menu");
    const createPlaylist = this.shadowRoot.querySelector("#create-playlist");

    createBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      createMenu.classList.toggle("show");
    });

    // Khi click vào modal lớp phủ bền ngoài thì modal create playlist sẽ bị close đi
    document.addEventListener("click", (e) => {
      const path = e.composedPath();

      // Nếu không click vào menu hoặc nút thì đóng nó
      if (!path.includes(createMenu) && !path.includes(createBtn)) {
        createMenu.classList.remove("show");
      }
    });

    // Khi nhấn `Escape` thì modal create playlist sẽ bị close đi
    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        createMenu.classList.remove("show");
      }
    });

    // Khi click vào nút create thì tạo ra playlist mới
    createPlaylist.addEventListener("click", async () => {
      const playlistItem = {
        name: "My Playlist",
        description: "Playlist is nice",
        is_public: true,
        image_url: "",
      };

      try {
        const { message, playlist } = await httpRequest.post(
          endpoints.playlists,
          playlistItem
        );

        toast({
          text: message,
          type: "success",
        });

        createMenu.classList.remove("show");

        this.start();
      } catch (error) {
        console.log(error);
      }
    });

    // Context Menu
    this.contextMenu = this.shadowRoot.querySelector("#contextMenu");
    // this.renameOption = this.shadowRoot.querySelector(".renameOption");
    this.deleteOption = this.shadowRoot.querySelector(".deleteOption");
    this.contextTarget = null;

    // this.renameOption.addEventListener("click", async () => {
    //   if (this.contextTarget) {
    //     const titleEl = this.contextTarget.querySelector(".item-title");
    //     const currentName = titleEl.textContent;
    //     const newName = prompt("Enter new playlist name", currentName);
    //     if (newName && newName.trim()) {
    //       titleEl.textContent = newName.trim();
    //       // TODO: Gọi API rename playlist
    //     }
    //     this.contextTarget = null;
    //     this.contextMenu.style.display = "none";
    //   }
    // });

    this.deleteOption.addEventListener("click", async () => {
      if (this.contextTarget) {
        const playlistId = this.contextTarget.dataset.playlistId;
        this.contextTarget.remove();
        // TODO: Gọi API xóa playlist
        this.contextTarget = null;
        this.contextMenu.style.display = "none";
      }
    });

    // Khi click ở ngoài context menu thì menu đó đóng đi
    document.addEventListener("click", (e) => {
      const path = e.composedPath();

      // Đóng create menu nếu click ngoài
      if (!path.includes(createMenu) && !path.includes(createBtn)) {
        createMenu.classList.remove("show");
      }

      // Đóng context menu nếu click ngoài
      if (this.contextMenu && !path.includes(this.contextMenu)) {
        this.contextMenu.style.display = "none";
      }
    });
  }

  _renderPlaylist(playlists) {
    const libraryContent = this.shadowRoot.querySelector(".library-content");
    const urlPlaylist = "https://example.com/playlist-cover.jpg";

    const html = playlists
      .map(
        (playlist, index) =>
          `<div 
            class="library-item" 
            data-playlist-id="${playlist.id}"
            data-index="${index}"
          >
        <img
          src=${escapeHtml(
            playlist.image_url && !playlist.image_url.includes(urlPlaylist)
              ? playlist.image_url
              : "./../../playlist-default.png"
          )}
          alt=${playlist.name}
          class="item-image"
        />
        <div class="item-info">
          <div class="item-title">${escapeHtml(playlist.name)}</div>
          <div class="item-subtitle">Playlist • ${escapeHtml(
            playlist.user_username ? playlist.user_username : "Han"
          )}</div>
        </div>
      </div>`
      )
      .join("");

    libraryContent.innerHTML = html;

    // Thêm sự kiện click vào từng item playlist sau khi render
    this._addClickListener();
  }

  async start() {
    try {
      const { playlists } = await httpRequest.get(endpoints.playlists);
      if (playlists.length) {
        this._renderPlaylist(playlists);
      }
    } catch (error) {
      console.log(error);
    }
  }

  _addClickListener() {
    const playlists = this.shadowRoot.querySelectorAll(".library-item");

    playlists.forEach((item) => {
      item.addEventListener("click", this._handlePlaylistClick.bind(this));

      // Sự kiện chuột phải
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.contextTarget = item;
        this._showContextMenu(e);
      });
    });
  }

  _showContextMenu(e) {
    this.contextMenu.style.top = `${e.clientY}px`;
    this.contextMenu.style.left = `${e.clientX}px`;
    this.contextMenu.style.display = "block";
  }

  _handlePlaylistClick(event) {
    const currentPlaylist = event.currentTarget;
    const playlistId = currentPlaylist.dataset.playlistId;
    const index = currentPlaylist.dataset.index;

    // Cập nhật trạng thái UI để click vào playlist thì active
    this.shadowRoot.querySelectorAll(".library-item").forEach((item) => {
      item.classList.toggle("active", item === currentPlaylist);
    });

    // Lưu trạng thái vào localStorage
    setItemStorage("activePlaylistId", playlistId);

    // Điều hướng sang trang detail (SPA)
    window.history.pushState({ playlistId }, "", `?playlist=${playlistId}`);

    // Gửi dữ liệu app chính để load dữ liệu playlist
    this.dispatchEvent(
      new CustomEvent("playlist-selected", {
        detail: { id: playlistId, index: parseInt(index, 10) },
        bubbles: true,
        composed: true,
      })
    );
  }

  setActivePlaylist(playlistId) {
    this.shadowRoot.querySelectorAll(".library-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.playlistId === playlistId);
    });
  }
}

customElements.define("app-sidebar", AppSidebar);
