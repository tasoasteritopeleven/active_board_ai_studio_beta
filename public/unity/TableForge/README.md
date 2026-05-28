# TableForge Unity WebGL build

Place the Unity WebGL output here after building:

- `Build/TableForge.loader.js`
- `Build/TableForge.framework.js.br` (or `.js`)
- `Build/TableForge.data.br` (or `.data`)
- `Build/TableForge.wasm.br` (or `.wasm`)

**CI:** `.github/workflows/unity-webgl.yml` runs `game-ci/unity-builder` and copies artifacts into this folder.

**Local:** Open `unity/TableForgeBoardGames` in Unity 2022.3 LTS → **TableForge → Build WebGL (CI)**.

Until a build exists, the web app uses the React/CSS hyper-realistic board fallback.
