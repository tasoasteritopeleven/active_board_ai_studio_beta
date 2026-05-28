using System.Collections.Generic;
using UnityEngine;

namespace TableForge.Games
{
    /// <summary>Simplified world map on table — territories as elevated regions.</summary>
    public class RiskBoardBuilder : MonoBehaviour
    {
        private Transform _root;
        private readonly List<GameObject> _territories = new();

        private static readonly (string id, Vector3 pos, Vector3 scale)[] Regions =
        {
            ("na", new Vector3(-0.35f, 0.02f, 0.15f), new Vector3(0.28f, 0.02f, 0.22f)),
            ("sa", new Vector3(-0.3f, 0.02f, -0.2f), new Vector3(0.2f, 0.02f, 0.18f)),
            ("eu", new Vector3(0.05f, 0.02f, 0.22f), new Vector3(0.22f, 0.02f, 0.16f)),
            ("af", new Vector3(0.08f, 0.02f, -0.05f), new Vector3(0.2f, 0.02f, 0.22f)),
            ("as", new Vector3(0.38f, 0.02f, 0.12f), new Vector3(0.3f, 0.02f, 0.24f)),
            ("oc", new Vector3(0.42f, 0.02f, -0.22f), new Vector3(0.18f, 0.02f, 0.14f)),
        };

        private void Start() => BuildBoard();

        public void BuildBoard()
        {
            _root = new GameObject("RiskMap").transform;
            _root.SetParent(transform, false);

            var ocean = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ocean.name = "Ocean";
            ocean.transform.SetParent(_root, false);
            ocean.transform.localScale = new Vector3(1.2f, 0.015f, 0.8f);
            ocean.transform.localPosition = Vector3.zero;
            ocean.GetComponent<Renderer>().material = Mat(new Color(0.12f, 0.28f, 0.45f), 0.7f);

            foreach (var (id, pos, scale) in Regions)
            {
                var t = GameObject.CreatePrimitive(PrimitiveType.Cube);
                t.name = id;
                t.transform.SetParent(_root, false);
                t.transform.localPosition = pos;
                t.transform.localScale = scale;
                t.GetComponent<Renderer>().material = Mat(LandColor(id), 0.25f);
                _territories.Add(t);
            }
        }

        public void ApplyState(string json)
        {
            // Parse territory owners / army counts from JSON when wired
        }

        private static Color LandColor(string id) => id switch
        {
            "na" => new Color(0.55f, 0.65f, 0.4f),
            "sa" => new Color(0.45f, 0.6f, 0.35f),
            "eu" => new Color(0.5f, 0.55f, 0.45f),
            "af" => new Color(0.7f, 0.6f, 0.35f),
            "as" => new Color(0.6f, 0.5f, 0.4f),
            _ => new Color(0.5f, 0.7f, 0.55f),
        };

        private static Material Mat(Color c, float gloss)
        {
            var m = new Material(Shader.Find("Standard"));
            m.color = c;
            m.SetFloat("_Glossiness", gloss);
            return m;
        }
    }
}
