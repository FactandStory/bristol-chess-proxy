// /api/og.js — Bristol Chess Hub OG image generation
// All assets embedded as base64 — no external fetches needed.
// Chess pieces: Lichess cburnett set (white pieces, MIT licensed).
// Satori rules: display:flex on every multi-child container.

const W = 1200
const H = 630
const LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNjEuMjQ0bW0iIGhlaWdodD0iMzYxLjI0NG1tIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2Y3ZjcwMzt9LmNscy0ye2ZpbGw6I2ZmZjt9LmNscy0ze2ZpbGw6I2Y1YjQwMjt9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMzc1LjY5OCw3MjYuNjA4Yy0xMC4xNjIsOC4wNzgtMTguNjU5LDE0Ljg1Mi0yMC45ODEsMjcuMTY2LTEuNzQ1LDkuMjU0LDIuNzE2LDE4LjQ1MywxMC40NjYsMjQuMjY5bDI4Mi4zMy0uMDI1YzkuNDQ2LTQuMTAxLDE0LjE4LTE2Ljc5OSwxMS40MDEtMjUuODI2LTEuMTQtMy43MDItMS45NzYtNy40MTQtNC41NTctMTAuNjE3LTExLjEyMy0xMy44MDUtMjYuOTExLTE5LjkwNS0zMy42NS0zNi4zODMtMS41ODktMy44ODUtLjk3NC05LjQ3OS0uMTcxLTEzLjc0Ny43MTMtMy43ODcsOC4wNzItMS41MjYsMTAuMDY4LTEwLjMwMywxLjAwMy00LjQwOS0uNTY4LTExLjI3My02Ljc2My0xMS4yNzJsLTIzNC41NDIuMDM5Yy0zLjgzMy45MDUtNi4xMzMsNS45OTUtNi40MTUsOC42NTMtLjc3Nyw3LjMzOSw5LjQwMSwxMC4yNTIsMTAuNTAyLDEzLjkwNiw0LjAyMiwxMy4zNTQtNi43NCwyNS40MzUtMTcuNjg4LDM0LjEzOVoiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0zNDYuMjY4LDgwMC41NjRjLTEuNzU4LDcuMTM5LDIuNjQ3LDE4LjMzNSwxMS45MzUsMTguMzM4bDI5Ni4xMS4xMThjOS4wMjcuMDA0LDEzLjk2Mi03LjM4MiwxMy44NzQtMTUuMDMxLS4wOTMtOC4wMDItNS42NzYtMTQuOTgtMTQuNDA1LTE0Ljk4aC0yOTQuMjcyYy03LjI5LDEuMjY2LTExLjQ4Niw0LjQyNS0xMy4yNDIsMTEuNTU1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTY1OC45MTQsNzUyLjE5MmMyLjc4LDkuMDI3LTEuOTU1LDIxLjcyNS0xMS40MDEsMjUuODI2bC0yODIuMzMuMDI1Yy03Ljc1LTUuODE2LTEyLjIxMS0xNS4wMTUtMTAuNDY2LTI0LjI2OSwyLjMyMi0xMi4zMTQsMTAuODE5LTE5LjA4NywyMC45ODEtMjcuMTY2LDEwLjk0OS04LjcwNCwyMS43MTEtMjAuNzg2LDE3LjY4OS0zNC4xMzktMS4xMDEtMy42NTUtMTEuMjgtNi41NjctMTAuNTAyLTEzLjkwNi4yODItMi42NTgsMi41ODItNy43NDgsNi40MTUtOC42NTNsMjM0LjU0Mi0uMDM5YzYuMTk1LS4wMDEsNy43NjYsNi44NjMsNi43NjMsMTEuMjcyLTEuOTk2LDguNzc3LTkuMzU1LDYuNTE2LTEwLjA2OCwxMC4zMDMtLjgwMyw0LjI2OC0xLjQxOCw5Ljg2Mi4xNzEsMTMuNzQ3LDYuNzM5LDE2LjQ3OCwyMi41MjcsMjIuNTc4LDMzLjY1LDM2LjM4MywyLjU4MSwzLjIwMywzLjQxNyw2LjkxNSw0LjU1NywxMC42MTdaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjU0LjMxMyw4MTkuMDJsLTI5Ni4xMS0uMTE4Yy05LjI4OC0uMDA0LTEzLjY5Mi0xMS4xOTktMTEuOTM1LTE4LjMzOCwxLjc1NS03LjEzLDUuOTUxLTEwLjI4OSwxMy4yNDItMTEuNTU0aDI5NC4yNzJjOC43MjksMCwxNC4zMTMsNi45NzgsMTQuNDA1LDE0Ljk3OS4wODksNy42NDktNC44NDcsMTUuMDM1LTEzLjg3NCwxNS4wMzFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTE5LjA2NywyNDAuMTUxYzkuNTQxLDkuNzQ4LDEwLjI5OCwyMS4yNTEsMTYuMjkyLDIyLjYyNiwxNi4zNjMsMy43NTQsMzIuMjc2LDEyLjg5Myw0NS43MzgsMjMuMTQzLDI3LjI0OSwyMC43NDksNDQuOTA2LDUwLjc1LDUwLjEyOCw4NC42NDhsMi42MjksMjIuNDA1LjA0NSwyNi4wOTVjLTMuMTQ0LDYwLjAwNC0zNS41NzcsMTA3LjI4OS03Mi4yMDgsMTUyLjU5My0uOTA4LDMuMzEyLDEuMzI5LDguMTMzLDIuMDg2LDExLjM4NGwzLjgwOCwxNi4zNTljLjMwMywxLjMwMS43NzQsMi43Ni4wNTEsMy43MjktMS4zMzIsMS43ODYtOS45OTYtMS45NzQtMTEuNjU4LDYuMzM0LS43NTIsMy43NTYsMy4yNyw1Ljk1NCw2LjQ2Miw3LjQzNiwyLjg3LDEyLjM3Mi0zLjIwNCwyNy45NDksNS42NzEsMzQuMjMzLTIuNjcxLjk1Ny01Ljc2NCwxLjkxOS05LjA0OSwyLjA5NWwtMTEuMTczLjU5OS02MS40NDktLjIwMy0yNi40NzMtLjIwMWMtOS44MTUtLjA3NS0xOS4xNTctLjI0NC0yOC45ODguMDEybC0xOS4xNjcuNDk5Yy0yLjE0OS4wNTYtNy4yOTMuNzE5LTguNzQ3LTEuOTEzLTEyLjQ3OS0yMi41ODEtMjAuMjM5LTQ0LjcxMS0xNi43MjMtNzAuODQsMS44NjItMTMuODM1LDEwLjAyNC0zMC45NzEsMTkuMTk1LTQxLjU4N2w5LjMwOC0xMC43NzUsMzUuODAyLTM3LjExNSw3LjExNy04Ljk2MWM1LjkxOC03LjQ1MiwxMC4yNjQtMTUuOTEzLDE0LjEwMi0yNC44ODkuNjc1LTEuNTc5LS45MzctNi4xNjcsMi4xMDQtNy4wMzgsMjEuNDU3LTYuMTM4LDMyLjQyMi0xNC4xMTQsNDYuODY1LTMxLjA5NiwzLjM5OC0zLjk5NSw0LjgyNS05LjgyOCw3LjI2OS0xNC41NzNsMi4zNTItOS42NTZjLjgxMy0zLjM0LDEuNjk3LTQuNDgxLDEuMDA3LTcuOTkxLS45MTctNC42NjgtLjU0Ni05LjUxMy0yLjExMy0xNS4yNjgtMy4xLDEwLjc0NS02LjkyOSwyMS42MDctMTMuNTkxLDMxLjM5Ny0zLjYyMSw1LjMyLTkuNjM3LDEyLjk3Ny0xMy45MjYsMTYuMzM2LTEyLjAwNyw5LjQwMi0yNy42MDMsMTguMDQ0LTQyLjc4LDE2Ljk2bC0xMy45MDItLjk5M2MtNS40NTQtLjM4OS04LjQzMS0uMzc5LTEyLjg2OCwyLjQ2N2wtMTguMjYsMTEuNzExYy00LjA1OCwyLjYwMi04Ljc3Nyw1LjQ4NS0xMC45MzMsOS44OTNsLTguMTYsMTYuNjgxYy0xLjU3MywzLjIxNS0zLjY5Nyw0LjI1OC02LjA5Niw2LjIzOC02Ljk1MSw1LjczOC0xNS4yMjcsNy44MjQtMjQuMiw1LjY2MS0zLjYzNS0uODc2LTguODg1LS4zMzEtMTEuMTUyLTQuMzk2bDIxLjI0NC0yMi4yOTNjMi4xMzEtMi4yMzcsMy4yMDgtNS44MzYsNC40NzQtOS4xNjUtNS4xNjctMS4xNzItNy44LDMuNzI1LTEwLjk4MSw2LjM1LTIuMzY0LDEuOTUtNS4wNzUsMi43NTMtNy4zMSw0Ljg2Mi01LjE3OCw0Ljg4Ni0xMS45NDksNy40OTktMTguMDE2LDEwLjkxNS0yLjk4NiwxLjY4MS00LjQ5NywxLjUyMi03LjY2My0uMTMyLTQuMjk3LTIuMjQ1LTExLjE2NC0zLjI1OC0xMy45NjEtNy44MDMtMy4zODItNS40OTQtMi42MTQtMTIuNzEtMy4yODQtMTguOTM2bC0yLjU2OC0yMy44NjNjLS43NTEtNi45NzMsNS4wNTgtMTAuODk3LDguODM3LTE1LjgzM2w2LjUwOC04LjVjNC45ODgtNi41MTUsMTAuNDAyLTExLjk0MywxNi4wMDUtMTguMDM1LDEuOTA3LTIuMDc0LDMuNjc2LTUuMTc3LDUuNDI0LTcuNDkxLDMuMzQ5LTQuNDMzLDcuMDUtOC4wOCwxMC40ODItMTIuNTI1bDYuNTc2LTguNTE2YzIuMjIxLTIuODc3LDQuMzgtNi4xMDksNi43MjktOS4yMjcsMy43MzMtNC45NTMsOC4zMTMtOS43MjUsOS41Ny0xNi4xMDZsMS43OTQtOS4xMDdjMS4wODktNS41MjcuNzQ1LTExLjQ2Miw0LjQ4OS0xNS44MTIsMTEuOTY0LTEzLjkwMSwzNC40MjctMjIuNjI4LDM1LjcyMy0yNS42NjIuMzc3LS44ODItLjc0Mi0xLjk1NS0uOS0yLjg2MWwtMS40ODgtOC41NTEtNS43MzYtMjAuNjY3Yy0uOTYtMy40NTgtMS4yMjEtNi41MTctMS45MjItMTAuMDU3cy0yLjgyNC03LjEyLTEuMjU3LTEwLjk5NmMyLjczNC0xLjQyNiw1LjQxOC44MzEsNy44OTEsMS4xNDksOC44MzEsMS4xMzQsMTYuMjE4LDUuMTYsMjMuMjc3LDEwLjA3OGw0Ljc0MiwzLjMwNGMzLjY0NCwyLjUzOCw3Ljc3MiwzLjk2NiwxMC45NTMsNy4yMSwyLjUyOCwyLjU3OSw1LjMzOCw0LjQ0Miw4LjkyMyw2LjQwN2wtLjQ3Ny0xMS4wOTljLTEuNDYzLTUuMTc2LTEuMzA0LTkuOTM0LTEuOTg4LTE1LjE4MS0uODk1LTYuODY2LTMuMjAyLTEzLjU4OS0uOTQ0LTIwLjgyOCwyMy41OTYsNS4yODIsMzUuNjI5LDE5LjgwMSw1MC40NDIsMzQuOTM1Wk00NTIuNjM3LDMzMC4wNThjNC43NzYtNC43MjUsMTIuMjM2LTMuNzI2LDE1LjkxNy04LjIxMy0yLjYzMi0uNjgzLTUuMDQyLTEuNjA5LTcuNTI3LTEuNTc1bC0yOS45MTUuNDA3Yy05LjgwNi4xMzMtMTcuNTY5LDkuMzA0LTIyLjEzMywxOC42ODNsOC43MDguNjI2YzQuNTE3LDIuNTYyLDguMjQxLDMuNzMyLDEyLjk4Nyw0LjQxMSwxMC40MjksMS40OTQsMTkuMTgxLTMuNjA2LDIxLjk2My0xNC4zMzhaTTM0NC4xODcsNDM2Ljg1OGM0Ljc5My0xLjAxNCw1LjYyNy00Ljc5OCw1LjkyOS04Ljg1My4zMTUtNC4yMzEtLjg3NC03LjkyMi01LjYzMS04LjU3MS04Ljk5OC0xLjIyOS0xNi4yNiw3Ljk3NS0xMy45NzYsOS41OCwyLjExOSwxLjQ4OSwxMC4wODgtMS44MzQsMTMuNjc3LDcuODQ0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTM0NC4xODcsNDM2Ljg1OGMtMy41OS05LjY3Ny0xMS41NTktNi4zNTUtMTMuNjc3LTcuODQ0LTIuMjg1LTEuNjA2LDQuOTc4LTEwLjgwOSwxMy45NzYtOS41OCIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTU2OC4xMSw2NTEuMTM2Yy04Ljg3NS02LjI4NC0yLjgwMS0yMS44NjEtNS42NzEtMzQuMjMzLTMuMTkyLTEuNDgyLTcuMjE0LTMuNjc5LTYuNDYyLTcuNDM2LDEuNjYyLTguMzA4LDEwLjMyNi00LjU0OCwxMS42NTgtNi4zMzQuNzIzLS45Ny4yNTItMi40MjgtLjA1MS0zLjcyOWwtMy44MDgtMTYuMzU5Yy0uNzU3LTMuMjUyLTIuOTkzLTguMDczLTIuMDg2LTExLjM4NCwzNi42MzEtNDUuMzA0LDY5LjA2NC05Mi41ODksNzIuMjA4LTE1Mi41OTNsLS4wNDUtMjYuMDk1LTIuNjI5LTIyLjQwNWMtNS4yMjItMzMuODk4LTIyLjg3OC02My44OTktNTAuMTI4LTg0LjY0OC0xMy40NjEtMTAuMjUtMjkuMzc1LTE5LjM4OS00NS43MzgtMjMuMTQzLTUuOTkzLTEuMzc1LTYuNzUtMTIuODc4LTE2LjI5Mi0yMi42MjYtMS4zMzYtMS45MjIsNS4yNjUtNC4wMTgsNi45MjgtMy44MzYsNS43NjcuNjMsMTkuNzM0LTQuNDgsMzYuOTctMS44MzNsMTUuNTU5LDIuMzg5YzIxLjQyLDMuMjksNTcuMzQzLDE4LjcwMiw3MS4xNDIsMzIuNDMxbDI1LjYwOSwyNS40ODFjMS45NDcsMS45MzcsMy43NDUsNS4xOTYsNS4yMjUsNy41OTlsOS44NiwxNi4wMTJjNi42MTEsMTIuOTIzLDEyLjQwOCwyNS42NTgsMTUuMDU0LDQwLjAzNmwxLjk4NywxMC43OTQsMi4xODEsMTcuMDEyYy41NTQsNC4zMjQuNTY1LDEwLjA4NS0uMTgyLDE0LjMyNS0xLjA2Niw2LjA1NC0uNjU2LDExLjQ4Ni0yLjAxNCwxNy4zODFsLTIuMDE3LDguNzUyYy00LjM4MiwxOS4wMTktMTIuMDcyLDM2LjU4LTIzLjE2Myw1Mi41MTFsLTEzLjEyNCwxOC44NTFjLTEuNzMsMi40ODUtMy4yNyw0LjM5LTUuMTQ4LDYuOTYzbC01LjQyOCw3LjQzNy0xNC42OTIsMjEuNDQ2Yy04LjcxLDEyLjcxMy0xNi4yLDI1LjkzNS0yMC4yMjEsNDEuMDM1LS45MjMsMy40NjQtMS4zMDMsNi40NS0yLjI0NCw5LjgwOGwtMi4wMTEsNy4xNzJjLS45MDcsMy4yMzYtMy4zNTMsOC44NDQtLjM4MSwxMS45MzYsMi4zMjYuMjMsNi40NzYtLjY5NSw4LjM5NSwyLjA5MSwxLjI3LDEuODQ0LDEuOTMsNC4wNzguNDYxLDcuMjU0LS43ODUsMS42OTctMy40NjUsMi42ODgtNS43MTgsMy45MzZsLS43MDYsMjcuMjA5Yy0uMTMsNS4wMS00LjU5Miw5LjI0OC05LjY0Nyw5LjI4MWwtMzguNjMuMjQ4Yy0xLjczOS0uMjIzLTMuODY3LTEuOTI1LTUuMDA0LTIuNzNaTTYwNi42MjYsNjAzLjU1N2w3LjExLTI5LjMwNi00Mi4yMDYuMDE5LDYuODM5LDI5LjcwMiwyOC4yNTctLjQxNloiLz48L3N2Zz4="

