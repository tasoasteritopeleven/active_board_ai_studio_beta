mergeInto(LibraryManager.library, {
  TableForgePostMessage: function (ptr) {
    var msg = UTF8ToString(ptr);
    if (typeof window !== 'undefined' && window.TableForgeUnityBridge) {
      window.TableForgeUnityBridge.onUnityMessage(msg);
    }
  },
});
