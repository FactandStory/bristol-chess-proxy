// /api/og.js — Bristol Chess Hub OG image generation
// All assets embedded as base64 — no external fetches needed.
// Chess pieces: Lichess cburnett set (white pieces, MIT licensed).
// Satori rules: display:flex on every multi-child container.

const W = 1200
const H = 630
const LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNjEuMjQ0bW0iIGhlaWdodD0iMzYxLjI0NG1tIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2Y3ZjcwMzt9LmNscy0ye2ZpbGw6I2ZmZjt9LmNscy0ze2ZpbGw6I2Y1YjQwMjt9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMzc1LjY5OCw3MjYuNjA4Yy0xMC4xNjIsOC4wNzgtMTguNjU5LDE0Ljg1Mi0yMC45ODEsMjcuMTY2LTEuNzQ1LDkuMjU0LDIuNzE2LDE4LjQ1MywxMC40NjYsMjQuMjY5bDI4Mi4zMy0uMDI1YzkuNDQ2LTQuMTAxLDE0LjE4LTE2Ljc5OSwxMS40MDEtMjUuODI2LTEuMTQtMy43MDItMS45NzYtNy40MTQtNC41NTctMTAuNjE3LTExLjEyMy0xMy44MDUtMjYuOTExLTE5LjkwNS0zMy42NS0zNi4zODMtMS41ODktMy44ODUtLjk3NC05LjQ3OS0uMTcxLTEzLjc0Ny43MTMtMy43ODcsOC4wNzItMS41MjYsMTAuMDY4LTEwLjMwMywxLjAwMy00LjQwOS0uNTY4LTExLjI3My02Ljc2My0xMS4yNzJsLTIzNC41NDIuMDM5Yy0zLjgzMy45MDUtNi4xMzMsNS45OTUtNi40MTUsOC42NTMtLjc3Nyw3LjMzOSw5LjQwMSwxMC4yNTIsMTAuNTAyLDEzLjkwNiw0LjAyMiwxMy4zNTQtNi43NCwyNS40MzUtMTcuNjg4LDM0LjEzOVoiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0zNDYuMjY4LDgwMC41NjRjLTEuNzU4LDcuMTM5LDIuNjQ3LDE4LjMzNSwxMS45MzUsMTguMzM4bDI5Ni4xMS4xMThjOS4wMjcuMDA0LDEzLjk2Mi03LjM4MiwxMy44NzQtMTUuMDMxLS4wOTMtOC4wMDItNS42NzYtMTQuOTgtMTQuNDA1LTE0Ljk4aC0yOTQuMjcyYy03LjI5LDEuMjY2LTExLjQ4Niw0LjQyNS0xMy4yNDIsMTEuNTU1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTY1OC45MTQsNzUyLjE5MmMyLjc4LDkuMDI3LTEuOTU1LDIxLjcyNS0xMS40MDEsMjUuODI2bC0yODIuMzMuMDI1Yy03Ljc1LTUuODE2LTEyLjIxMS0xNS4wMTUtMTAuNDY2LTI0LjI2OSwyLjMyMi0xMi4zMTQsMTAuODE5LTE5LjA4NywyMC45ODEtMjcuMTY2LDEwLjk0OS04LjcwNCwyMS43MTEtMjAuNzg2LDE3LjY4OS0zNC4xMzktMS4xMDEtMy42NTUtMTEuMjgtNi41NjctMTAuNTAyLTEzLjkwNi4yODItMi42NTgsMi41ODItNy43NDgsNi40MTUtOC42NTNsMjM0LjU0Mi0uMDM5YzYuMTk1LS4wMDEsNy43NjYsNi44NjMsNi43NjMsMTEuMjcyLTEuOTk2LDguNzc3LTkuMzU1LDYuNTE2LTEwLjA2OCwxMC4zMDMtLjgwMyw0LjI2OC0xLjQxOCw5Ljg2Mi4xNzEsMTMuNzQ3LDYuNzM5LDE2LjQ3OCwyMi41MjcsMjIuNTc4LDMzLjY1LDM2LjM4MywyLjU4MSwzLjIwMywzLjQxNyw2LjkxNSw0LjU1NywxMC42MTdaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjU0LjMxMyw4MTkuMDJsLTI5Ni4xMS0uMTE4Yy05LjI4OC0uMDA0LTEzLjY5Mi0xMS4xOTktMTEuOTM1LTE4LjMzOCwxLjc1NS03LjEzLDUuOTUxLTEwLjI4OSwxMy4yNDItMTEuNTU0aDI5NC4yNzJjOC43MjksMCwxNC4zMTMsNi45NzgsMTQuNDA1LDE0Ljk3OS4wODksNy42NDktNC44NDcsMTUuMDM1LTEzLjg3NCwxNS4wMzFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTE5LjA2NywyNDAuMTUxYzkuNTQxLDkuNzQ4LDEwLjI5OCwyMS4yNTEsMTYuMjkyLDIyLjYyNiwxNi4zNjMsMy43NTQsMzIuMjc2LDEyLjg5Myw0NS43MzgsMjMuMTQzLDI3LjI0OSwyMC43NDksNDQuOTA2LDUwLjc1LDUwLjEyOCw4NC42NDhsMi42MjksMjIuNDA1LjA0NSwyNi4wOTVjLTMuMTQ0LDYwLjAwNC0zNS41NzcsMTA3LjI4OS03Mi4yMDgsMTUyLjU5My0uOTA4LDMuMzEyLDEuMzI5LDguMTMzLDIuMDg2LDExLjM4NGwzLjgwOCwxNi4zNTljLjMwMywxLjMwMS43NzQsMi43Ni4wNTEsMy43MjktMS4zMzIsMS43ODYtOS45OTYtMS45NzQtMTEuNjU4LDYuMzM0LS43NTIsMy43NTYsMy4yNyw1Ljk1NCw2LjQ2Miw3LjQzNiwyLjg3LDEyLjM3Mi0zLjIwNCwyNy45NDksNS42NzEsMzQuMjMzLTIuNjcxLjk1Ny01Ljc2NCwxLjkxOS05LjA0OSwyLjA5NWwtMTEuMTczLjU5OS02MS40NDktLjIwMy0yNi40NzMtLjIwMWMtOS44MTUtLjA3NS0xOS4xNTctLjI0NC0yOC45ODguMDEybC0xOS4xNjcuNDk5Yy0yLjE0OS4wNTYtNy4yOTMuNzE5LTguNzQ3LTEuOTEzLTEyLjQ3OS0yMi41ODEtMjAuMjM5LTQ0LjcxMS0xNi43MjMtNzAuODQsMS44NjItMTMuODM1LDEwLjAyNC0zMC45NzEsMTkuMTk1LTQxLjU4N2w5LjMwOC0xMC43NzUsMzUuODAyLTM3LjExNSw3LjExNy04Ljk2MWM1LjkxOC03LjQ1MiwxMC4yNjQtMTUuOTEzLDE0LjEwMi0yNC44ODkuNjc1LTEuNTc5LS45MzctNi4xNjcsMi4xMDQtNy4wMzgsMjEuNDU3LTYuMTM4LDMyLjQyMi0xNC4xMTQsNDYuODY1LTMxLjA5NiwzLjM5OC0zLjk5NSw0LjgyNS05LjgyOCw3LjI2OS0xNC41NzNsMi4zNTItOS42NTZjLjgxMy0zLjM0LDEuNjk3LTQuNDgxLDEuMDA3LTcuOTkxLS45MTctNC42NjgtLjU0Ni05LjUxMy0yLjExMy0xNS4yNjgtMy4xLDEwLjc0NS02LjkyOSwyMS42MDctMTMuNTkxLDMxLjM5Ny0zLjYyMSw1LjMyLTkuNjM3LDEyLjk3Ny0xMy45MjYsMTYuMzM2LTEyLjAwNyw5LjQwMi0yNy42MDMsMTguMDQ0LTQyLjc4LDE2Ljk2bC0xMy45MDItLjk5M2MtNS40NTQtLjM4OS04LjQzMS0uMzc5LTEyLjg2OCwyLjQ2N2wtMTguMjYsMTEuNzExYy00LjA1OCwyLjYwMi04Ljc3Nyw1LjQ4NS0xMC45MzMsOS44OTNsLTguMTYsMTYuNjgxYy0xLjU3MywzLjIxNS0zLjY5Nyw0LjI1OC02LjA5Niw2LjIzOC02Ljk1MSw1LjczOC0xNS4yMjcsNy44MjQtMjQuMiw1LjY2MS0zLjYzNS0uODc2LTguODg1LS4zMzEtMTEuMTUyLTQuMzk2bDIxLjI0NC0yMi4yOTNjMi4xMzEtMi4yMzcsMy4yMDgtNS44MzYsNC40NzQtOS4xNjUtNS4xNjctMS4xNzItNy44LDMuNzI1LTEwLjk4MSw2LjM1LTIuMzY0LDEuOTUtNS4wNzUsMi43NTMtNy4zMSw0Ljg2Mi01LjE3OCw0Ljg4Ni0xMS45NDksNy40OTktMTguMDE2LDEwLjkxNS0yLjk4NiwxLjY4MS00LjQ5NywxLjUyMi03LjY2My0uMTMyLTQuMjk3LTIuMjQ1LTExLjE2NC0zLjI1OC0xMy45NjEtNy44MDMtMy4zODItNS40OTQtMi42MTQtMTIuNzEtMy4yODQtMTguOTM2bC0yLjU2OC0yMy44NjNjLS43NTEtNi45NzMsNS4wNTgtMTAuODk3LDguODM3LTE1LjgzM2w2LjUwOC04LjVjNC45ODgtNi41MTUsMTAuNDAyLTExLjk0MywxNi4wMDUtMTguMDM1LDEuOTA3LTIuMDc0LDMuNjc2LTUuMTc3LDUuNDI0LTcuNDkxLDMuMzQ5LTQuNDMzLDcuMDUtOC4wOCwxMC40ODItMTIuNTI1bDYuNTc2LTguNTE2YzIuMjIxLTIuODc3LDQuMzgtNi4xMDksNi43MjktOS4yMjcsMy43MzMtNC45NTMsOC4zMTMtOS43MjUsOS41Ny0xNi4xMDZsMS43OTQtOS4xMDdjMS4wODktNS41MjcuNzQ1LTExLjQ2Miw0LjQ4OS0xNS44MTIsMTEuOTY0LTEzLjkwMSwzNC40MjctMjIuNjI4LDM1LjcyMy0yNS42NjIuMzc3LS44ODItLjc0Mi0xLjk1NS0uOS0yLjg2MWwtMS40ODgtOC41NTEtNS43MzYtMjAuNjY3Yy0uOTYtMy40NTgtMS4yMjEtNi41MTctMS45MjItMTAuMDU3cy0yLjgyNC03LjEyLTEuMjU3LTEwLjk5NmMyLjczNC0xLjQyNiw1LjQxOC44MzEsNy44OTEsMS4xNDksOC44MzEsMS4xMzQsMTYuMjE4LDUuMTYsMjMuMjc3LDEwLjA3OGw0Ljc0MiwzLjMwNGMzLjY0NCwyLjUzOCw3Ljc3MiwzLjk2NiwxMC45NTMsNy4yMSwyLjUyOCwyLjU3OSw1LjMzOCw0LjQ0Miw4LjkyMyw2LjQwN2wtLjQ3Ny0xMS4wOTljLTEuNDYzLTUuMTc2LTEuMzA0LTkuOTM0LTEuOTg4LTE1LjE4MS0uODk1LTYuODY2LTMuMjAyLTEzLjU4OS0uOTQ0LTIwLjgyOCwyMy41OTYsNS4yODIsMzUuNjI5LDE5LjgwMSw1MC40NDIsMzQuOTM1Wk00NTIuNjM3LDMzMC4wNThjNC43NzYtNC43MjUsMTIuMjM2LTMuNzI2LDE1LjkxNy04LjIxMy0yLjYzMi0uNjgzLTUuMDQyLTEuNjA5LTcuNTI3LTEuNTc1bC0yOS45MTUuNDA3Yy05LjgwNi4xMzMtMTcuNTY5LDkuMzA0LTIyLjEzMywxOC42ODNsOC43MDguNjI2YzQuNTE3LDIuNTYyLDguMjQxLDMuNzMyLDEyLjk4Nyw0LjQxMSwxMC40MjksMS40OTQsMTkuMTgxLTMuNjA2LDIxLjk2My0xNC4zMzhaTTM0NC4xODcsNDM2Ljg1OGM0Ljc5My0xLjAxNCw1LjYyNy00Ljc5OCw1LjkyOS04Ljg1My4zMTUtNC4yMzEtLjg3NC03LjkyMi01LjYzMS04LjU3MS04Ljk5OC0xLjIyOS0xNi4yNiw3Ljk3NS0xMy45NzYsOS41OCwyLjExOSwxLjQ4OSwxMC4wODgtMS44MzQsMTMuNjc3LDcuODQ0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTM0NC4xODcsNDM2Ljg1OGMtMy41OS05LjY3Ny0xMS41NTktNi4zNTUtMTMuNjc3LTcuODQ0LTIuMjg1LTEuNjA2LDQuOTc4LTEwLjgwOSwxMy45NzYtOS41OCIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTU2OC4xMSw2NTEuMTM2Yy04Ljg3NS02LjI4NC0yLjgwMS0yMS44NjEtNS42NzEtMzQuMjMzLTMuMTkyLTEuNDgyLTcuMjE0LTMuNjc5LTYuNDYyLTcuNDM2LDEuNjYyLTguMzA4LDEwLjMyNi00LjU0OCwxMS42NTgtNi4zMzQuNzIzLS45Ny4yNTItMi40MjgtLjA1MS0zLjcyOWwtMy44MDgtMTYuMzU5Yy0uNzU3LTMuMjUyLTIuOTkzLTguMDczLTIuMDg2LTExLjM4NCwzNi42MzEtNDUuMzA0LDY5LjA2NC05Mi41ODksNzIuMjA4LTE1Mi41OTNsLS4wNDUtMjYuMDk1LTIuNjI5LTIyLjQwNWMtNS4yMjItMzMuODk4LTIyLjg3OC02My44OTktNTAuMTI4LTg0LjY0OC0xMy40NjEtMTAuMjUtMjkuMzc1LTE5LjM4OS00NS43MzgtMjMuMTQzLTUuOTkzLTEuMzc1LTYuNzUtMTIuODc4LTE2LjI5Mi0yMi42MjYtMS4zMzYtMS45MjIsNS4yNjUtNC4wMTgsNi45MjgtMy44MzYsNS43NjcuNjMsMTkuNzM0LTQuNDgsMzYuOTctMS44MzNsMTUuNTU5LDIuMzg5YzIxLjQyLDMuMjksNTcuMzQzLDE4LjcwMiw3MS4xNDIsMzIuNDMxbDI1LjYwOSwyNS40ODFjMS45NDcsMS45MzcsMy43NDUsNS4xOTYsNS4yMjUsNy41OTlsOS44NiwxNi4wMTJjNi42MTEsMTIuOTIzLDEyLjQwOCwyNS42NTgsMTUuMDU0LDQwLjAzNmwxLjk4NywxMC43OTQsMi4xODEsMTcuMDEyYy41NTQsNC4zMjQuNTY1LDEwLjA4NS0uMTgyLDE0LjMyNS0xLjA2Niw2LjA1NC0uNjU2LDExLjQ4Ni0yLjAxNCwxNy4zODFsLTIuMDE3LDguNzUyYy00LjM4MiwxOS4wMTktMTIuMDcyLDM2LjU4LTIzLjE2Myw1Mi41MTFsLTEzLjEyNCwxOC44NTFjLTEuNzMsMi40ODUtMy4yNyw0LjM5LTUuMTQ4LDYuOTYzbC01LjQyOCw3LjQzNy0xNC42OTIsMjEuNDQ2Yy04LjcxLDEyLjcxMy0xNi4yLDI1LjkzNS0yMC4yMjEsNDEuMDM1LS45MjMsMy40NjQtMS4zMDMsNi40NS0yLjI0NCw5LjgwOGwtMi4wMTEsNy4xNzJjLS45MDcsMy4yMzYtMy4zNTMsOC44NDQtLjM4MSwxMS45MzYsMi4zMjYuMjMsNi40NzYtLjY5NSw4LjM5NSwyLjA5MSwxLjI3LDEuODQ0LDEuOTMsNC4wNzguNDYxLDcuMjU0LS43ODUsMS42OTctMy40NjUsMi42ODgtNS43MTgsMy45MzZsLS43MDYsMjcuMjA5Yy0uMTMsNS4wMS00LjU5Miw5LjI0OC05LjY0Nyw5LjI4MWwtMzguNjMuMjQ4Yy0xLjczOS0uMjIzLTMuODY3LTEuOTI1LTUuMDA0LTIuNzNaTTYwNi42MjYsNjAzLjU1N2w3LjExLTI5LjMwNi00Mi4yMDYuMDE5LDYuODM5LDI5LjcwMiwyOC4yNTctLjQxNloiLz48L3N2Zz4="