const PIECE = {
    queen: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik04IDEyYTIgMiAwIDEgMS00IDAgMiAyIDAgMSAxIDQgMG0xNi41LTQuNWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDBNNDEgMTJhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAwTTE2IDguNWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDBNMzMgOWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDAiLz48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgZD0iTTkgMjZjOC41LTEuNSAyMS0xLjUgMjcgMGwyLTEyLTcgMTFWMTFsLTUuNSAxMy41LTMtMTUtMyAxNS01LjUtMTRWMjVMNyAxNHoiLz48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgZD0iTTkgMjZjMCAyIDEuNSAyIDIuNSA0IDEgMS41IDEgMSAuNSAzLjUtMS41IDEtMS41IDIuNS0xLjUgMi41LTEuNSAxLjUuNSAyLjUuNSAyLjUgNi41IDEgMTYuNSAxIDIzIDAgMCAwIDEuNS0xIDAtMi41IDAgMCAuNS0xLjUtMS0yLjUtLjUtMi41LS41LTIgLjUtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6Ii8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTExLjUgMzBjMy41LTEgMTguNS0xIDIyIDBNMTIgMzMuNWM2LTEgMTUtMSAyMSAwIi8+PC9nPjwvc3ZnPg==",
    king: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0yMi41IDExLjYzVjZNMjAgOGg1Ii8+PHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0yMi41IDI1czQuNS03LjUgMy0xMC41YzAgMC0xLTIuNS0zLTIuNXMtMyAyLjUtMyAyLjVjLTEuNSAzIDMgMTAuNSAzIDEwLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTMuNS03LjUtMTMtMTAuNS0xNi00LTMgNiA1IDEwIDUgMTB6Ii8+PHBhdGggZD0iTTExLjUgMzBjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwIi8+PC9nPjwvc3ZnPg==",
    rook: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJidXR0IiBkPSJNOSAzOWgyN3YtM0g5em0zLTN2LTRoMjF2NHptLTEtMjJWOWg0djJoNVY5aDV2Mmg1VjloNHY1Ii8+PHBhdGggZD0ibTM0IDE0LTMgM0gxNGwtMy0zIi8+PHBhdGggc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0zMSAxN3YxMi41SDE0VjE3Ii8+PHBhdGggZD0ibTMxIDI5LjUgMS41IDIuNWgtMjBsMS41LTIuNSIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0xMSAxNGgyMyIvPjwvZz48L3N2Zz4=",
    knight: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDBtNS40MzMtOS43NWEuNSAxLjUgMzAgMSAxLS44NjYtLjUuNSAxLjUgMzAgMSAxIC44NjYuNSIvPjwvZz48L3N2Zz4=",
    pawn: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNMjIuNSA5Yy0yLjIxIDAtNCAxLjc5LTQgNCAwIC44OS4yOSAxLjcxLjc4IDIuMzhDMTcuMzMgMTYuNSAxNiAxOC41OSAxNiAyMWMwIDIuMDMuOTQgMy44NCAyLjQxIDUuMDMtMyAxLjA2LTcuNDEgNS41NS03LjQxIDEzLjQ3aDIzYzAtNy45Mi00LjQxLTEyLjQxLTcuNDEtMTMuNDcgMS40Ny0xLjE5IDIuNDEtMyAyLjQxLTUuMDMgMC0yLjQxLTEuMzMtNC41LTMuMjgtNS42Mi40OS0uNjcuNzgtMS40OS43OC0yLjM4IDAtMi4yMS0xLjc5LTQtNC00eiIvPjwvc3ZnPg==",
    bishop: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxnIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzUuNDktMi4zMi40Ny0zLS41IDEuMzUtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1Ii8+PC9nPjwvc3ZnPg==",
}

