using System.Globalization;
using UnityEngine;

namespace TableForge.Core
{
    /// <summary>Minimal JSON field extraction for WebGL bridge payloads (no external deps).</summary>
    public static class TableForgeJson
    {
        public static string GetString(string json, string key, string fallback = "")
        {
            var needle = "\"" + key + "\":\"";
            var idx = json.IndexOf(needle, System.StringComparison.Ordinal);
            if (idx < 0) return fallback;
            idx += needle.Length;
            var end = json.IndexOf('"', idx);
            return end < 0 ? fallback : json.Substring(idx, end - idx);
        }

        public static int GetInt(string json, string key, int fallback = 0)
        {
            var needle = "\"" + key + "\":";
            var idx = json.IndexOf(needle, System.StringComparison.Ordinal);
            if (idx < 0) return fallback;
            idx += needle.Length;
            var end = idx;
            while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '-')) end++;
            return int.TryParse(json.Substring(idx, end - idx), NumberStyles.Integer, CultureInfo.InvariantCulture, out var v)
                ? v
                : fallback;
        }

        public static bool TryParseColor(string hex, out Color color)
        {
            if (string.IsNullOrEmpty(hex))
            {
                color = Color.white;
                return false;
            }
            if (!hex.StartsWith("#")) hex = "#" + hex;
            return ColorUtility.TryParseHtmlString(hex, out color);
        }
    }
}
