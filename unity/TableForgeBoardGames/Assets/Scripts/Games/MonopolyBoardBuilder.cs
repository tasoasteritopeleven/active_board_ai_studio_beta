using System.Collections.Generic;
using TableForge.Core;

using UnityEngine;

namespace TableForge.Games
{
    /// <summary>40-space Monopoly board — wood rim, green center, colored property stripes.</summary>
    public class MonopolyBoardBuilder : MonoBehaviour
    {
        private readonly List<GameObject> _spaces = new();
        private readonly List<Renderer> _stripes = new();
        private GameObject _pawn;
        private Transform _boardRoot;

        private static readonly (int index, string stripeHex)[] Stripes =
        {
            (1, "#6B4423"), (3, "#6B4423"), (6, "#38BDF8"), (8, "#38BDF8"), (9, "#38BDF8"),
            (11, "#EC4899"), (13, "#EC4899"), (14, "#EC4899"), (16, "#F97316"), (18, "#F97316"),
            (19, "#F97316"), (21, "#EF4444"), (23, "#EF4444"), (24, "#EF4444"), (26, "#FACC15"),
            (27, "#FACC15"), (29, "#FACC15"), (31, "#22C55E"), (32, "#22C55E"), (34, "#22C55E"),
            (37, "#2563EB"), (39, "#2563EB"),
        };

        private void Start() => BuildBoard();

        public void ApplyState(string stateJson)
        {
            var pos = TableForgeJson.GetInt(stateJson, "position", 0);
            var hex = TableForgeJson.GetString(stateJson, "playerColor", "#EF4444");
            TableForgeJson.TryParseColor(hex, out var color);
            PlacePawn(pos, color);
        }

        private void BuildBoard()
        {
            _boardRoot = new GameObject("MonopolyBoard").transform;
            _boardRoot.SetParent(transform, false);

            var rim = GameObject.CreatePrimitive(PrimitiveType.Cube);
            rim.name = "WoodRim";
            rim.transform.SetParent(_boardRoot, false);
            rim.transform.localScale = new Vector3(11.5f, 0.12f, 11.5f);
            rim.transform.localPosition = new Vector3(0f, -0.04f, 0f);
            rim.GetComponent<Renderer>().material = TableForgeMaterials.WoodTable;

            const int count = 40;
            const float outer = 5.4f;
            const float inner = 3.6f;

            for (var i = 0; i < count; i++)
            {
                var side = i / 10;
                var onSide = i % 10;
                Vector3 pos;
                var rot = Quaternion.identity;
                var scale = i % 10 == 0
                    ? new Vector3(0.95f, 0.05f, 0.95f)
                    : new Vector3(0.58f, 0.045f, 0.4f);

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
                tile.name = $"Space_{i}";
                tile.transform.SetParent(_boardRoot, false);
                tile.transform.localPosition = pos;
                tile.transform.localRotation = rot;
                tile.transform.localScale = scale;

                var mat = TableForgeMaterials.PaperCard;
                if (i % 10 == 0)
                    mat = TableForgeMaterials.Create(new Color(0.98f, 0.94f, 0.82f), 0.5f);
                tile.GetComponent<Renderer>().material = mat;
                _spaces.Add(tile);

                foreach (var (idx, hex) in Stripes)
                {
                    if (idx != i) continue;
                    TableForgeJson.TryParseColor(hex, out var stripeColor);
                    var band = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    band.transform.SetParent(tile.transform, false);
                    band.transform.localPosition = new Vector3(0f, 0.55f, side % 2 == 0 ? 0.42f : -0.42f);
                    band.transform.localScale = new Vector3(0.92f, 0.15f, 0.22f);
                    var bandR = band.GetComponent<Renderer>();
                    bandR.material = TableForgeMaterials.Create(stripeColor, 0.55f);
                    _stripes.Add(bandR);
                    break;
                }
            }

            var center = GameObject.CreatePrimitive(PrimitiveType.Cube);
            center.transform.SetParent(_boardRoot, false);
            center.transform.localPosition = new Vector3(0f, 0.025f, 0f);
            center.transform.localScale = new Vector3(inner * 1.75f, 0.04f, inner * 1.75f);
            center.GetComponent<Renderer>().material = TableForgeMaterials.FeltGreen;

            _pawn = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            _pawn.name = "Pawn";
            _pawn.transform.SetParent(_boardRoot, false);
            _pawn.transform.localScale = new Vector3(0.18f, 0.12f, 0.18f);
            _pawn.GetComponent<Renderer>().material = TableForgeMaterials.Create(Color.red, 0.6f, 0.15f);

            TableForgeBoardLabels.CreateLabel("MONOPOLY", new Vector3(0f, 0.08f, 0f), 0.35f, new Color(0.98f, 0.92f, 0.75f), _boardRoot);
        }

        private void PlacePawn(int index, Color color)
        {
            if (_spaces.Count == 0 || _pawn == null) return;
            index = Mathf.Clamp(index, 0, _spaces.Count - 1);
            _pawn.transform.position = _spaces[index].transform.position + Vector3.up * 0.25f;
            _pawn.GetComponent<Renderer>().material.color = color;
        }
    }
}