const COLORS = {
    white: "#FFFFFF",
    offWhite: "rgba(255,255,255,0.75)",
    muted: "rgba(255,255,255,0.45)",
    purple: "#5A237A",
    green: "#1E7A4A",
    blue: "#1F6FA3",
    teal: "#1A3D3D",
}

function txt(style, text) {
    return { type: "div", props: { style: { display: "flex", ...style }, children: String(text) } }
}
function box(style, children) {
    return { type: "div", props: { style: { display: "flex", ...style }, children } }
}
function img(src, style) {
    return { type: "img", props: { src, style } }
}

// Piece watermark — 1 to 3 pieces, right side, low opacity
function pieceWatermark(pieceKeys) {
    const count = pieceKeys.length
    const size = count === 1 ? 360 : count === 2 ? 260 : 200
    const topOffset = count === 1 ? 100 : count === 2 ? 60 : 30
    return box({
        position: "absolute",
        right: 48, top: topOffset,
        flexDirection: "column",
        alignItems: "flex-end",
        gap: count > 1 ? 8 : 0,
        opacity: 0.08,
    }, pieceKeys.map(k => img(PIECE[k], { width: size, height: size })))
}

function displayName(name) {
    if (!name) return "Bristol Player"
    if (name.includes(",")) {
        const parts = name.split(",").map(s => s.trim())
        return (parts[1] + " " + parts[0]).trim()
    }
    return name
}

