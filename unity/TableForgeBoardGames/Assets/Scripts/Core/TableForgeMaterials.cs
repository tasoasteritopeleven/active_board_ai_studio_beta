using UnityEngine;

namespace TableForge.Core
{
    /// <summary>Shared PBR-style materials for procedural board pieces (WebGL Standard shader).</summary>
    public static class TableForgeMaterials
    {
        public static Material Create(Color albedo, float gloss = 0.35f, float metallic = 0f)
        {
            var shader = Shader.Find("Standard");
            var m = new Material(shader);
            m.color = albedo;
            m.SetFloat("_Glossiness", gloss);
            m.SetFloat("_Metallic", metallic);
            return m;
        }

        public static Material WoodTable => Create(new Color(0.28f, 0.17f, 0.09f), 0.25f);
        public static Material FeltGreen => Create(new Color(0.06f, 0.38f, 0.22f), 0.12f);
        public static Material FeltCodenames => Create(new Color(0.08f, 0.32f, 0.2f), 0.12f);
        public static Material PaperCard => Create(new Color(0.96f, 0.93f, 0.86f), 0.45f);
        public static Material Ocean => Create(new Color(0.1f, 0.26f, 0.42f), 0.75f, 0.1f);
    }
}
