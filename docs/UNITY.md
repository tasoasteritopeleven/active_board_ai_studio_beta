# TableForge — Unity WebGL boards

Physical tabletop rendering for **Monopoly**, **Codenames**, and **Risk** runs in Unity 2022.3 LTS and embeds in the React app via `react-unity-webgl`.

## Project layout

| Path | Purpose |
|------|---------|
| `unity/TableForgeBoardGames/` | Unity project |
| `Assets/Scripts/Core/GameBoardDirector.cs` | Table, lighting, game switch |
| `Assets/Scripts/Bridge/TableForgeJsBridge.cs` | React ↔ Unity JSON |
| `Assets/Plugins/WebGL/TableForgePlugin.jslib` | `window.TableForgeUnityBridge` |
| `public/unity/TableForge/Build/` | WebGL output (CI or local) |

## React protocol

**React → Unity** (`SendMessage('TableForgeJsBridge', 'ReceiveFromReact', json)`):

```json
{"cmd":"init","game":"monopoly"}
{"cmd":"state","state":"{\"position\":5,\"playerColor\":\"#ef4444\"}"}
```

**Unity → React** (`window.TableForgeUnityBridge.onUnityMessage`):

```json
{"type":"ready","game":"monopoly"}
```

## Local build

1. Install [Unity 2022.3 LTS](https://unity.com/releases/editor/whats-new/2022.3.0)
2. Open `unity/TableForgeBoardGames`
3. Menu **TableForge → Create Main Scene** (once)
4. Menu **TableForge → Build WebGL (CI)**
5. Copy `unity/TableForgeBoardGames/Build/WebGL/*` → `public/unity/TableForge/Build/`

## CI

Workflow `.github/workflows/unity-webgl.yml` uses `game-ci/unity-builder`. Add repository secrets:

- `UNITY_LICENSE` (`.ulf` contents)
- `UNITY_EMAIL`
- `UNITY_PASSWORD`

Without secrets, the web app still works using the **React/CSS 3D fallback** boards.

## Web app integration

`UnityBoardCanvas` loads WebGL when `TableForge.loader.js` exists; otherwise it renders `fallback` (hyper-realistic React boards).