function bar(fillPct, h) {
    const w = Math.max(0, Math.min(100, fillPct))
    return box({ width: 680, height: h || 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 5 }, [
        box({ width: Math.round(w * 6.8), height: h || 10, backgroundColor: COLORS.white, borderRadius: 5 }, []),
    ])
}

function cardShell(bgColor, pieceKeys, children) {
    return box({
        width: W, height: H,
        backgroundColor: bgColor,
        flexDirection: "column",
        padding: "52px 72px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
    }, [
        box({ justifyContent: "space-between", alignItems: "center", marginBottom: 36 }, [
            box({ alignItems: "center", gap: 12 }, [
                img(LOGO, { width: 34, height: 34 }),
                txt({ fontSize: 16, fontWeight: 700, color: COLORS.offWhite, letterSpacing: 2 }, "BRISTOL CHESS"),
            ]),
            txt({ fontSize: 12, color: COLORS.muted, letterSpacing: 2 }, "YOUR CHESS YEAR"),
        ]),
        pieceWatermark(pieceKeys),
        ...children,
    ])
}

function whereYouStandCard({ name, percentile, rank, total, domainLabel }) {
    return cardShell(COLORS.purple, ["queen"], [
        txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 4, marginBottom: 8 }, "WHERE YOU STAND"),
        txt({ fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 24 }, displayName(name)),
        txt({ fontSize: 108, fontWeight: 700, color: COLORS.white, fontFamily: "monospace", letterSpacing: -2, lineHeight: 1, marginBottom: 8 }, percentile + "%"),
        txt({ fontSize: 18, color: COLORS.offWhite, marginBottom: 36 }, "of rated Bristol & Districts players (" + domainLabel + ")"),
        bar(parseFloat(percentile), 10),
        txt({ fontSize: 15, color: COLORS.muted, marginTop: 14 }, "Ranked #" + rank + " of " + total + " rated players"),
    ])
}

