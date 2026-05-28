using System.Runtime.InteropServices;
using UnityEngine;

namespace TableForge.Bridge
{
    /// <summary>
    /// WebGL ↔ React messaging (see TableForgePlugin.jslib).
    /// </summary>
    public class TableForgeJsBridge : MonoBehaviour
    {
        public static TableForgeJsBridge Instance { get; private set; }

#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void TableForgePostMessage(string message);
#endif

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void SendToReact(string message)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            TableForgePostMessage(message);
#else
            Debug.Log("[TableForge → React] " + message);
#endif
        }

        /// Called from React via SendMessage('TableForgeJsBridge', 'ReceiveFromReact', json).
        public void ReceiveFromReact(string payload)
        {
            Core.GameBoardDirector.Instance?.HandleReactPayload(payload);
        }

        public void NotifyReady(string gameId)
        {
            SendToReact("{\"type\":\"ready\",\"game\":\"" + gameId + "\"}");
        }

        public void NotifyEvent(string eventType, string dataJson = "{}")
        {
            SendToReact("{\"type\":\"" + eventType + "\",\"data\":" + dataJson + "}");
        }
    }
}