const KNIGHT_URI = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjYxOS4xODciIGhlaWdodD0iNjE5LjE4NyIgdmlld0JveD0iMCAwIDYxOS4xODcgNjE5LjE4NyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODkuNjc0NSwwKSI+PHBhdGggZD0iTTE1NC4zNzcsNTAuNTU4YzEuODgzLDEuNDIyLDMuMjM3LDMuODEsNS4wOTMsNS40NjNsNS4wMzMsNC40ODZjLjcyMSw4LjUwMiw3LjYwMiw5LjI1Miw2LjMwOSwxMi43NTUsMS41MzQsMS43MDksNC41MTQsNS40ODksNi43NTYsNi4zN2wxMC4xNDcsMS44M2MzLjIyNC41ODEsNS45MDMsMS42NDksOC44MDcsMi4yNzYsNC41MDUuOTczLDkuNzQ5LDEuMzA3LDE3LjQzMiwzLjgyM2w1LjE5NywxLjcwMmMzLjY5NywxLjIxMSw2LjUxNiwyLjU3MiwxMC4wMTgsNC4xMDIsNi40NjcsMi44MjYsMTMuMjg1LDQuNjc0LDE4LjgyMSw5LjI5OWw3Ljg0MSw0LjE5OGMyLjQ3OCwxLjMyNyw0LjI4NiwyLjkzMSw2LjU2Myw0LjQ4OWw1LjQyMSwzLjcwOGMyLjE1NywxLjQ3Niw1LjE2MiwyLjg1Niw3LjA1Miw0Ljc1N2wyOC44ODEsMjkuMDVjMi4wMTUsMi4wMjcsNi43NzksOS44NTIsOS44NjQsMTQuMTA3bDMuODE3LDUuMjY1LDEwLjU5OSwyMS4zMjQsMi44NDQsNy4zNTUsNy41NjgsMjIuMjczYy44NzcsMi41ODIuMDksNC42NjgsMS45NjQsNy40MWwuNDU2LDcuNTAxYzEuMzk5LDMuMjk1LDIuMzQ1LDYuNDQ0LDEuNjg1LDEwLjA4Mi0uNzY5LDQuMjM2LDEuNTA5LDcuNTM3LDEuNTU5LDExLjIxNmwuMzUxLDI1LjcxMy0xLjcyLDQuMjczLS41ODEsMTQuODdjLS4xMjQsMy4xNjQtMi41MTgsNi4xOS0xLjQ5OSw5Ljk1NC43NDIsMi43NDMtMi4xMzQsMTIuODI3LTMuNTk4LDIwLjE4NGwtMS45ODksOS45OTItMS45NTgsOS45ODRjLTEuNzIyLDguNzgxLTQuNjI2LDI0Ljg0OC02LjQxOCwyOC4wOGwtLjM0NSw4LjYxNmMtMS40NjEsMy40OTctMi42NDUsNy4zMy0xLjYzNywxMS4wNTYuOTI5LDMuNDM0LTEuNzc0LDUuNzk2LTEuNzY5LDguMjQzbC4wNTcsMzIuNjU0Yy4wMDQsMi4yNDIsMy4wNTgsNC45NzQsMS43NDUsOC4yOTMtLjgyNSwyLjA4NiwxLjYwNSwxMS4zNjMsMy41MSwxNy4wNjFsMi41OTEsNy43NDgsNi44NSwxMy45ODZjLTcuMDk4LDExLjAzOS02LjA3NSwyNS44MjQsMy42MTgsMzUuNDYzbDIwLjkzNywyMC44MjJjOC4zOTksOC4zNTMsMTIuMSwyMC4xMjQsOS4xNzEsMzEuNzY2LTEuOTAxLDcuNTU4LTYuMTI2LDEzLjMzNC0xMC40MjQsMTkuOSw0LjA2My4xLDcuNjU5LS42NDcsMTAuNzg1Ljg2OCw1LjA0LDIuNDQyLDUuOTI4LDguMTQ2LDUuNzY1LDEzLjI1MS0uMjA3LDYuNDU3LTMuNDA0LDExLjAxMy0xMC4yOTEsMTEuMDExbC0yOTkuNDYtLjA4N2MtNi4zOTYtLjAwMi05LjA5OS02LjcyMy05LjI4My0xMS43MjYtLjE5LTUuMTY0LDEuMjE1LTkuMTk3LDQuNTEzLTExLjM3MSwzLjgzOC0yLjUzMSw4LjIyLTIuMzIxLDEyLjM3Ny0xLjU1NGwtNS44NTEtOS4yNDNjLTguNjYyLTEzLjY4NC02Ljc2NC0zMC4wMjQsMy44ODEtNDIuMDQ2bDE3LjY4NC0xNy4yMDFjMjUuMjIxLTI0LjUzMiwzLjAxLTM5LjU3Ni0uOTY5LTc3LjY3My0yLjY3MS0yNS41NzIsMy4zNTctNDYuOTE3LDE2Ljk0Ny02OC40MDEsNy41MTktMTEuODg3LDE1Ljg3Mi0yMi4zMDEsMjUuMjQ5LTMyLjc0N2wzNS40NjMtMzkuNTAzYzE3LjY0My0xOS42NTQsMzYuMTA1LTQ3LjI1OSwyNS44MTEtNzIuNzkzLS40MzQtMS4wNzctMi4zNS41NjEtMy4wMTksMS41MzUtMTIuNjI3LDE4LjM4NC0zMy45MTMsMjcuNTM5LTU2LjE5NiwyNC45ODItMy43MzktLjQyOS04Ljk0LTIuNDU1LTEyLjIzNi0uMzNsLTM1LjI3NiwyMi43NDMtNi4zODcsMTguMzY2Yy0yLjU5Myw3LjQ1Ny05LjQ4NiwxMS4yNDctMTcuMTAxLDEyLjI2NS04LjU4NSwxLjE0OC0xOS4yMDYsMy4xNDYtMjAuOTg4LS44MjktLjY0Ny0xLjQ0My4wMTktMy4wNzguODYzLTQuNDExbDcuMTM5LTExLjI4Mi0xNS4zMzQsOS4wMzZjLTMuMjQ0LDEuOTExLTcuODQ3LjU3Ni0xMC44NzYtMS40NDJsLTEzLjgxMy05LjIwMmMtMy40NjgtMi4zMS00LjcyNS02LjY1OS01LjIzMi0xMC43NjktMS4wNjktOC42NTUtMi41MTctMTYuODg0LTQuNjkzLTI1LjMxMy0xLjI1OC00Ljg3NC4xMDItOC45NjQsMy4xMDUtMTNsNjAuODkxLTgxLjgyNWM1LjQ3Ny03LjM2LDUuODM2LTE3LjMyMiw2Ljk4OC0yNS44OTYuODU2LTYuMzY5LDMuMTQyLTEwLjU3NSw3Ljc5Ni0xNC41NzhsMzkuNjk1LTM0LjEzOGMzLjI1LTIuNzk1LDUuMjM4LTQuNTczLDQuMDAxLTkuMTg2LTQuMTEzLTE1LjMzNy03LjYxNC0zMC42MTctMTAuNzYzLTQ2LjI3Ni0uMzE5LTEuNTg4LDEuMTg5LTIuNzksMi4wMDctMi44OTQuNzg0LS4wOTksMS45NS0uMTAyLDMuMTAyLjEwOCwxNC4wMzEsMi41NTMsMjYuMDcsOS43MzQsMzcuMDg3LDE4LjA0OXYuMDAzaDBaIiBmaWxsPSIjZmRmY2ZjIi8+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjMzOS42NDUgMTY2LjEzNiAzMzkuNjQ1IDE2Ni4xMzYgMzM5LjY0NyAxNjYuMTM3IDMzOS42NDUgMTY2LjEzNiIgZmlsbD0iI2JlZWMwNyIvPgogICAgPHBhdGggZD0iTTE5OS4yMjMsMzYuOTUxYy0zLjYzOSwxLjg4OC02LjUxNiwyLjkxNi0xMC4wODQsNC4xNjItMy41MjQsMS4yMy02LjM0NSwzLjE3Ny0xMC4wODEsNC4wMTNsLTYuNDk2LDEuNDUzYy0zLjc1NC44NC02LjIyMy45MzUtMTAuMzMsMS45My0xLjg2NC40NTItNS4zMjcsMy4wMDUtNy44NTYsMi4wNDksMS44ODQsMS40MjEsMy4yMzgsMy44MDksNS4wOTMsNS40NjMsOC41MjgtMy44MzIsMTkuNDg2LTMuOTc4LDI5Ljk2Ni04Ljk1NCw0LjU4My4xNzMsNy45ODktMi40MjIsMTEuODgyLTQuMDQ1LDEyLjExOS01LjA1NSwyMi4yODctMTEuNTQzLDMyLjI4Mi0yMC45NjJsLTE0LjY0LDQ1LjU5NmMtLjQ1LDEuNDAyLTEuMjk1LDIuNjg2LTIuMzUyLDMuMjAzLS43ODguMzg3LTIuNTU5LS4zMjctMy40NTYtLjcxNS00LjAxMi0xLjA2Ni02LjI2My0yLjUyMS05LjE1MS0zLjQ0NC0xMi45MjctNC4xMjktMjYuMzQ3LTQuOTEtMzkuNDk3LTYuMTkyLjcyMSw4LjUwMiw3LjYwMiw5LjI1MSw2LjMwOSwxMi43NTUsMS41MzQsMS43MSw0LjUxNCw1LjQ4OSw2Ljc1Niw2LjM3bDEwLjE0NywxLjgzYzMuMjI0LjU4MSw1LjkwMywxLjY0OSw4LjgwNywyLjI3Niw0LjUwNS45NzMsOS43NSwxLjMwNywxNy40MzIsMy44MjNsNS4xOTcsMS43MDJjMy42OTcsMS4yMSw2LjUxNiwyLjU3MiwxMC4wMTgsNC4xMDIsNi40NjcsMi44MjYsMTMuMjg1LDQuNjc0LDE4LjgyMSw5LjI5OWw3Ljg0MSw0LjE5OGMyLjQ3NywxLjMyNyw0LjI4NiwyLjkzMSw2LjU2Myw0LjQ4OWw1LjQyMSwzLjcwOGMyLjE1NywxLjQ3NSw1LjE2MSwyLjg1NSw3LjA1Miw0Ljc1N2wyOC44ODEsMjkuMDVjMi4wMTQsMi4wMjYsNi43NzksOS44NTIsOS44NjQsMTQuMTA3bDMuODE3LDUuMjY1LDEwLjU5OSwyMS4zMjQsMi44NDQsNy4zNTUsNy41NjgsMjIuMjczYy44NzcsMi41ODIuMDg5LDQuNjY4LDEuOTY0LDcuNDFsLjQ1Niw3LjUwMWMxLjM5OSwzLjI5NSwyLjM0NSw2LjQ0MywxLjY4NSwxMC4wODItLjc2OSw0LjIzNiwxLjUwOSw3LjUzNywxLjU1OSwxMS4yMTZsLjM1MSwyNS43MTMtMS43Miw0LjI3My0uNTgxLDE0Ljg3Yy0uMTIzLDMuMTY0LTIuNTE3LDYuMTktMS40OTksOS45NTQuNzQyLDIuNzQzLTIuMTM0LDEyLjgyNy0zLjU5OCwyMC4xODRsLTEuOTg5LDkuOTkyLTEuOTU4LDkuOTg0Yy0xLjcyMyw4Ljc4MS00LjYyNiwyNC44NDktNi40MTgsMjguMDhsLS4zNDUsOC42MTZjLTEuNDYxLDMuNDk3LTIuNjQ2LDcuMzMtMS42MzcsMTEuMDU2LjkzLDMuNDM0LTEuNzczLDUuNzk2LTEuNzY5LDguMjQzbC4wNTcsMzIuNjU0Yy4wMDQsMi4yNDIsMy4wNTgsNC45NzQsMS43NDUsOC4yOTMtLjgyNSwyLjA4NiwxLjYwNSwxMS4zNjMsMy41MSwxNy4wNjFsMi41OTEsNy43NDgsNi44NSwxMy45ODZ2LjAwMmMxLjY0NS0uODc1LDIuOTktMi41NTgsMy4zODItNC41NDkuODI4LTQuMjA3LDMuOTE5LTYuMTU4LDcuMDUyLTguNjlsLTEuMTA1LTguODgzYy0zLjIwOS0xMy40MjktMy42NjktOC45NDYtNS40OTQtMzEuMjczLS45MDItMTUuMDg0LS4zMTYtMjMuNzE3LDMuNjEtMzguOTIsMi43ODQtMTQuMTc1LDkuOC00NC4wMTYsMTQuOTY0LTY2LjIyMSwxLjY0Ny03LjA4LDIxLjAwNS0xNC40NzgsMjQuMTgyLTI4LjA3MiwzLjEzNy0xMy40MjYsNS42MzgtMjMuNTk3LDUuOTE5LTI0LjczMiw2LjE2My0yNC44MiwzMC42NDgtNzMuOTg2LDQwLjQ0OC05My4yODEsMi4wMDEtMS45NDMsNi4zNDctLjU5Nyw5LjE4Ni0uMjI2bC01LjMwNi0xMi4xNzEtNy43MTItMTYuMTItNS41MjMtLjQ0NWMuMjA3LDIuMjEzLTMuMjMyLDUuMTctNS43MzgsNC45OThsLTYuNzk5LTEuNzA4Yy00LjExOS0xLjAzNC03Ljc3OS0zLjA3Ni0xMS42MTMtNC41MTEtOS42NC0zLjYwOS0yMy42MzctOS41MjUtMzAuOTAyLTE0Ljc2N2wtMTEuMzA5LTUuODI4Yy0xMy44MzItOC45NzgtMjYuMjQyLTE5LjQzNi0zNi45MzctMzEuOTk1LTEyLjEyNS0xNC4yMzctMjMuMDAxLTI4Ljk0NC0zMS4yNzEtNDUuNTU4bC0xNS42OTktMzEuNTM2Yy0xLjA3NC0yLjE1OS0xLjI0OC02LjYyMy0uMDI2LTguODQsMS4wNDktMS45MDMsMy40OC0zLjA5LDMuMDYzLTUuMDU0LTIuNTYxLTEuNzU5LTUuNTEyLTEuMjQ5LTcuODk1LTEuOTc2LTMuMjA2LS45NzgtNS44MzYtMi42NTMtOS44OTctLjk3OC0yLjU5Mi0zLjAwNy02LjE5MS0zLjE3NC05LjkyOC0yLjEwNy0zLjc1Ny0zLjcxOS04Ljk1OC0zLjUzMi0xMi4xMDguNDYyLDMuMjYxLDIuMjk2LDIuNTM5LDUuMDY4LDEuMDY4LDcuODU3LTEuMjY1LDIuMzk5LTIuNDQzLDIuOTg0LTQuNTE4LDQuNzk5LTMuNjcsMy4yMS03LjM0LDYuNDE5LTExLjAxLDkuNjI5TTI0OC4xMTYsODEuMzNsLTE1LjE0NC02LjE1NmMxLjUxMi01LjA1MiwxLjA2Ny0xMS40MTcsMy45Ni0xNS43MDMsMy4xNTItNC42NywxMi4wMDEtMS40NjYsMTQuNTM3LDIuNTc0bC0zLjM1MywxOS4yODVaTTI1Mi40MjcsNTMuNjYzYy0xLjQxMy44MTctMy40NjcsMS4wMjItNC45MTItLjQyM2gwYy0yLjU2Ny0yLjU2Ny05LjgxMy43MzktOC41NjMtMy43NjMsMi4wMTgtNy4yNjYsNS40MDItMTcuNDUyLDkuNDI1LTE4Ljc3NSwxLjAyOS0uMzM4LDMuNjEzLS4wMDMsMy45OTUsMS40MSwxLjkyMiw3LjExOCwxLjA3NiwyMC45NjEuMDU1LDIxLjU1MVpNMjU2LjUxNCwxOC43NjljLS42LjUtOC4yMDctLjEzMi04LjcyLTIuMjQ2LS4zNzktMS41NjMtLjIzNi0zLjQyNywxLjAwMy00LjQzNmgwYzIuMDE3LTEuNjQzLDguNzM1LjgyOSw4LjgzNywyLjYxMi4wNzksMS4zNzYtLjAxLDMuMTQ1LTEuMTIsNC4wN1pNNDIzLjQ3OSwxNjcuNjkxYzEuMjU2LDEsMy41MTIsMy41NjYsMi43NzQsNS44MTNoMGMtLjU5OSwxLjgyMy0zLjEzNiwyLjU2NC00LjUwOCwyLjU2NS0xLjI5OC0yLjEwOC0zLjM4MS00LjQ4NS0zLjU4OC02Ljg4My40ODktMS4zMTIsNC4xNzgtMi40MDcsNS4zMjMtMS40OTVoMFpNMjY3LjI2Nyw5MC45ODljLTEuODY5LDEuMzQyLTQuNjQ4LTEuODktNC4yODYtNC41NTNsMS42NjMtMTIuMjMxYy44NzctNi40NDcuNTc5LTEyLjYxMSwxLjE1OS0xOS4wMDUuNzg1LTguNjYsMi4wNzgtMTYuODMyLDIuMDA1LTI1Ljc1LDQuMDQ0LDQuMjQ4LDQuMjY2LDguNjMzLDYuNzgzLDEyLjY5MiwxLjQxMSwyLjI3NiwyLjYxNSw1LjEwOCwxLjkyMiw4LjE1N2wtOS4yNDcsNDAuNjloMFpNMjc1LjA1Miw5Ni43ODdjLTIuMTQzLjM4MS0zLjUwMy0xLjY4LTUuNzQ0LTMuMjMzbDkuNjE5LTQyLjU0OSw3LjM3OCwxMS43OTktMTEuMjUyLDMzLjk4M2gwWk0yNzcuODIyLDk4Ljk1NGgwYy0uNzIyLTMuNjE3LDIuMDMtNi44OTUsMy4wMjQtOS45NjZsMS43NjYtNS40NTRjMS45MTItNS45MDUsMi44NjMtMTEuNzUyLDUuNDA1LTE3LjM3NCwyLjU2LDMuNDIyLDQuMTE3LDYuNDM4LDUuNiwxMC4zMzhsLTEwLjUxLDI1LjU1Yy0xLjU5Ni43MDQtNC45MjQtMS4yODQtNS4yODUtMy4wOTRaTTMwOS40MDEsOTcuMTYzbC0xMy41OTksMTYuNzA4LTIuNzAzLTMuMTA0Yy0yLjM4OC0xLjc4OC02LjUyMi00LjM1LTcuODk1LTYuNTcybDExLjAzMy0yNS44MDhNMjk4LjQ3NSwxMTYuMTUxbDE2LjEzNi0xNC4wNzUsNC4wNjMsNS4zMzEtOS4xNDUsMTEuODZjLTEuMDczLDEuMzkzLTIuNTQ1LDIuMDg3LTQuNjMyLDMuNDI2bC0yLjYyOC0zLjc4Nk0zNDcuMDIzLDEzMS41NzJsLTIwLjM2NywxNy4xMjRjLTIuMzA1LTIuNTIxLTEuNTQ5LTIuMTMzLTMuMTIyLTQuNjQ5LS4zMDktLjQ5NS0xLjcwNi0yLjc0OS0xLjk1Ni0yLjk5Ni0yLjEyOC0yLjEwMS0xLjI1Ny0xLjEtMy4zNjctNC4zMDQtLjg5NC0uNzU2LTIuMzA1LTMuMDQ0LTMuMTA1LTQuMzAybC0uODctLjg5Yy0yLjU5My0xLjQyNi00LjE2Mi0zLjc4LTUuOTQ3LTYuMzI3bDEyLjM0LTE2LjI0OSw3LjA5Nyw3LjE4Mk0zMjkuMTQ2LDE0OS45ODFsMTMuNjUzLTExLjUwMWMxLjY0NS0xLjM4NSw0LjM3NS0zLjM3Niw2LjM1Ny0zLjY1NywzLjMwMi4wNDUsNi4yNDcsMi4yMzMsOC40MDYsMy45MjlsLTI0LjY0OSwxOC44OTloMGMtMi42MjEtMS45NzYtMi44NTEtNC43MjctMy43NjctNy42N2gwWk0zNzQuMDUzLDE0Ny41MzlsOS4xOTUsNC44NTQtMzEuMjIyLDE4LjQyNWMtMi41NTIsMS41MDYtOC4zMDEsNC4zMjktOS4yOTQsMi4xMDktLjc3NS0xLjczMi0xLjIxMy0yLjk0OC0xLjY1OS0zLjkxNGwtMS40MjgtMi4yNDZjLTEuNjkyLTEuMzkxLTQuMTc1LTQuMzQ3LTUuNDk0LTcuMzUtMS4wMywxLjAwOS4xNzkuNDA1LDEuNDk5LS43NGwyMy43NzktMTcuNjI2TTM2NC43NjQsMTY2Ljc1OWM3LjQ4NC00LjgyNiwxNC42NjgtOS4xNDQsMjIuNTkxLTEyLjk0bDEyLjM0Niw0LjkxOS0yNS4wNDgsMTIuNjJjLTMuNTE4LDEuNzczLTYuODA3LDIuODc5LTEwLjY4Myw0Ljk4N2gwbC0xNS41NzQsOC40NzNjLTEuNjMzLTIuMTEyLTIuNTI1LTQuMzUyLTMuMjU4LTYuNTFNMzQ5LjYwMSwxODcuMjQ2bDQ4LjE0OC0yNC42NTdjNC4zNjItMi4yMzQsOC4zMzUtMy41NDUsMTEuNzY5LjE4NmwtMjYuNjkzLDEyLjg1NC0zMS40MDIsMTYuNjE0Yy0xLjI0Ny0xLjExNS0yLjA3Mi0zLjEwOC0xLjgyMi00Ljk5N1pNNDA3LjI0OCwxODMuOTA2bC0xNS43ODcsMTMuNzQyaDBsLTUuMzk3LTEwLjQxNGM3LjI5NC0zLjg1NywxNS44OTMtOS4yNzYsMjIuMDkxLTguNDg4LDEuOTkzLjI1My43NjgsNC41MTgtLjkwNiw1LjE2aDBaTTM1Ni4zODMsMjA0LjIzNWwyMS42Ni0xMi41NDljMi45MzUtMS43LDYuOTYzLDQuMzIyLDYuMjAzLDcuMjAyLTEuMTIzLDQuMjU1LTQuNTczLDUuNDYxLTguMTkzLDcuNDM1aDBsLTE2LjQzOSw4Ljk2NGMtMi4xMzUtMy4zNzQtMy4xMTYtNi43OTQtMy4yMzItMTEuMDUyaDBaTTQwNC4xNzMsMjI2Ljc3N2wtMTYuNzkzLDguMzA2Yy00Ljk0LDIuNDQzLTcuODQzLDQuMDI1LTE0Ljg5Myw3LjE2OC0yLjUwMiwxLjExNi0zLjk5MywyLjA2LTYuODA2LDMuMTQ5LTEuMTcyLTIuOTUtMS4xMTktMy4xMS0xLjE4Ni02LjA5NmwtLjM4OC0xLjc3My0uMTkxLTEuNTI1Yy0uODIxLTIuMTE5LTIuNDY0LTUuOTk4LS4zMjUtNy4zMzIsMi44NjQtMS43ODcsNC43NzUtMy4wNSw3LjQ4OC00Ljk3NGw3LjM2OC01LjIyNWM0LjEwNC0zLjE4OSw0Ljc0Mi0zLjIxMiw3LjM5Mi00LjkzMWwxOC4xMDQtMTEuNzQxLDExLjc4LTEwLjExYzIuOTk3LTEuNjAyLDMuMTc4LTEuMjg5LDQuOTQ0LTIuNTAybC02LjQ4LDEzLjcyMU0zNjUuNjgxLDI0OS4yNjRsMzcuOTUxLTE5LjEyNC04Ljc2OSwxNi40MzctNC43OTMsMS44MjRoMGwtMjMuMDAxLDEwLjQzNy0xLjM5LTkuNTczaC4wMDFaTTM4NC42NTcsMjY4LjYyMmMtMS40MDksNS42MjItMy4zNzMsOC4xNTItNS4xMTksMTIuNTUydi0uMDcybC0xMS45OTgsNC4xMy4wNTYtMTAuOTQ2LDE3LjA2Mi01LjY2NGgtLjAwMVpNMzg2LjkwMiwyNjQuOTQ4bC0xOC45NDQsNi43MjljLS45MDktMy44NjUtLjY2Ni02Ljg1My0uNDI4LTEwLjM2OGwyNS45ODQtMTEuMTIyLTYuNjExLDE0Ljc2aDBaTTM2Ny42MzQsMjg3Ljk1NGwxMS45MDMtNC40NTEtMy45OSwxMC42MTktNy45NjUsMi45MTFjLS45MTItMi40OTItLjE4NS01LjMzOC4wNTEtOS4wNzhoMFoiIGZpbGw9IiNiZWVjMDciLz4KICA8L2c+CiAgPHBhdGggZD0iTTM0NS42NjIsNDcyLjg1NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmVlYzA3IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxwYXRoIGQ9Ik0zNjAuMTAzLDMyMy43NjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2JlZWMwNyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8bGluZSB4MT0iMjAzLjg3NiIgeTE9IjcxLjQwMyIgeDI9IjIxMC44NzQiIHkyPSIzNy4yIiBmaWxsPSJub25lIiBzdHJva2U9IiNiZWVjMDciIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGxpbmUgeDE9IjE4NS4yODIiIHkxPSI3Ny40NzgiIHgyPSIxOTIuMjgxIiB5Mj0iNDMuMjc1IiBmaWxsPSJub25lIiBzdHJva2U9IiNiZWVjMDciIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHBhdGggZD0iTTM1Mi4xNDIsMzQwLjg4MSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmVlYzA3IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwYXRoIGQ9Ik0zMzkuMDAzLDM2Mi41NDciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2JlZWMwNyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjMiLz48L2c+PC9zdmc+"
const PAWN_URI = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDUuNzYiIGhlaWdodD0iMjQ1Ljc2IiB2aWV3Qm94PSIwIDAgMjQ1Ljc2IDI0NS43NiI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNiYzE4Mjg7fS5jbHMtMntmaWxsOiNmY2ZjZmM7fTwvc3R5bGU+PC9kZWZzPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTE2My45ODYsODcuMzU3Yy0zLjI4OSwyMy4yNDgtMTIuNDI3LDQ0Ljg5NC0zMS44ODgsNTkuMjhsNy43OCwyNS43NTZjMS42NjMtLjA2MiwzLjE5OC41NDQsMy41ODQsMi4wNDIuNCwxLjU1NS0uNDg0LDIuODMtMS45NTcsMy40NjdsMi41NjUsMy4yMzMsNC42NTEsNi4zNjhjMi4yMTcsMy43NDUsMi4wMTUsOC4yNDYtLjc1OSwxMS41ODJsMi4xOTMsMS42MzQtLjAzNyw0LjU0Mi01NC41LS4wMDcuMDA1LTQuNDk4LDIuMTk4LTEuNjU1Yy0yLjYxOC0zLjEzNS0yLjk4Mi03LjM0NS0xLjExMi0xMC45NDVsMi43NjMtNC4yMDksNC44NzUtNi4xMzdjLTEuNTMtLjUwOS0yLjI2NS0xLjc0NS0yLjA4NC0zLjE3Ni4zMDgtMi40MjUsMy42NDItMi4xNDgsMy43MzQtMi40NTRsOS41NjgtMzEuOTI1Yy0yLjM4NC0uNDYxLTUuNDAyLTEuNjQtNS4yODktMy4wNTguMTQtMS43NjYsNC42NTgtMi42ODIsNy40ODktMy4zMzktNC41OTgtMS44NS04LjAzNC01Ljg1Ny05LjEtMTAuMjE3LTEuMy01LjMxMi4wODctMTAuNDAyLDMuNzA5LTE0LjEzNSwzLjMzOS0zLjQ0MSw3LjktNC45LDEyLjc1MS00LjIyOCw0LjEwNS41NjksOC4wNDcsMy4wMjEsMTAuMzY0LDYuODk3LDQuNzk5LDguMDI2LDEuMTgsMTguMjI0LTcuNTE0LDIxLjY5NiwyLjk0Mi42MjgsNy42ODksMS42MjcsNy41MTIsMy40ODktLjE0MiwxLjQ5Ni0zLjE0MiwyLjQ2Ny01LjI4MywyLjkzMmwxLjI2OSwzLjkwOGMxOC41NDYtMTQuMDU5LDI2Ljg2Ni0zNC42MTEsMzAuMjE4LTU2LjgzN2wyLjI5NS0uMDA2WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTE2My45ODYsODcuMzU3bC0yLjI5NS4wMDYtMi40NS0uMDc4LDIuNjA3LTQuOTIzLTMuODc4LTIuOTgxLTIuMTQyLTEuNjktMy4zNTYtMi45MDgtNi43MTQtNi42ODMtMS45NTctMi4zODctMi42ODEtMy44Yy00LjQ1LTYuMzA4LTQuMTUtMTUuODQyLDIuMjUtMjAuNTAzLDUuNzk5LTQuMjIzLDEzLjgzNS0zLjEyNSwxNy45MDMsMi43NTYuNjc5Ljk4MSwxLjI0NCwxLjc4NSwxLjY0MiwzLjAxNi42OTktLjgyNSwxLjAwNC0xLjUyMywxLjQyOC0yLjM2OGwuOTc0LTEuMTMzYy41NTctMS4wOCwxLjM0NS0xLjYyNSwyLjI4Ni0yLjMxNywyLjgxNi0yLjA3Miw2LjMxNS0yLjk4LDkuNzM2LTIuMjYyLDIuMTAyLjQ0MSw0LjA0LDEuMTc0LDUuNjYxLDIuNTE2LDIuNiwyLjE1Myw0LjIzOCw0Ljk3Miw0LjgxOSw4LjI4LjMsMS43MDkuNDksMy4xMzYtLjA0OSw0Ljg3My0uMjIxLjcxMS0uMTksMS42LS40ODUsMi4zOTItMS4yNjQsMy4zOTEtMy4xNjMsNi4yNTctNS4zNCw5LjEyMmwtMy4yNzUsMy42NTJjLS45NjcsMS4wNzktMS45ODUsMS45OTgtMy4wNDEsMi45NzlsLTMuODM4LDMuNTY2LTIuMjY1LDEuODU0LTUuMTYsNC4wNDMsMi41OTgsNC45MjgtMi45OC4wNTFaIi8+PC9zdmc+"

