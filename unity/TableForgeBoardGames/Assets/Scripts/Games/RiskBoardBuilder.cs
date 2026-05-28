using System.Collections.Generic;
using TableForge.Core;
using UnityEngine;

namespace TableForge.Games
{
    /// <summary>Risk world map on table — continent plates + territory markers from state JSON.</summary>
    public class RiskBoardBuilder : MonoBehaviour
    {
        private Transform _root;
        private readonly Dictionary<string, Renderer> _territoryRenderers = new();

        private static readonly (string id, Vector3 pos, Vector3 scale, string hex)[] Plates =
        {
            ("na", new Vector3(-0.38f, 0.03f, 0.18f), new Vector3(0.32f, 0.04f, 0.24f), "#8B9A4A"),
            ("sa", new Vector3(-0.32f, 0.03f, -0.18f), new Vector3(0.22f, 0.04f, 0.2f), "#7A5C3A"),
            ("eu", new Vector3(0.02f, 0.03f, 0.24f), new Vector3(0.24f, 0.04f, 0.18f), "#6B7C8E"),
            ("af", new Vector3(0.06f, 0.03f, -0.02f), new Vector3(0.22f, 0.04f, 0.26f), "#C4A040"),
            ("as", new Vector3(0.4f, 0.03f, 0.1f), new Vector3(0.34f, 0.04f, 0.28f), "#5A8F5A"),
            ("oc", new Vector3(0.44f, 0.03f, -0.2f), new Vector3(0.2f, 0.04f, 0.16f), "#7AB89A"),
        };

        private void Start() => BuildBoard();

        public void ApplyState(string json)
        {
            // territories:[{id,ownerId,armies}]
            foreach (var kv in _territoryRenderers)
            {
                var owner = ExtractOwnerForId(json, kv.Key);
                if (string.IsNullOrEmpty(owner))
                {
                    kv.Value.material.color = new Color(0.5f, 0.5f, 0.52f);
                    continue;
                }
                var hue = Mathf.Abs(owner.GetHashCode() % 360) / 360f;
                kv.Value.material.color = Color.HSVToRGB(hue, 0.55f, 0.75f);
            }
        }

        private void BuildBoard()
        {
            _root = new GameObject("RiskMap").transform;
            _root.SetParent(transform, false);

            var table = GameObject.CreatePrimitive(PrimitiveType.Cube);
            table.name = "Table";
            table.transform.SetParent(_root, false);
            table.transform.localScale = new Vector3(1.3f, 0.08f, 0.9f);
            table.transform.localPosition = new Vector3(0f, -0.05f, 0f);
            table.GetComponent<Renderer>().material = TableForgeMaterials.WoodTable;

            var ocean = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ocean.name = "Ocean";
            ocean.transform.SetParent(_root, false);
            ocean.transform.localScale = new Vector3(1.15f, 0.02f, 0.82f);
            ocean.transform.localPosition = new Vector3(0f, 0.01f, 0f);
            ocean.GetComponent<Renderer>().material = TableForgeMaterials.Ocean;

            foreach (var (id, pos, scale, hex) in Plates)
            {
                TableForgeJson.TryParseColor(hex, out var land);
                var plate = GameObject.CreatePrimitive(PrimitiveType.Cube);
                plate.name = $"Continent_{id}";
                plate.transform.SetParent(_root, false);
                plate.transform.localPosition = pos;
                plate.transform.localScale = scale;
                var rend = plate.GetComponent<Renderer>();
                rend.material = TableForgeMaterials.Create(land, 0.3f);
                _territoryRenderers[id] = rend;
            }
        }

        private static string ExtractOwnerForId(string json, string id)
        {
            var chunk = $"\"id\":\"{id}\"";
            var idx = json.IndexOf(chunk, System.StringComparison.Ordinal);
            if (idx < 0) return "";
            var ownerNeedle = "\"ownerId\":\"";
            var oIdx = json.IndexOf(ownerNeedle, idx, System.StringComparison.Ordinal);
            if (oIdx < 0 || oIdx > idx + 80) return "";
            oIdx += ownerNeedle.Length;
            var end = json.IndexOf('"', oIdx);
            return end < 0 ? "" : json.Substring(oIdx, end - oIdx);
        }
    }
}
