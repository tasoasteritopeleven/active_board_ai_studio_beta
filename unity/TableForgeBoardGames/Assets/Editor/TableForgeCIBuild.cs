#if UNITY_EDITOR
using System.IO;
using System.Linq;
using TableForge.Core;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TableForge.Editor
{
    public static class TableForgeCIBuild
    {
        const string ScenePath = "Assets/Scenes/Main.unity";
        const string BuildDir = "Build/WebGL";

        [MenuItem("TableForge/Create Main Scene")]
        public static void CreateMainScene()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(ScenePath)!);
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            var director = new GameObject("GameBoardDirector");
            director.AddComponent<GameBoardDirector>();
            var bridge = new GameObject("TableForgeJsBridge");
            bridge.AddComponent<Bridge.TableForgeJsBridge>();

            EditorSceneManager.SaveScene(scene, ScenePath);
            Debug.Log($"Saved {ScenePath}");
        }

        [MenuItem("TableForge/Build WebGL (CI)")]
        public static void BuildWebGLCI()
        {
            if (!File.Exists(ScenePath))
                CreateMainScene();

            var scenes = new[] { ScenePath };
            var outPath = Path.Combine(Directory.GetCurrentDirectory(), BuildDir);
            Directory.CreateDirectory(outPath);

            var opts = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = outPath,
                target = BuildTarget.WebGL,
                options = BuildOptions.None,
            };

            PlayerSettings.WebGL.template = "APPLICATION";
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.companyName = "TableForge";
            PlayerSettings.productName = "TableForge";

            var report = BuildPipeline.BuildPlayer(opts);
            if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
            {
                Debug.LogError("WebGL build failed");
                EditorApplication.Exit(1);
            }
            Debug.Log($"WebGL build OK → {outPath}");
        }

        public static void BuildWebGLFromCommandLine()
        {
            CreateMainScene();
            BuildWebGLCI();
            EditorApplication.Exit(0);
        }
    }
}
#endif