const COLORS = {
    mint: "#6EE7B7",
    black: "#0A0A0C",
    zinc900: "#18181b",
    zinc700: "#3f3f46",
    zinc500: "#71717a",
    zinc400: "#a1a1aa",
    white: "#FFFFFF",
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

// Dark Analytics card system — Swiss Modernist, asymmetric, data-forward
// Satori constraints: no mask-image, no blur, no CSS gradients on background shorthand
// Piece is an <img> at low opacity — architectural crop via overflow:hidden + positioning

function displayName(name) {
    if (!name) return "Bristol Player"
    if (name.includes(",")) {
        const parts = name.split(",").map(s => s.trim())
        return (parts[1] + " " + parts[0]).trim()
    }
    return name
}

function shortName(name) {
    const full = displayName(name)
    const parts = full.split(" ")
    if (parts.length > 1) return parts[0][0] + ". " + parts.slice(1).join(" ")
    return full
}

// Satori-compatible radial glow — uses a large semi-transparent circle
// (Satori doesn't support filter:blur or radial-gradient on background)
function glowCircle(color, top, right, size) {
    return box({
        position: "absolute",
        top, right,
        width: size, height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        opacity: 0.09,
    }, [])
}

function watermark(text, fontSize) {
    return box({
        position: "absolute",
        bottom: -48,
        right: -32,
        fontSize: fontSize || 260,
        fontWeight: 900,
        color: "rgba(255,255,255,0.04)",
        lineHeight: 1,
        letterSpacing: "-0.05em",
        fontFamily: "Arial, sans-serif",
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap",
    }, [text])
}

function pieceEl(uri, size, top, right, opacity) {
    return box({
        position: "absolute",
        top: top ?? -30,
        right: right ?? -60,
        width: size,
        height: size,
        opacity: opacity ?? 0.11,
    }, [img(uri, { width: size, height: size })])
}

function topBar(moduleTag) {
    return box({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 0,
    }, [
        box({ display: "flex", alignItems: "center", gap: 12 }, [
            box({ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.mint }, []),
            txt({ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", fontFamily: "Arial, sans-serif" }, "BRISTOL CHESS"),
        ]),
        txt({ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", fontFamily: "Arial, sans-serif" }, "MY CHESS YEAR · " + moduleTag),
    ])
}

function ctaFooter() {
    return box({
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 64,
        paddingRight: 64,
    }, [
        txt({ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" },
            "→  Find your own chess year at"),
        txt({ fontSize: 15, fontWeight: 700, color: COLORS.mint, letterSpacing: "0.1em" },
            "BRISTOLCHESS.CO.UK/YOUR-CHESS-YEAR"),
    ])
}

function cardBase(bgColor, glowColor, pieceUri, pieceSize, watermarkText, children) {
    return box({
        position: "relative",
        width: W, height: H,
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 56px 64px",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
    }, [
        glowCircle(glowColor, -120, -80, 700),
        watermark(watermarkText),
        pieceEl(pieceUri, pieceSize),
        ...children,
        ctaFooter(),
    ])
}

function whereYouStandCard({ name, percentile, rank, total }) {
    const pct = parseFloat(percentile)
    return cardBase(COLORS.black, COLORS.mint, KNIGHT_URI, 680, "RANK", [
        topBar("WHERE YOU STAND"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "I'M RATED HIGHER THAN"),
            txt({ fontSize: 280, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, letterSpacing: "-0.05em" }, pct + "%"),
            txt({ fontSize: 30, color: "rgba(255,255,255,0.45)", marginTop: 12 }, "of all rated Bristol & Districts players"),
            txt({ fontSize: 24, color: "rgba(255,255,255,0.5)", marginTop: 8 }, "I rank #" + rank + " of " + total + " rated players"),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 24 }, displayName(name)),
        ]),
    ])
}

function ratingJourneyCard({ name, currentRating, yearAgoRating, change, domainLabel }) {
    const up = parseInt(change) >= 0
    const changeColor = up ? COLORS.mint : "#FF9B8E"
    const sign = parseInt(change) >= 0 ? "+" : ""
    return cardBase(COLORS.black, COLORS.mint, KNIGHT_URI, 700, "RATING", [
        topBar("RATING JOURNEY · " + (domainLabel || "STANDARD").toUpperCase()),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "MY CURRENT RATING"),
            txt({ fontSize: 280, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(currentRating)),
            box({ display: "flex", alignItems: "baseline", gap: 16, marginTop: 16 }, [
                txt({ fontSize: 52, fontWeight: 900, color: changeColor, fontFamily: "monospace" }, sign + change + " pts"),
                txt({ fontSize: 22, color: COLORS.zinc400 }, "up from " + yearAgoRating + " a year ago"),
            ]),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 24 }, displayName(name)),
        ]),
    ])
}

