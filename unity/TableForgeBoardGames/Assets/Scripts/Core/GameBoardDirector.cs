using TableForge.Bridge;
using TableForge.Games;
using UnityEngine;

namespace TableForge.Core
{
    public enum BoardGameId
    {
        None,
        Monopoly,
        Codenames,
        Risk,
    }

    /// <summary>
    /// Boots the physical table scene and swaps board builders per game.
    /// </summary>
    public class GameBoardDirector : MonoBehaviour
    {
        public static GameBoardDirector Instance { get; private set; }

        [SerializeField] private Transform boardRoot;
        [SerializeField] private Transform tableRoot;

        private BoardGameId _active = BoardGameId.None;
        private MonoBehaviour _activeBuilder;

        private void Awake()
        {
            Instance = this;
            EnsureEnvironment();
            if (boardRoot == null)
            {
                boardRoot = new GameObject("BoardRoot").transform;
                boardRoot.SetParent(transform);
            }
        }

        private void Start()
        {
            var bridge = FindObjectOfType<TableForgeJsBridge>();
            if (bridge == null)
            {
                var go = new GameObject("TableForgeJsBridge");
                bridge = go.AddComponent<TableForgeJsBridge>();
            }
            bridge.NotifyReady("none");
        }

        private void EnsureEnvironment()
        {
            if (tableRoot != null) return;

            var table = GameObject.CreatePrimitive(PrimitiveType.Cube);
            table.name = "Table";
            table.transform.SetParent(transform);
            table.transform.localPosition = new Vector3(0f, -0.35f, 0f);
            table.transform.localScale = new Vector3(14f, 0.2f, 10f);
            var tableMat = new Material(Shader.Find("Standard"));
            tableMat.color = new Color(0.22f, 0.14f, 0.08f);
            table.GetComponent<Renderer>().material = tableMat;
            tableRoot = table.transform;

            var cam = Camera.main;
            if (cam != null)
            {
                cam.transform.position = new Vector3(0f, 11f, -9f);
                cam.transform.rotation = Quaternion.Euler(52f, 0f, 0f);
                cam.backgroundColor = new Color(0.04f, 0.05f, 0.07f);
            }

            var lightGo = new GameObject("KeyLight");
            lightGo.transform.SetParent(transform);
            var light = lightGo.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.1f;
            light.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        public void HandleReactPayload(string payload)
        {
            if (string.IsNullOrEmpty(payload)) return;

            if (payload.StartsWith("{\"cmd\":\"init\""))
            {
                var game = ExtractString(payload, "game");
                SetGame(ParseGame(game));
                return;
            }

            if (payload.StartsWith("{\"cmd\":\"state\""))
            {
                ApplyStateJson(payload);
            }
        }

        public void SetGame(BoardGameId game)
        {
            if (_active == game) return;
            _active = game;
            ClearBoard();

            switch (game)
            {
                case BoardGameId.Monopoly:
                    _activeBuilder = boardRoot.gameObject.AddComponent<MonopolyBoardBuilder>();
                    break;
                case BoardGameId.Codenames:
                    _activeBuilder = boardRoot.gameObject.AddComponent<CodenamesBoardBuilder>();
                    break;
                case BoardGameId.Risk:
                    _activeBuilder = boardRoot.gameObject.AddComponent<RiskBoardBuilder>();
                    break;
            }

            TableForgeJsBridge.Instance?.NotifyReady(game.ToString().ToLower());
        }

        public void ApplyStateJson(string envelopeJson)
        {
            var stateJson = ExtractString(envelopeJson, "state");
            if (string.IsNullOrEmpty(stateJson)) stateJson = envelopeJson;

            switch (_active)
            {
                case BoardGameId.Monopoly:
                    (boardRoot.GetComponent<MonopolyBoardBuilder>())?.ApplyState(stateJson);
                    break;
                case BoardGameId.Codenames:
                    (boardRoot.GetComponent<CodenamesBoardBuilder>())?.ApplyState(stateJson);
                    break;
                case BoardGameId.Risk:
                    (boardRoot.GetComponent<RiskBoardBuilder>())?.ApplyState(stateJson);
                    break;
            }
        }

        private void ClearBoard()
        {
            if (_activeBuilder != null)
            {
                Destroy(_activeBuilder);
                _activeBuilder = null;
            }
            for (var i = boardRoot.childCount - 1; i >= 0; i--)
            {
                Destroy(boardRoot.GetChild(i).gameObject);
            }
        }

        private static BoardGameId ParseGame(string g)
        {
            return g switch
            {
                "monopoly" => BoardGameId.Monopoly,
                "codenames" => BoardGameId.Codenames,
                "risk" => BoardGameId.Risk,
                _ => BoardGameId.None,
            };
        }

        private static string ExtractString(string json, string key)
        {
            var needle = "\"" + key + "\":\"";
            var idx = json.IndexOf(needle, System.StringComparison.Ordinal);
            if (idx < 0) return "";
            idx += needle.Length;
            var end = json.IndexOf('"', idx);
            return end < 0 ? "" : json.Substring(idx, end - idx);
        }
    }
}
