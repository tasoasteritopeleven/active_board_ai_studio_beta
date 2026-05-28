using System.Collections.Generic;
using UnityEngine;

namespace TableForge.Games
{
    /// <summary>5×5 word cards on felt — physical tabletop.</summary>
    public class CodenamesBoardBuilder : MonoBehaviour
    {
        private readonly List<GameObject> _cards = new();
        private Transform _root;

        private void Start() => BuildBoard();

        public void BuildBoard()
        {
            _root = new GameObject("CodenamesBoard").transform;
            _root.SetParent(transform, false);

            var felt = GameObject.CreatePrimitive(PrimitiveType.Cube);
            felt.name = "Felt";
            felt.transform.SetParent(_root, false);
            felt.transform.localScale = new Vector3(1.1f, 0.02f, 0.9f);
            felt.transform.localPosition = new Vector3(0, 0.01f, 0);
            felt.GetComponent<Renderer>().material = Mat(new Color(0.1f, 0.32f, 0.2f), 0.15f);

            for (var r = 0; r < 5; r++)
            for (var c = 0; c < 5; c++)
            {
                var card = GameObject.CreatePrimitive(PrimitiveType.Cube);
                card.name = $"Card_{r}_{c}";
                card.transform.SetParent(_root, false);
                card.transform.localScale = new Vector3(0.18f, 0.008f, 0.14f);
                card.transform.localPosition = new Vector3(-0.36f + c * 0.18f, 0.03f, -0.28f + r * 0.14f);
                card.GetComponent<Renderer>().material = Mat(new Color(0.96f, 0.94f, 0.88f), 0.4f);
                _cards.Add(card);
            }
        }

        public void ApplyState(string json)
        {
            if (string.IsNullOrEmpty(json) || _cards.Count < 25) return;
            // Optional: parse revealed colors from JSON and tint cards
        }

        private static Material Mat(Color c, float smooth)
        {
            var m = new Material(Shader.Find("Standard"));
            m.color = c;
            m.SetFloat("_Glossiness", smooth);
            return m;
        }
    }
}