function seasonScoreboardCard({ name, played, wins, draws, losses }) {
    return cardBase(COLORS.black, "#3B82F6", KNIGHT_URI, 640, "SEASON", [
        topBar("SEASON SCOREBOARD"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 28 }, displayName(name)),
            box({ display: "flex", alignItems: "flex-end", gap: 40 }, [
                box({ display: "flex", flexDirection: "column", gap: 6 }, [
                    txt({ fontSize: 220, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, fontFamily: "monospace" }, String(wins)),
                    txt({ fontSize: 28, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "WINS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 6 }, [
                    txt({ fontSize: 220, fontWeight: 900, color: "rgba(255,255,255,0.35)", lineHeight: 0.85, fontFamily: "monospace" }, String(draws)),
                    txt({ fontSize: 28, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "DRAWS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 6 }, [
                    txt({ fontSize: 220, fontWeight: 900, color: "#FF9B8E", lineHeight: 0.85, fontFamily: "monospace" }, String(losses)),
                    txt({ fontSize: 28, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "LOSSES"),
                ]),
            ]),
            txt({ fontSize: 32, color: COLORS.zinc400, marginTop: 20 }, "I played " + played + " league games this season"),
        ]),
    ])
}

function inGoodCompanyCard({ name, drawRate, gmName, gmDrawRate }) {
    const diff = Math.abs(parseInt(drawRate) - parseInt(gmDrawRate))
    const caption = parseInt(drawRate) < parseInt(gmDrawRate)
        ? "I draw less than " + gmName + " — " + diff + "pp fewer draws than the world champion"
        : "I match " + gmName + "'s career draw rate exactly"
    return cardBase(COLORS.black, "#6366F1", KNIGHT_URI, 640, "DRAWS", [
        topBar("IN GOOD COMPANY"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "MY DRAW RATE THIS SEASON"),
            txt({ fontSize: 280, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, drawRate + "%"),
            box({ display: "flex", alignItems: "baseline", gap: 14, marginTop: 14 }, [
                txt({ fontSize: 36, fontWeight: 900, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }, "vs " + gmDrawRate + "%"),
                txt({ fontSize: 22, color: COLORS.zinc400 }, gmName + " career"),
            ]),
            txt({ fontSize: 28, color: COLORS.zinc400, marginTop: 12 }, caption),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 20 }, displayName(name)),
        ]),
    ])
}

