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

    /// <summary>Physical table scene — wood surface, warm lighting, game board swap.</summary>
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
                boardRoot.localPosition = new Vector3(0f, 0.05f, 0f);
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

            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.35f, 0.38f, 0.45f);
            RenderSettings.ambientEquatorColor = new Color(0.25f, 0.22f, 0.18f);
            RenderSettings.ambientGroundColor = new Color(0.08f, 0.06f, 0.05f);

            var table = GameObject.CreatePrimitive(PrimitiveType.Cube);
            table.name = "Table";
            table.transform.SetParent(transform);
            table.transform.localPosition = new Vector3(0f, -0.38f, 0f);
            table.transform.localScale = new Vector3(16f, 0.22f, 11f);
            table.GetComponent<Renderer>().material = TableForgeMaterials.WoodTable;
            tableRoot = table.transform;

            var rim = GameObject.CreatePrimitive(PrimitiveType.Cube);
            rim.name = "TableRim";
            rim.transform.SetParent(table.transform, false);
            rim.transform.localPosition = new Vector3(0f, 0.55f, 0f);
            rim.transform.localScale = new Vector3(1.02f, 0.08f, 1.02f);
            rim.GetComponent<Renderer>().material = TableForgeMaterials.Create(new Color(0.45f, 0.28f, 0.14f), 0.4f);

            var cam = Camera.main;
            if (cam != null)
            {
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(0.05f, 0.06f, 0.09f);
                cam.transform.position = new Vector3(0f, 12f, -10f);
                cam.transform.rotation = Quaternion.Euler(48f, 0f, 0f);
                cam.fieldOfView = 42f;
            }

            AddLight("Key", LightType.Directional, new Vector3(50f, -35f, 0f), 1.15f, new Color(1f, 0.96f, 0.9f));
            AddLight("Fill", LightType.Directional, new Vector3(-40f, -20f, 25f), 0.45f, new Color(0.7f, 0.8f, 1f));
            AddLight("Rim", LightType.Point, new Vector3(0f, 8f, -6f), 0.8f, new Color(1f, 0.85f, 0.6f));
        }

        private static void AddLight(string name, LightType type, Vector3 euler, float intensity, Color color)
        {
            var go = new GameObject(name);
            var light = go.AddComponent<Light>();
            light.type = type;
            light.intensity = intensity;
            light.color = color;
            light.shadows = type == LightType.Directional ? LightShadows.Soft : LightShadows.None;
            go.transform.rotation = Quaternion.Euler(euler);
        }

        public void HandleReactPayload(string payload)
        {
            if (string.IsNullOrEmpty(payload)) return;

            if (payload.StartsWith("{\"cmd\":\"init\""))
            {
                SetGame(ParseGame(ExtractString(payload, "game")));
                return;
            }

            if (payload.StartsWith("{\"cmd\":\"state\""))
                ApplyStateJson(payload);
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
                    boardRoot.GetComponent<MonopolyBoardBuilder>()?.ApplyState(stateJson);
                    break;
                case BoardGameId.Codenames:
                    boardRoot.GetComponent<CodenamesBoardBuilder>()?.ApplyState(stateJson);
                    break;
                case BoardGameId.Risk:
                    boardRoot.GetComponent<RiskBoardBuilder>()?.ApplyState(stateJson);
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
                Destroy(boardRoot.GetChild(i).gameObject);
        }

        private static BoardGameId ParseGame(string g) => g switch
        {
            "monopoly" => BoardGameId.Monopoly,
            "codenames" => BoardGameId.Codenames,
            "risk" => BoardGameId.Risk,
            _ => BoardGameId.None,
        };

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
