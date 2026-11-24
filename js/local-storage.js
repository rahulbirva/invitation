/**
 * Local Asset Resolver (replaces Firebase Storage for standalone offline/local hosting)
 * Resolves all data-storage-path attributes directly to ./assets/<filename>
 */
(function () {
  'use strict';

  function resolveLocalPath(storagePath) {
    if (!storagePath) return null;
    if (/^(https?:|data:|blob:|\.?\/?assets\/)/i.test(storagePath)) {
      return storagePath;
    }

    var decoded;
    try {
      decoded = decodeURIComponent(storagePath);
    } catch (e) {
      decoded = storagePath;
    }

    var parts = decoded.replace(/^\/+/, '').split('/');
    var filename = parts[parts.length - 1] || '';
    if (!filename) return null;

    if (/bharath-anusha/i.test(decoded) && /^(1|2)\.jpeg$/i.test(filename)) {
      filename = 'couple-' + filename;
    }

    return 'assets/' + encodeURIComponent(filename);
  }

  function getDownloadUrlByPath(path) {
    return Promise.resolve(resolveLocalPath(path));
  }

  function getSharedAssetUrl(assetPath) {
    return Promise.resolve(resolveLocalPath(assetPath));
  }

  function getClientAssetUrl(_clientName, assetPath) {
    return Promise.resolve(resolveLocalPath(assetPath));
  }

  function initializeAssets() {
    var nodes = document.querySelectorAll('[data-storage-path]');
    nodes.forEach(function (el) {
      var path = el.getAttribute('data-storage-path');
      var url = resolveLocalPath(path);
      if (!url) return;
      var current = el.getAttribute('src') || '';
      if (current === url) return;
      var tag = el.tagName.toLowerCase();
      if (tag === 'img' || tag === 'video' || tag === 'audio') {
        el.setAttribute('src', url);
      } else if (tag === 'source') {
        el.setAttribute('src', url);
        if (el.parentElement && typeof el.parentElement.load === 'function') {
          el.parentElement.load();
        }
      }
    });
    return Promise.resolve();
  }

  window.FirebaseStorage = {
    getClientAssetUrl: getClientAssetUrl,
    getSharedAssetUrl: getSharedAssetUrl,
    getDownloadUrlByPath: getDownloadUrlByPath,
    getCurrentClientName: function () { return 'megha-shailendra'; },
    setImageSrcFromStorage: function (el, p) {
      var u = resolveLocalPath(p);
      if (el && u) el.src = u;
      return Promise.resolve(u);
    },
    setAudioSrcFromStorage: function (el, p) {
      var u = resolveLocalPath(p);
      if (el && u) el.src = u;
      return Promise.resolve(u);
    },
    setSharedAssetSrc: function (el, p) {
      var u = resolveLocalPath(p);
      if (el && u) el.src = u;
      return Promise.resolve(u);
    },
    initializeAssets: initializeAssets,
    constructFirebaseStorageUrl: resolveLocalPath,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAssets);
  } else {
    initializeAssets();
  }
})();