function giantKillingCard({ name, opponent, ownRating, oppRating, differential }) {
    const oppName = opponent.includes(",") ? opponent.split(",").reverse().join(" ").trim() : opponent
    return cardBase(COLORS.black, COLORS.mint, KNIGHT_URI, 700, "UPSET", [
        topBar("GIANT KILLING"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "MY BIGGEST RATING UPSET THIS SEASON"),
            box({ display: "flex", alignItems: "center", gap: 40, marginTop: 4 }, [
                txt({ fontSize: 280, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, "+" + differential),
                box({ display: "flex", flexDirection: "column", gap: 14 }, [
                    box({ display: "flex", alignItems: "baseline", gap: 16 }, [
                        txt({ fontSize: 24, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.16em" }, "THEM"),
                        txt({ fontSize: 40, fontWeight: 900, color: COLORS.white, fontFamily: "monospace" }, String(oppRating)),
                    ]),
                    box({ display: "flex", alignItems: "baseline", gap: 16 }, [
                        txt({ fontSize: 24, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.16em" }, "YOU "),
                        txt({ fontSize: 40, fontWeight: 900, color: COLORS.zinc500, fontFamily: "monospace" }, String(ownRating)),
                    ]),
                ]),
            ]),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 16 }, displayName(name)),
            txt({ fontSize: 22, color: COLORS.zinc400 }, "I beat " + oppName),
        ]),
    ])
}

function toughestOpponentCard({ name, opponent, oppRating, ownRating, outcome }) {
    const oppName = opponent.includes(",") ? opponent.split(",").reverse().join(" ").trim() : opponent
    const outcomeColor = outcome === "win" ? COLORS.mint : outcome === "draw" ? "rgba(255,255,255,0.6)" : "#FF9B8E"
    const outcomeTag = outcome === "win" ? "AND I WON" : outcome === "draw" ? "AND I DREW" : "AND I LOST — MY TOUGHEST TEST"
    return cardBase(COLORS.black, "#EF4444", KNIGHT_URI, 680, "TOUGH", [
        topBar("TOUGHEST OPPONENT"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "MY TOUGHEST OPPONENT THIS SEASON"),
            txt({ fontSize: 280, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(oppRating)),
            txt({ fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginTop: 12 }, oppName),
            txt({ fontSize: 24, fontWeight: 900, color: outcomeColor, letterSpacing: "0.1em", marginTop: 8 }, outcomeTag),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 20 }, displayName(name)),
        ]),
    ])
}

