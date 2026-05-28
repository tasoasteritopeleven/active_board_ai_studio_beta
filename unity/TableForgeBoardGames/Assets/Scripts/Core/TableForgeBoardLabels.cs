using UnityEngine;

namespace TableForge.Core
{
    /// <summary>Procedural 3D text via stacked cubes (WebGL-safe, no TMP required).</summary>
    public static class TableForgeBoardLabels
    {
        public static GameObject CreateLabel(string text, Vector3 localPos, float size, Color color, Transform parent)
        {
            var root = new GameObject($"Label_{text}");
            root.transform.SetParent(parent, false);
            root.transform.localPosition = localPos;
            root.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);

            var mat = TableForgeMaterials.Create(color, 0.2f);
            var step = size * 0.12f;
            var x = -(text.Length * step) / 2f;

            foreach (var ch in text.ToUpper())
            {
                if (ch == ' ') { x += step; continue; }
                var glyph = GameObject.CreatePrimitive(PrimitiveType.Cube);
                glyph.transform.SetParent(root.transform, false);
                glyph.transform.localPosition = new Vector3(x, 0f, 0f);
                glyph.transform.localScale = new Vector3(step * 0.85f, 0.02f, step * 1.1f);
                glyph.GetComponent<Renderer>().material = mat;
                x += step;
            }

            return root;
        }
    }
}
