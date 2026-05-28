using System.Collections.Generic;
using TableForge.Bridge;
using UnityEngine;

namespace TableForge.Games
{
    /// <summary>
    /// Procedural Monopoly board — 40 spaces, paper tiles on green felt.
    /// </summary>
    public class MonopolyBoardBuilder : MonoBehaviour
    {
        private readonly List<GameObject> _spaces = new();
        private GameObject _pawn;

        private void Start()
        {
            BuildBoard();
        }

        public void ApplyState(string stateJson)
        {
            var pos = ParseInt(stateJson, "position", 0);
            var color = ParseColor(stateJson, "playerColor", Color.red);
            PlacePawn(pos, color);
        }

        private void BuildBoard()
        {
            var root = new GameObject("MonopolyBoard");
            root.transform.SetParent(transform, false);
            root.transform.localPosition = Vector3.zero;

            const int count = 40;
            const float outer = 5.2f;
            const float inner = 3.4f;

            for (var i = 0; i < count; i++)
            {
                var t = i / (float)count * Mathf.PI * 2f;
                var onSide = i % 10;
                var side = i / 10;
                Vector3 pos;
                var rot = Quaternion.identity;
                var scale = new Vector3(0.55f, 0.04f, 0.38f);

                if (side == 0)
                    pos = new Vector3(Mathf.Lerp(-inner, inner, onSide / 9f), 0.02f, -outer);
                else if (side == 1)
                    pos = new Vector3(outer, 0.02f, Mathf.Lerp(-inner, inner, onSide / 9f));
                else if (side == 2)
                    pos = new Vector3(Mathf.Lerp(inner, -inner, onSide / 9f), 0.02f, outer);
                else
                {
                    pos = new Vector3(-outer, 0.02f, Mathf.Lerp(inner, -inner, onSide / 9f));
                    rot = Quaternion.Euler(0f, 90f, 0f);
                }

                var tile = GameObject.CreatePrimitive(PrimitiveType.Cube);
                tile.transform.SetParent(root.transform);
                tile.transform.localPosition = pos;
                tile.transform.localRotation = rot;
                tile.transform.localScale = scale;

                var mat = new Material(Shader.Find("Standard"));
                mat.color = i % 10 == 0 ? new Color(0.96f, 0.9f, 0.78f) : new Color(0.93f, 0.86f, 0.72f);
                tile.GetComponent<Renderer>().material = mat;
                _spaces.Add(tile);
            }

            var center = GameObject.CreatePrimitive(PrimitiveType.Cube);
            center.transform.SetParent(root.transform);
            center.transform.localPosition = new Vector3(0f, 0.03f, 0f);
            center.transform.localScale = new Vector3(inner * 1.85f, 0.05f, inner * 1.85f);
            var centerMat = new Material(Shader.Find("Standard"));
            centerMat.color = new Color(0.08f, 0.42f, 0.24f);
            center.GetComponent<Renderer>().material = centerMat;

            _pawn = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            _pawn.transform.SetParent(root.transform);
            _pawn.transform.localScale = Vector3.one * 0.22f;
            var pawnMat = new Material(Shader.Find("Standard"));
            pawnMat.color = Color.red;
            _pawn.GetComponent<Renderer>().material = pawnMat;
        }

        private void PlacePawn(int index, Color color)
        {
            if (_spaces.Count == 0 || _pawn == null) return;
            index = Mathf.Clamp(index, 0, _spaces.Count - 1);
            _pawn.transform.position = _spaces[index].transform.position + Vector3.up * 0.2f;
            _pawn.GetComponent<Renderer>().material.color = color;
        }

        private static int ParseInt(string json, string key, int fallback)
        {
            var needle = "\"" + key + "\":";
            var idx = json.IndexOf(needle, System.StringComparison.Ordinal);
            if (idx < 0) return fallback;
            idx += needle.Length;
            var end = idx;
            while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '-')) end++;
            return int.TryParse(json.Substring(idx, end - idx), out var v) ? v : fallback;
        }

        private static Color ParseColor(string json, string key, Color fallback)
        {
            var hex = "";
            var needle = "\"" + key + "\":\"";
            var idx = json.IndexOf(needle, System.StringComparison.Ordinal);
            if (idx >= 0)
            {
                idx += needle.Length;
                var end = json.IndexOf('"', idx);
                if (end > idx) hex = json.Substring(idx, end - idx);
            }
            return ColorUtility.TryParseHtmlString(hex, out var c) ? c : fallback;
        }
    }
}