function yourPeopleCard({ name, totalGames, uniqueOpponents, wins, losses }) {
    const draws = Math.max(0, parseInt(totalGames) - parseInt(wins) - parseInt(losses))
    return cardBase(COLORS.black, "#F59E0B", PAWN_URI, 600, "PEOPLE", [
        topBar("YOUR PEOPLE"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "PEOPLE I PLAYED THIS SEASON"),
            txt({ fontSize: 280, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(uniqueOpponents)),
            txt({ fontSize: 30, color: "rgba(255,255,255,0.35)", marginTop: 10 }, "people sat across a board from me"),
            box({ display: "flex", alignItems: "flex-end", gap: 36, marginTop: 20 }, [
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 74, fontWeight: 900, color: COLORS.mint, fontFamily: "monospace", lineHeight: 1 }, String(wins)),
                    txt({ fontSize: 26, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "WINS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 74, fontWeight: 900, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", lineHeight: 1 }, String(draws)),
                    txt({ fontSize: 26, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "DRAWS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 74, fontWeight: 900, color: "#FF9B8E", fontFamily: "monospace", lineHeight: 1 }, String(losses)),
                    txt({ fontSize: 26, fontWeight: 800, color: COLORS.zinc400, letterSpacing: "0.18em" }, "LOSSES"),
                ]),
            ]),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 16 }, displayName(name)),
        ]),
    ])
}