function ratingJourneyCard({ name, currentRating, yearAgoRating, change, domainLabel }) {
    const up = change >= 0
    const changeColor = up ? "#6FE0A0" : "#FF9B8E"
    const arrow = up ? "+" : "-"
    return cardShell(COLORS.green, ["pawn", "queen"], [
        txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 4, marginBottom: 8 }, "RATING JOURNEY"),
        txt({ fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 24 }, displayName(name)),
        txt({ fontSize: 108, fontWeight: 700, color: COLORS.white, fontFamily: "monospace", letterSpacing: -2, lineHeight: 1, marginBottom: 8 }, String(currentRating)),
        txt({ fontSize: 18, color: COLORS.offWhite, marginBottom: 20 }, domainLabel + " rating · Bristol & Districts"),
        box({ alignItems: "center", gap: 16 }, [
            txt({ fontSize: 28, fontWeight: 700, color: changeColor }, arrow + Math.abs(change) + " this season"),
            txt({ fontSize: 16, color: COLORS.muted }, "from " + yearAgoRating + " a year ago"),
        ]),
    ])
}

function seasonScoreboardCard({ name, played, wins, draws, losses, scorePct }) {
    return cardShell(COLORS.blue, ["rook"], [
        txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 4, marginBottom: 8 }, "SEASON SCOREBOARD"),
        txt({ fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 28 }, displayName(name)),
        box({ gap: 56, alignItems: "flex-end", marginBottom: 32 }, [
            box({ flexDirection: "column", gap: 6 }, [
                txt({ fontSize: 80, fontWeight: 700, color: "#6FE0A0", fontFamily: "monospace", lineHeight: 1 }, String(wins)),
                txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 3 }, "WINS"),
            ]),
            box({ flexDirection: "column", gap: 6 }, [
                txt({ fontSize: 80, fontWeight: 700, color: COLORS.offWhite, fontFamily: "monospace", lineHeight: 1 }, String(draws)),
                txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 3 }, "DRAWS"),
            ]),
            box({ flexDirection: "column", gap: 6 }, [
                txt({ fontSize: 80, fontWeight: 700, color: "#FF9B8E", fontFamily: "monospace", lineHeight: 1 }, String(losses)),
                txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 3 }, "LOSSES"),
            ]),
        ]),
        txt({ fontSize: 16, color: COLORS.muted }, played + " league games · " + scorePct + "% score rate"),
    ])
}

