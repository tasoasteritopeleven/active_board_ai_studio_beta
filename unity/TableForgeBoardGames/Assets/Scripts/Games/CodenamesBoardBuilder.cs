using System.Collections.Generic;
using TableForge.Core;
using UnityEngine;

namespace TableForge.Games
{
    /// <summary>5×5 Codenames — felt mat, raised card stock, spymaster tinting.</summary>
    public class CodenamesBoardBuilder : MonoBehaviour
    {
        private readonly List<Renderer> _cardRenderers = new();
        private Transform _root;

        private void Start() => BuildBoard();

        public void ApplyState(string json)
        {
            if (_cardRenderers.Count < 25) return;

            // Expect optional arrays in state: types[], revealed[]
            for (var i = 0; i < 25; i++)
            {
                var type = ExtractCardType(json, i);
                var revealed = ExtractRevealed(json, i);
                var isSpy = json.Contains("\"isSpymaster\":true");
                _cardRenderers[i].material.color = CardColor(type, revealed, isSpy);
            }
        }

        private void BuildBoard()
        {
            _root = new GameObject("CodenamesBoard").transform;
            _root.SetParent(transform, false);

            var felt = GameObject.CreatePrimitive(PrimitiveType.Cube);
            felt.name = "Felt";
            felt.transform.SetParent(_root, false);
            felt.transform.localScale = new Vector3(1.15f, 0.025f, 0.95f);
            felt.transform.localPosition = new Vector3(0f, 0f, 0f);
            felt.GetComponent<Renderer>().material = TableForgeMaterials.FeltCodenames;

            for (var r = 0; r < 5; r++)
            for (var c = 0; c < 5; c++)
            {
                var i = r * 5 + c;
                var card = GameObject.CreatePrimitive(PrimitiveType.Cube);
                card.name = $"Card_{i}";
                card.transform.SetParent(_root, false);
                card.transform.localScale = new Vector3(0.19f, 0.012f, 0.15f);
                card.transform.localPosition = new Vector3(-0.38f + c * 0.19f, 0.02f, -0.3f + r * 0.15f);
                var rend = card.GetComponent<Renderer>();
                rend.material = TableForgeMaterials.PaperCard;
                _cardRenderers.Add(rend);
            }

            var key = GameObject.CreatePrimitive(PrimitiveType.Cube);
            key.name = "SpymasterKey";
            key.transform.SetParent(_root, false);
            key.transform.localPosition = new Vector3(0.62f, 0.04f, 0.38f);
            key.transform.localScale = new Vector3(0.08f, 0.02f, 0.12f);
            key.GetComponent<Renderer>().material = TableForgeMaterials.Create(new Color(0.2f, 0.2f, 0.22f), 0.5f);
        }

        private static Color CardColor(string type, bool revealed, bool spymaster)
        {
            if (!revealed && !spymaster)
                return new Color(0.96f, 0.93f, 0.86f);
            return type switch
            {
                "red" => new Color(0.55f, 0.12f, 0.12f),
                "blue" => new Color(0.12f, 0.22f, 0.55f),
                "assassin" => new Color(0.08f, 0.08f, 0.1f),
                _ => new Color(0.45f, 0.42f, 0.38f),
            };
        }

        private static string ExtractCardType(string json, int index)
        {
            var needle = $"\"type\":\"";
            var searchFrom = 0;
            for (var n = 0; n <= index; n++)
            {
                var idx = json.IndexOf(needle, searchFrom, System.StringComparison.Ordinal);
                if (idx < 0) return "neutral";
                idx += needle.Length;
                var end = json.IndexOf('"', idx);
                if (n == index)
                    return json.Substring(idx, end - idx);
                searchFrom = end + 1;
            }
            return "neutral";
        }

        private static bool ExtractRevealed(string json, int index)
        {
            var needle = "\"revealed\":";
            var searchFrom = 0;
            for (var n = 0; n <= index; n++)
            {
                var idx = json.IndexOf(needle, searchFrom, System.StringComparison.Ordinal);
                if (idx < 0) return false;
                idx += needle.Length;
                if (n == index)
                    return idx < json.Length && json[idx] == 't';
                searchFrom = idx + 4;
            }
            return false;
        }
    }
}