function colourStrengthCard({ name, whitePct, blackPct, stronger }) {
    const diff = Math.abs(parseInt(whitePct) - parseInt(blackPct))
    const caption = stronger === "neither" ? "I score equally with both colours — a rare balance"
        : "I'm " + diff + "pp stronger with the " + stronger + " pieces"
    return cardBase(COLORS.black, "#A855F7", KNIGHT_URI, 660, "COLOUR", [
        topBar("WHITE & BLACK"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 24 }, displayName(name)),
            box({ display: "flex", alignItems: "flex-end", gap: 48 }, [
                box({ display: "flex", flexDirection: "column", gap: 8 }, [
                    txt({ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }, "WHITE"),
                    txt({ fontSize: 222, fontWeight: 900, color: "#F5F5F5", lineHeight: 0.85, letterSpacing: "-0.04em", fontFamily: "monospace" }, whitePct + "%"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 8 }, [
                    txt({ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }, "BLACK"),
                    txt({ fontSize: 222, fontWeight: 900, color: "#E8A800", lineHeight: 0.85, letterSpacing: "-0.04em", fontFamily: "monospace" }, blackPct + "%"),
                ]),
            ]),
            txt({ fontSize: 26, color: COLORS.zinc400, marginTop: 16 }, caption),
        ]),
    ])
}