function inGoodCompanyCard({ name, drawRate, gmName, gmDrawRate }) {
    const diff = Math.abs(drawRate - gmDrawRate)
    const caption = drawRate < gmDrawRate
        ? "More decisive than " + gmName + " — drew " + diff + "pp fewer games this season."
        : diff === 0
        ? "Exactly matching " + gmName + "'s career draw rate."
        : diff + "pp above " + gmName + "'s career average of " + gmDrawRate + "%."
    return cardShell(COLORS.teal, ["knight", "queen", "king"], [
        txt({ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 4, marginBottom: 8 }, "IN GOOD COMPANY"),
        txt({ fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 24 }, displayName(name)),
        box({ alignItems: "flex-end", gap: 40, marginBottom: 24 }, [
            box({ flexDirection: "column", gap: 6 }, [
                txt({ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 3 }, "YOUR DRAW RATE"),
                txt({ fontSize: 88, fontWeight: 700, color: COLORS.white, fontFamily: "monospace", lineHeight: 1 }, drawRate + "%"),
            ]),
            txt({ fontSize: 18, color: COLORS.muted, marginBottom: 14 }, "vs"),
            box({ flexDirection: "column", gap: 6 }, [
                txt({ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 3 }, gmName.toUpperCase() + " · CAREER"),
                txt({ fontSize: 88, fontWeight: 700, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", lineHeight: 1 }, gmDrawRate + "%"),
            ]),
        ]),
        txt({ fontSize: 16, color: COLORS.muted }, caption),
    ])
}

module.exports = async function handler(req, res) {
    const { ImageResponse } = await import("@vercel/og")
    const url = new URL(req.url, "https://" + req.headers.host)
    const p = url.searchParams
    const moduleName = p.get("module") || "where_you_stand"

    res.setHeader("Access-Control-Allow-Origin", "*")
    if (req.method === "OPTIONS") { res.status(200).end(); return }

    try {
        let element

        if (moduleName === "where_you_stand") {
            let percentile = p.get("percentile"), rank = p.get("rank"), total = p.get("total")
            let name = p.get("name") || "Bristol Player"
            const domain = p.get("domain") || "std"
            const domainLabel = domain === "rpd" ? "Rapid" : domain === "btz" ? "Blitz" : "Standard"
            if (!percentile) {
                const ecf = p.get("ecf_code")
                if (!ecf) { res.status(400).send("Missing params"); return }
                const d = await fetch("https://bristol-chess-proxy.vercel.app/api/ecf?action=player_percentile&ecf_code=" + encodeURIComponent(ecf) + "&domain=" + domain).then(r => r.json())
                if (d.error) { res.status(404).send(d.error); return }
                percentile = String(d.percentile); rank = String(d.rank); total = String(d.total_players)
            }
            element = whereYouStandCard({ name, percentile, rank, total, domainLabel })

        } else if (moduleName === "rating_journey") {
            element = ratingJourneyCard({
                name: p.get("name") || "Bristol Player",
                currentRating: parseInt(p.get("rating") || "1500"),
                yearAgoRating: parseInt(p.get("year_ago") || "1500"),
                change: parseInt(p.get("rating") || "1500") - parseInt(p.get("year_ago") || "1500"),
                domainLabel: p.get("domain") === "rpd" ? "Rapid" : p.get("domain") === "btz" ? "Blitz" : "Standard",
            })

        } else if (moduleName === "season_scoreboard") {
            element = seasonScoreboardCard({
                name: p.get("name") || "Bristol Player",
                played: parseInt(p.get("played") || "0"),
                wins: parseInt(p.get("wins") || "0"),
                draws: parseInt(p.get("draws") || "0"),
                losses: parseInt(p.get("losses") || "0"),
                scorePct: p.get("score_pct") || "0",
            })

        } else if (moduleName === "in_good_company") {
            element = inGoodCompanyCard({
                name: p.get("name") || "Bristol Player",
                drawRate: parseInt(p.get("draw_rate") || "0"),
                gmName: p.get("gm_name") || "Bobby Fischer",
                gmDrawRate: parseInt(p.get("gm_draw_rate") || "29"),
            })

        } else {
            res.status(400).send("Unknown module: " + moduleName); return
        }

        const imageResponse = new ImageResponse(element, { width: W, height: H })
        const buffer = Buffer.from(await imageResponse.arrayBuffer())
        res.setHeader("Content-Type", "image/png")
        res.setHeader("Content-Length", buffer.length)
        res.setHeader("Cache-Control", "public, max-age=3600")
        res.status(200).end(buffer)

    } catch (err) {
        console.error("OG error:", err)
        res.status(500).send("OG error: " + err.message)
    }
}