function degreesOfSeparationCard({ name, degrees, playerCount, chain }) {
    const chainParts = chain ? decodeURIComponent(chain).split("→") : []
    return cardBase(COLORS.black, "#8B5CF6", KNIGHT_URI, 700, "DEGREES OF SEPARATION", [
        topBar("DEGREES OF SEPARATION"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "I AM CONNECTED TO GM MICHAEL ADAMS BY"),
            box({ display: "flex", alignItems: "baseline", gap: 20, marginTop: 4 }, [
                txt({ fontSize: 280, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.06em", fontFamily: "monospace" }, String(degrees)),
                box({ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 12 }, [
                    txt({ fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.6)" }, "degrees of"),
                    txt({ fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.6)" }, "separation"),
                ]),
            ]),
            txt({ fontSize: 26, color: COLORS.zinc400, marginTop: 8 }, "Like Six Degrees of Kevin Bacon — but every link is a real over-the-board chess game"),
            chainParts.length > 0
                ? txt({ fontSize: 15, color: "rgba(255,255,255,0.22)", marginTop: 10, letterSpacing: "0.03em" }, chainParts.join(" → "))
                : txt({ fontSize: 20, color: COLORS.zinc400, marginTop: 10 }, "via " + playerCount + " Bristol & Districts players"),
            txt({ fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 14 }, displayName(name) + " · Bristol & Districts"),
        ]),
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
            const currentRating = parseInt(p.get("currentRating") || p.get("rating") || "1500")
            const yearAgoRating = parseInt(p.get("yearAgoRating") || p.get("year_ago") || "1500")
            element = ratingJourneyCard({
                name: p.get("name") || "Bristol Player",
                currentRating,
                yearAgoRating,
                change: parseInt(p.get("change") || String(currentRating - yearAgoRating)),
                domainLabel: p.get("domain") === "rpd" ? "Rapid" : p.get("domain") === "btz" ? "Blitz" : "Standard",
            })

        } else if (moduleName === "season_scoreboard") {
            element = seasonScoreboardCard({
                name: p.get("name") || "Bristol Player",
                played: parseInt(p.get("played") || "0"),
                wins: parseInt(p.get("wins") || "0"),
                draws: parseInt(p.get("draws") || "0"),
                losses: parseInt(p.get("losses") || "0"),
                scorePct: p.get("scorePct") || p.get("score_pct") || "0",
            })

        } else if (moduleName === "in_good_company") {
            element = inGoodCompanyCard({
                name: p.get("name") || "Bristol Player",
                drawRate: parseInt(p.get("draw_rate") || "0"),
                gmName: p.get("gm_name") || "Bobby Fischer",
                gmDrawRate: parseInt(p.get("gm_draw_rate") || "29"),
            })

        } else if (moduleName === "giant_killing") {
            element = giantKillingCard({
                name: p.get("name") || "Bristol Player",
                opponent: p.get("opponent") || "Unknown",
                ownRating: parseInt(p.get("own_rating") || "1500"),
                oppRating: parseInt(p.get("opp_rating") || "1500"),
                differential: parseInt(p.get("differential") || "0"),
            })

        } else if (moduleName === "toughest_opponent") {
            element = toughestOpponentCard({
                name: p.get("name") || "Bristol Player",
                opponent: p.get("opponent") || "Unknown",
                oppRating: parseInt(p.get("opp_rating") || "1500"),
                ownRating: parseInt(p.get("own_rating") || "1500"),
                outcome: p.get("outcome") || "loss",
            })

        } else if (moduleName === "your_people") {
            element = yourPeopleCard({
                name: p.get("name") || "Bristol Player",
                totalGames: parseInt(p.get("total_games") || "0"),
                uniqueOpponents: parseInt(p.get("unique_opponents") || "0"),
                wins: parseInt(p.get("wins") || "0"),
                losses: parseInt(p.get("losses") || "0"),
            })

        } else if (moduleName === "colour_strength") {
            element = colourStrengthCard({
                name: p.get("name") || "Bristol Player",
                whitePct: parseInt(p.get("white_pct") || "50"),
                blackPct: parseInt(p.get("black_pct") || "50"),
                stronger: p.get("stronger") || "neither",
            })

        } else if (moduleName === "degrees_of_separation") {
            element = degreesOfSeparationCard({
                name: p.get("name") || "Bristol Player",
                degrees: parseInt(p.get("degrees") || "0"),
                playerCount: parseInt(p.get("player_count") || "0"),
                chain: p.get("chain") || "",
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
