// /api/og.js — Bristol Chess Hub OG image generation
// All assets embedded as base64 — no external fetches needed.
// Chess pieces: Lichess cburnett set (white pieces, MIT licensed).
// Satori rules: display:flex on every multi-child container.

const W = 1200
const H = 630
const LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNjEuMjQ0bW0iIGhlaWdodD0iMzYxLjI0NG1tIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2Y3ZjcwMzt9LmNscy0ye2ZpbGw6I2ZmZjt9LmNscy0ze2ZpbGw6I2Y1YjQwMjt9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMzc1LjY5OCw3MjYuNjA4Yy0xMC4xNjIsOC4wNzgtMTguNjU5LDE0Ljg1Mi0yMC45ODEsMjcuMTY2LTEuNzQ1LDkuMjU0LDIuNzE2LDE4LjQ1MywxMC40NjYsMjQuMjY5bDI4Mi4zMy0uMDI1YzkuNDQ2LTQuMTAxLDE0LjE4LTE2Ljc5OSwxMS40MDEtMjUuODI2LTEuMTQtMy43MDItMS45NzYtNy40MTQtNC41NTctMTAuNjE3LTExLjEyMy0xMy44MDUtMjYuOTExLTE5LjkwNS0zMy42NS0zNi4zODMtMS41ODktMy44ODUtLjk3NC05LjQ3OS0uMTcxLTEzLjc0Ny43MTMtMy43ODcsOC4wNzItMS41MjYsMTAuMDY4LTEwLjMwMywxLjAwMy00LjQwOS0uNTY4LTExLjI3My02Ljc2My0xMS4yNzJsLTIzNC41NDIuMDM5Yy0zLjgzMy45MDUtNi4xMzMsNS45OTUtNi40MTUsOC42NTMtLjc3Nyw3LjMzOSw5LjQwMSwxMC4yNTIsMTAuNTAyLDEzLjkwNiw0LjAyMiwxMy4zNTQtNi43NCwyNS40MzUtMTcuNjg4LDM0LjEzOVoiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0zNDYuMjY4LDgwMC41NjRjLTEuNzU4LDcuMTM5LDIuNjQ3LDE4LjMzNSwxMS45MzUsMTguMzM4bDI5Ni4xMS4xMThjOS4wMjcuMDA0LDEzLjk2Mi03LjM4MiwxMy44NzQtMTUuMDMxLS4wOTMtOC4wMDItNS42NzYtMTQuOTgtMTQuNDA1LTE0Ljk4aC0yOTQuMjcyYy03LjI5LDEuMjY2LTExLjQ4Niw0LjQyNS0xMy4yNDIsMTEuNTU1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTY1OC45MTQsNzUyLjE5MmMyLjc4LDkuMDI3LTEuOTU1LDIxLjcyNS0xMS40MDEsMjUuODI2bC0yODIuMzMuMDI1Yy03Ljc1LTUuODE2LTEyLjIxMS0xNS4wMTUtMTAuNDY2LTI0LjI2OSwyLjMyMi0xMi4zMTQsMTAuODE5LTE5LjA4NywyMC45ODEtMjcuMTY2LDEwLjk0OS04LjcwNCwyMS43MTEtMjAuNzg2LDE3LjY4OS0zNC4xMzktMS4xMDEtMy42NTUtMTEuMjgtNi41NjctMTAuNTAyLTEzLjkwNi4yODItMi42NTgsMi41ODItNy43NDgsNi40MTUtOC42NTNsMjM0LjU0Mi0uMDM5YzYuMTk1LS4wMDEsNy43NjYsNi44NjMsNi43NjMsMTEuMjcyLTEuOTk2LDguNzc3LTkuMzU1LDYuNTE2LTEwLjA2OCwxMC4zMDMtLjgwMyw0LjI2OC0xLjQxOCw5Ljg2Mi4xNzEsMTMuNzQ3LDYuNzM5LDE2LjQ3OCwyMi41MjcsMjIuNTc4LDMzLjY1LDM2LjM4MywyLjU4MSwzLjIwMywzLjQxNyw2LjkxNSw0LjU1NywxMC42MTdaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjU0LjMxMyw4MTkuMDJsLTI5Ni4xMS0uMTE4Yy05LjI4OC0uMDA0LTEzLjY5Mi0xMS4xOTktMTEuOTM1LTE4LjMzOCwxLjc1NS03LjEzLDUuOTUxLTEwLjI4OSwxMy4yNDItMTEuNTU0aDI5NC4yNzJjOC43MjksMCwxNC4zMTMsNi45NzgsMTQuNDA1LDE0Ljk3OS4wODksNy42NDktNC44NDcsMTUuMDM1LTEzLjg3NCwxNS4wMzFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTE5LjA2NywyNDAuMTUxYzkuNTQxLDkuNzQ4LDEwLjI5OCwyMS4yNTEsMTYuMjkyLDIyLjYyNiwxNi4zNjMsMy43NTQsMzIuMjc2LDEyLjg5Myw0NS43MzgsMjMuMTQzLDI3LjI0OSwyMC43NDksNDQuOTA2LDUwLjc1LDUwLjEyOCw4NC42NDhsMi42MjksMjIuNDA1LjA0NSwyNi4wOTVjLTMuMTQ0LDYwLjAwNC0zNS41NzcsMTA3LjI4OS03Mi4yMDgsMTUyLjU5My0uOTA4LDMuMzEyLDEuMzI5LDguMTMzLDIuMDg2LDExLjM4NGwzLjgwOCwxNi4zNTljLjMwMywxLjMwMS43NzQsMi43Ni4wNTEsMy43MjktMS4zMzIsMS43ODYtOS45OTYtMS45NzQtMTEuNjU4LDYuMzM0LS43NTIsMy43NTYsMy4yNyw1Ljk1NCw2LjQ2Miw3LjQzNiwyLjg3LDEyLjM3Mi0zLjIwNCwyNy45NDksNS42NzEsMzQuMjMzLTIuNjcxLjk1Ny01Ljc2NCwxLjkxOS05LjA0OSwyLjA5NWwtMTEuMTczLjU5OS02MS40NDktLjIwMy0yNi40NzMtLjIwMWMtOS44MTUtLjA3NS0xOS4xNTctLjI0NC0yOC45ODguMDEybC0xOS4xNjcuNDk5Yy0yLjE0OS4wNTYtNy4yOTMuNzE5LTguNzQ3LTEuOTEzLTEyLjQ3OS0yMi41ODEtMjAuMjM5LTQ0LjcxMS0xNi43MjMtNzAuODQsMS44NjItMTMuODM1LDEwLjAyNC0zMC45NzEsMTkuMTk1LTQxLjU4N2w5LjMwOC0xMC43NzUsMzUuODAyLTM3LjExNSw3LjExNy04Ljk2MWM1LjkxOC03LjQ1MiwxMC4yNjQtMTUuOTEzLDE0LjEwMi0yNC44ODkuNjc1LTEuNTc5LS45MzctNi4xNjcsMi4xMDQtNy4wMzgsMjEuNDU3LTYuMTM4LDMyLjQyMi0xNC4xMTQsNDYuODY1LTMxLjA5NiwzLjM5OC0zLjk5NSw0LjgyNS05LjgyOCw3LjI2OS0xNC41NzNsMi4zNTItOS42NTZjLjgxMy0zLjM0LDEuNjk3LTQuNDgxLDEuMDA3LTcuOTkxLS45MTctNC42NjgtLjU0Ni05LjUxMy0yLjExMy0xNS4yNjgtMy4xLDEwLjc0NS02LjkyOSwyMS42MDctMTMuNTkxLDMxLjM5Ny0zLjYyMSw1LjMyLTkuNjM3LDEyLjk3Ny0xMy45MjYsMTYuMzM2LTEyLjAwNyw5LjQwMi0yNy42MDMsMTguMDQ0LTQyLjc4LDE2Ljk2bC0xMy45MDItLjk5M2MtNS40NTQtLjM4OS04LjQzMS0uMzc5LTEyLjg2OCwyLjQ2N2wtMTguMjYsMTEuNzExYy00LjA1OCwyLjYwMi04Ljc3Nyw1LjQ4NS0xMC45MzMsOS44OTNsLTguMTYsMTYuNjgxYy0xLjU3MywzLjIxNS0zLjY5Nyw0LjI1OC02LjA5Niw2LjIzOC02Ljk1MSw1LjczOC0xNS4yMjcsNy44MjQtMjQuMiw1LjY2MS0zLjYzNS0uODc2LTguODg1LS4zMzEtMTEuMTUyLTQuMzk2bDIxLjI0NC0yMi4yOTNjMi4xMzEtMi4yMzcsMy4yMDgtNS44MzYsNC40NzQtOS4xNjUtNS4xNjctMS4xNzItNy44LDMuNzI1LTEwLjk4MSw2LjM1LTIuMzY0LDEuOTUtNS4wNzUsMi43NTMtNy4zMSw0Ljg2Mi01LjE3OCw0Ljg4Ni0xMS45NDksNy40OTktMTguMDE2LDEwLjkxNS0yLjk4NiwxLjY4MS00LjQ5NywxLjUyMi03LjY2My0uMTMyLTQuMjk3LTIuMjQ1LTExLjE2NC0zLjI1OC0xMy45NjEtNy44MDMtMy4zODItNS40OTQtMi42MTQtMTIuNzEtMy4yODQtMTguOTM2bC0yLjU2OC0yMy44NjNjLS43NTEtNi45NzMsNS4wNTgtMTAuODk3LDguODM3LTE1LjgzM2w2LjUwOC04LjVjNC45ODgtNi41MTUsMTAuNDAyLTExLjk0MywxNi4wMDUtMTguMDM1LDEuOTA3LTIuMDc0LDMuNjc2LTUuMTc3LDUuNDI0LTcuNDkxLDMuMzQ5LTQuNDMzLDcuMDUtOC4wOCwxMC40ODItMTIuNTI1bDYuNTc2LTguNTE2YzIuMjIxLTIuODc3LDQuMzgtNi4xMDksNi43MjktOS4yMjcsMy43MzMtNC45NTMsOC4zMTMtOS43MjUsOS41Ny0xNi4xMDZsMS43OTQtOS4xMDdjMS4wODktNS41MjcuNzQ1LTExLjQ2Miw0LjQ4OS0xNS44MTIsMTEuOTY0LTEzLjkwMSwzNC40MjctMjIuNjI4LDM1LjcyMy0yNS42NjIuMzc3LS44ODItLjc0Mi0xLjk1NS0uOS0yLjg2MWwtMS40ODgtOC41NTEtNS43MzYtMjAuNjY3Yy0uOTYtMy40NTgtMS4yMjEtNi41MTctMS45MjItMTAuMDU3cy0yLjgyNC03LjEyLTEuMjU3LTEwLjk5NmMyLjczNC0xLjQyNiw1LjQxOC44MzEsNy44OTEsMS4xNDksOC44MzEsMS4xMzQsMTYuMjE4LDUuMTYsMjMuMjc3LDEwLjA3OGw0Ljc0MiwzLjMwNGMzLjY0NCwyLjUzOCw3Ljc3MiwzLjk2NiwxMC45NTMsNy4yMSwyLjUyOCwyLjU3OSw1LjMzOCw0LjQ0Miw4LjkyMyw2LjQwN2wtLjQ3Ny0xMS4wOTljLTEuNDYzLTUuMTc2LTEuMzA0LTkuOTM0LTEuOTg4LTE1LjE4MS0uODk1LTYuODY2LTMuMjAyLTEzLjU4OS0uOTQ0LTIwLjgyOCwyMy41OTYsNS4yODIsMzUuNjI5LDE5LjgwMSw1MC40NDIsMzQuOTM1Wk00NTIuNjM3LDMzMC4wNThjNC43NzYtNC43MjUsMTIuMjM2LTMuNzI2LDE1LjkxNy04LjIxMy0yLjYzMi0uNjgzLTUuMDQyLTEuNjA5LTcuNTI3LTEuNTc1bC0yOS45MTUuNDA3Yy05LjgwNi4xMzMtMTcuNTY5LDkuMzA0LTIyLjEzMywxOC42ODNsOC43MDguNjI2YzQuNTE3LDIuNTYyLDguMjQxLDMuNzMyLDEyLjk4Nyw0LjQxMSwxMC40MjksMS40OTQsMTkuMTgxLTMuNjA2LDIxLjk2My0xNC4zMzhaTTM0NC4xODcsNDM2Ljg1OGM0Ljc5My0xLjAxNCw1LjYyNy00Ljc5OCw1LjkyOS04Ljg1My4zMTUtNC4yMzEtLjg3NC03LjkyMi01LjYzMS04LjU3MS04Ljk5OC0xLjIyOS0xNi4yNiw3Ljk3NS0xMy45NzYsOS41OCwyLjExOSwxLjQ4OSwxMC4wODgtMS44MzQsMTMuNjc3LDcuODQ0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTM0NC4xODcsNDM2Ljg1OGMtMy41OS05LjY3Ny0xMS41NTktNi4zNTUtMTMuNjc3LTcuODQ0LTIuMjg1LTEuNjA2LDQuOTc4LTEwLjgwOSwxMy45NzYtOS41OCIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTU2OC4xMSw2NTEuMTM2Yy04Ljg3NS02LjI4NC0yLjgwMS0yMS44NjEtNS42NzEtMzQuMjMzLTMuMTkyLTEuNDgyLTcuMjE0LTMuNjc5LTYuNDYyLTcuNDM2LDEuNjYyLTguMzA4LDEwLjMyNi00LjU0OCwxMS42NTgtNi4zMzQuNzIzLS45Ny4yNTItMi40MjgtLjA1MS0zLjcyOWwtMy44MDgtMTYuMzU5Yy0uNzU3LTMuMjUyLTIuOTkzLTguMDczLTIuMDg2LTExLjM4NCwzNi42MzEtNDUuMzA0LDY5LjA2NC05Mi41ODksNzIuMjA4LTE1Mi41OTNsLS4wNDUtMjYuMDk1LTIuNjI5LTIyLjQwNWMtNS4yMjItMzMuODk4LTIyLjg3OC02My44OTktNTAuMTI4LTg0LjY0OC0xMy40NjEtMTAuMjUtMjkuMzc1LTE5LjM4OS00NS43MzgtMjMuMTQzLTUuOTkzLTEuMzc1LTYuNzUtMTIuODc4LTE2LjI5Mi0yMi42MjYtMS4zMzYtMS45MjIsNS4yNjUtNC4wMTgsNi45MjgtMy44MzYsNS43NjcuNjMsMTkuNzM0LTQuNDgsMzYuOTctMS44MzNsMTUuNTU5LDIuMzg5YzIxLjQyLDMuMjksNTcuMzQzLDE4LjcwMiw3MS4xNDIsMzIuNDMxbDI1LjYwOSwyNS40ODFjMS45NDcsMS45MzcsMy43NDUsNS4xOTYsNS4yMjUsNy41OTlsOS44NiwxNi4wMTJjNi42MTEsMTIuOTIzLDEyLjQwOCwyNS42NTgsMTUuMDU0LDQwLjAzNmwxLjk4NywxMC43OTQsMi4xODEsMTcuMDEyYy41NTQsNC4zMjQuNTY1LDEwLjA4NS0uMTgyLDE0LjMyNS0xLjA2Niw2LjA1NC0uNjU2LDExLjQ4Ni0yLjAxNCwxNy4zODFsLTIuMDE3LDguNzUyYy00LjM4MiwxOS4wMTktMTIuMDcyLDM2LjU4LTIzLjE2Myw1Mi41MTFsLTEzLjEyNCwxOC44NTFjLTEuNzMsMi40ODUtMy4yNyw0LjM5LTUuMTQ4LDYuOTYzbC01LjQyOCw3LjQzNy0xNC42OTIsMjEuNDQ2Yy04LjcxLDEyLjcxMy0xNi4yLDI1LjkzNS0yMC4yMjEsNDEuMDM1LS45MjMsMy40NjQtMS4zMDMsNi40NS0yLjI0NCw5LjgwOGwtMi4wMTEsNy4xNzJjLS45MDcsMy4yMzYtMy4zNTMsOC44NDQtLjM4MSwxMS45MzYsMi4zMjYuMjMsNi40NzYtLjY5NSw4LjM5NSwyLjA5MSwxLjI3LDEuODQ0LDEuOTMsNC4wNzguNDYxLDcuMjU0LS43ODUsMS42OTctMy40NjUsMi42ODgtNS43MTgsMy45MzZsLS43MDYsMjcuMjA5Yy0uMTMsNS4wMS00LjU5Miw5LjI0OC05LjY0Nyw5LjI4MWwtMzguNjMuMjQ4Yy0xLjczOS0uMjIzLTMuODY3LTEuOTI1LTUuMDA0LTIuNzNaTTYwNi42MjYsNjAzLjU1N2w3LjExLTI5LjMwNi00Mi4yMDYuMDE5LDYuODM5LDI5LjcwMiwyOC4yNTctLjQxNloiLz48L3N2Zz4="

const KNIGHT_URI = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZmRmY2ZjO30uY2xzLTJ7ZmlsbDojYmVlYzA3O308L3N0eWxlPjwvZGVmcz48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjcxMS4xNDYiIHk9IjM1Mi4xNDYiIHdpZHRoPSIuNzA3IiBoZWlnaHQ9Ii43MDciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00MC44NjIgNjA2LjM1MSkgcm90YXRlKC00NSkiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00NDEuOTIsMjUyLjMyNGMxLjg4MywxLjQyMiwzLjIzNywzLjgxLDUuMDkzLDUuNDYzbDUuMDMzLDQuNDg2Yy43MjEsOC41MDIsNy42MDIsOS4yNTIsNi4zMDksMTIuNzU1LDEuNTM0LDEuNzA5LDQuNTE0LDUuNDg5LDYuNzU2LDYuMzdsMTAuMTQ3LDEuODNjMy4yMjQuNTgxLDUuOTAzLDEuNjQ5LDguODA3LDIuMjc2LDQuNTA1Ljk3Myw5Ljc0OSwxLjMwNywxNy40MzIsMy44MjNsNS4xOTcsMS43MDJjMy42OTcsMS4yMTEsNi41MTYsMi41NzIsMTAuMDE4LDQuMTAyLDYuNDY3LDIuODI2LDEzLjI4NSw0LjY3NCwxOC44MjEsOS4yOTlsNy44NDEsNC4xOThjMi40NzgsMS4zMjcsNC4yODYsMi45MzEsNi41NjMsNC40ODlsNS40MjEsMy43MDhjMi4xNTcsMS40NzYsNS4xNjIsMi44NTYsNy4wNTIsNC43NTdsMjguODgxLDI5LjA1YzIuMDE1LDIuMDI3LDYuNzc5LDkuODUyLDkuODY0LDE0LjEwN2wzLjgxNyw1LjI2NSwxMC41OTksMjEuMzI0LDIuODQ0LDcuMzU1LDcuNTY4LDIyLjI3M2MuODc3LDIuNTgyLjA5LDQuNjY4LDEuOTY0LDcuNDFsLjQ1Niw3LjUwMWMxLjM5OSwzLjI5NSwyLjM0NSw2LjQ0NCwxLjY4NSwxMC4wODItLjc2OSw0LjIzNiwxLjUwOSw3LjUzNywxLjU1OSwxMS4yMTZsLjM1MSwyNS43MTMtMS43Miw0LjI3My0uNTgxLDE0Ljg3Yy0uMTI0LDMuMTY0LTIuNTE4LDYuMTktMS40OTksOS45NTQuNzQyLDIuNzQzLTIuMTM0LDEyLjgyNy0zLjU5OCwyMC4xODRsLTEuOTg5LDkuOTkyLTEuOTU4LDkuOTg0Yy0xLjcyMiw4Ljc4MS00LjYyNiwyNC44NDgtNi40MTgsMjguMDhsLS4zNDUsOC42MTZjLTEuNDYxLDMuNDk3LTIuNjQ1LDcuMzMtMS42MzcsMTEuMDU2LjkyOSwzLjQzNC0xLjc3NCw1Ljc5Ni0xLjc2OSw4LjI0M2wuMDU3LDMyLjY1NGMuMDA0LDIuMjQyLDMuMDU4LDQuOTc0LDEuNzQ1LDguMjkzLS44MjUsMi4wODYsMS42MDUsMTEuMzYzLDMuNTEsMTcuMDYxbDIuNTkxLDcuNzQ4LDYuODUsMTMuOTg2Yy03LjA5OCwxMS4wMzktNi4wNzUsMjUuODI0LDMuNjE4LDM1LjQ2M2wyMC45MzcsMjAuODIyYzguMzk5LDguMzUzLDEyLjEsMjAuMTI0LDkuMTcxLDMxLjc2Ni0xLjkwMSw3LjU1OC02LjEyNiwxMy4zMzQtMTAuNDI0LDE5LjksNC4wNjMuMSw3LjY1OS0uNjQ3LDEwLjc4NS44NjgsNS4wNCwyLjQ0Miw1LjkyOCw4LjE0Niw1Ljc2NSwxMy4yNTEtLjIwNyw2LjQ1Ny0zLjQwNCwxMS4wMTMtMTAuMjkxLDExLjAxMWwtMjk5LjQ2LS4wODdjLTYuMzk2LS4wMDItOS4wOTktNi43MjMtOS4yODMtMTEuNzI2LS4xOS01LjE2NCwxLjIxNS05LjE5Nyw0LjUxMy0xMS4zNzEsMy44MzgtMi41MzEsOC4yMi0yLjMyMSwxMi4zNzctMS41NTRsLTUuODUxLTkuMjQzYy04LjY2Mi0xMy42ODQtNi43NjQtMzAuMDI0LDMuODgxLTQyLjA0NmwxNy42ODQtMTcuMjAxYzI1LjIyMS0yNC41MzIsMy4wMS0zOS41NzYtLjk2OS03Ny42NzMtMi42NzEtMjUuNTcyLDMuMzU3LTQ2LjkxNywxNi45NDctNjguNDAxLDcuNTE5LTExLjg4NywxNS44NzItMjIuMzAxLDI1LjI0OS0zMi43NDdsMzUuNDYzLTM5LjUwM2MxNy42NDMtMTkuNjU0LDM2LjEwNS00Ny4yNTksMjUuODExLTcyLjc5My0uNDM0LTEuMDc3LTIuMzUuNTYxLTMuMDE5LDEuNTM1LTEyLjYyNywxOC4zODQtMzMuOTEzLDI3LjUzOS01Ni4xOTYsMjQuOTgyLTMuNzM5LS40MjktOC45NC0yLjQ1NS0xMi4yMzYtLjMzbC0zNS4yNzYsMjIuNzQzLTYuMzg3LDE4LjM2NmMtMi41OTMsNy40NTctOS40ODYsMTEuMjQ3LTE3LjEwMSwxMi4yNjUtOC41ODUsMS4xNDgtMTkuMjA2LDMuMTQ2LTIwLjk4OC0uODI5LS42NDctMS40NDMuMDE5LTMuMDc4Ljg2My00LjQxMWw3LjEzOS0xMS4yODItMTUuMzM0LDkuMDM2Yy0zLjI0NCwxLjkxMS03Ljg0Ny41NzYtMTAuODc2LTEuNDQybC0xMy44MTMtOS4yMDJjLTMuNDY4LTIuMzEtNC43MjUtNi42NTktNS4yMzItMTAuNzY5LTEuMDY5LTguNjU1LTIuNTE3LTE2Ljg4NC00LjY5My0yNS4zMTMtMS4yNTgtNC44NzQuMTAyLTguOTY0LDMuMTA1LTEzbDYwLjg5MS04MS44MjVjNS40NzctNy4zNiw1LjgzNi0xNy4zMjIsNi45ODgtMjUuODk2Ljg1Ni02LjM2OSwzLjE0Mi0xMC41NzUsNy43OTYtMTQuNTc4bDM5LjY5NS0zNC4xMzhjMy4yNS0yLjc5NSw1LjIzOC00LjU3Myw0LjAwMS05LjE4Ni00LjExMy0xNS4zMzctNy42MTQtMzAuNjE3LTEwLjc2My00Ni4yNzYtLjMxOS0xLjU4OCwxLjE4OS0yLjc5LDIuMDA3LTIuODk0Ljc4NC0uMDk5LDEuOTUtLjEwMiwzLjEwMi4xMDgsMTQuMDMxLDIuNTUzLDI2LjA3LDkuNzM0LDM3LjA4NywxOC4wNDlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjI1LjIzNyw2ODcuODczbC02Ljg1LTEzLjk4Ni0yLjU5MS03Ljc0OGMtMS45MDUtNS42OTgtNC4zMzUtMTQuOTc1LTMuNTEtMTcuMDYxLDEuMzEzLTMuMzE5LTEuNzQxLTYuMDUxLTEuNzQ1LTguMjkzbC0uMDU3LTMyLjY1NGMtLjAwNC0yLjQ0NywyLjY5OS00LjgwOSwxLjc2OS04LjI0My0xLjAwOS0zLjcyNi4xNzYtNy41NTksMS42MzctMTEuMDU2bC4zNDUtOC42MTZjMS43OTItMy4yMzEsNC42OTUtMTkuMjk5LDYuNDE4LTI4LjA4bDEuOTU4LTkuOTg0LDEuOTg5LTkuOTkyYzEuNDY0LTcuMzU3LDQuMzQtMTcuNDQxLDMuNTk4LTIwLjE4NC0xLjAxOC0zLjc2NCwxLjM3Ni02Ljc5LDEuNDk5LTkuOTU0bC41ODEtMTQuODcsMS43Mi00LjI3My0uMzUxLTI1LjcxM2MtLjA1LTMuNjc5LTIuMzI4LTYuOTgtMS41NTktMTEuMjE2LjY2LTMuNjM5LS4yODYtNi43ODctMS42ODUtMTAuMDgybC0uNDU2LTcuNTAxYy0xLjg3NS0yLjc0Mi0xLjA4Ny00LjgyOC0xLjk2NC03LjQxbC03LjU2OC0yMi4yNzMtMi44NDQtNy4zNTUtMTAuNTk5LTIxLjMyNC0zLjgxNy01LjI2NWMtMy4wODUtNC4yNTUtNy44NS0xMi4wODEtOS44NjQtMTQuMTA3bC0yOC44ODEtMjkuMDVjLTEuODkxLTEuOTAyLTQuODk1LTMuMjgyLTcuMDUyLTQuNzU3bC01LjQyMS0zLjcwOGMtMi4yNzctMS41NTgtNC4wODYtMy4xNjItNi41NjMtNC40ODlsLTcuODQxLTQuMTk4Yy01LjUzNi00LjYyNS0xMi4zNTQtNi40NzMtMTguODIxLTkuMjk5LTMuNTAyLTEuNTMtNi4zMjEtMi44OTItMTAuMDE4LTQuMTAybC01LjE5Ny0xLjcwMmMtNy42ODItMi41MTYtMTIuOTI3LTIuODUtMTcuNDMyLTMuODIzLTIuOTA0LS42MjctNS41ODMtMS42OTUtOC44MDctMi4yNzZsLTEwLjE0Ny0xLjgzYy0yLjI0Mi0uODgxLTUuMjIyLTQuNjYtNi43NTYtNi4zNywxLjI5My0zLjUwNC01LjU4OC00LjI1My02LjMwOS0xMi43NTUsMTMuMTUsMS4yODIsMjYuNTcsMi4wNjMsMzkuNDk3LDYuMTkyLDIuODg4LjkyMyw1LjIwNywzLjQ1NSw5LjAzOSwzLjExMy45MjUtLjA4MiwyLjc4LDEuNDMzLDMuNTY4LDEuMDQ2LDEuMDU3LS41MTcsMS45MDItMS44MDEsMi4zNTItMy4yMDNsMTQuNjQtNDUuNTk2Yy05Ljk5NSw5LjQxOS0yMC4xNjMsMTUuOTA3LTMyLjI4MiwyMC45NjItMy44OTMsMS42MjMtNy4yOTksNC4yMTgtMTEuODgyLDQuMDQ1LTEwLjQ4LDQuOTc2LTIxLjQzOCw1LjEyMi0yOS45NjYsOC45NTQtMS44NTUtMS42NTQtMy4yMDktNC4wNDItNS4wOTMtNS40NjMsMi41MjkuOTU2LDUuNTA0LTIuMDU2LDcuODU2LTIuMDQ5LDQuMjI2LjAxMiw2LjU3Ni0xLjA5LDEwLjMzLTEuOTNsNi40OTYtMS40NTNjMy43MzYtLjgzNiw2LjU1Ny0yLjc4MywxMC4wODEtNC4wMTMsMy41NjgtMS4yNDYsNi40NDUtMi4yNzQsMTAuMDg0LTQuMTYyLDIuODE2LTEuNDYxLDcuNDE1LTEuMjAzLDkuNy00LjM5MywxLjE5NC0xLjY2OCw3Ljk0MS00LjU5NiwxMC44NTYtNy4xNDVsMTEuMDEtOS42MjljMi4wNzUtMS44MTUsMy4yNTMtMi40LDQuNTE4LTQuNzk5LDEuNDcxLTIuNzg5LDIuMTkzLTUuNTYxLTEuMDY4LTcuODU3LDMuMTUtMy45OTQsOC4zNTEtNC4xODEsMTIuMTA4LS40NjIsMy43MzctMS4wNjcsNy4zMzYtLjksOS45MjgsMi4xMDcsNC4wNjEtMS42NzUsNi42OTEsMCw5Ljg5Ny45NzgsMi4zODMuNzI3LDUuMzM0LjIxNyw3Ljg5NSwxLjk3Ni40MTcsMS45NjQtMi4wMTQsMy4xNTEtMy4wNjMsNS4wNTQtMS4yMjIsMi4yMTctMS4wNDgsNi42ODEuMDI2LDguODRsMTUuNjk5LDMxLjUzNmM4LjI3LDE2LjYxNCwxOS4xNDYsMzEuMzIxLDMxLjI3MSw0NS41NTgsMTAuNjk1LDEyLjU1OSwyMy4xMDUsMjMuMDE3LDM2LjkzNywzMS45OTVsMTEuMzA5LDUuODI4YzcuMjY1LDUuMjQyLDIxLjI2MiwxMS4xNTgsMzAuOTAyLDE0Ljc2NywzLjgzNCwxLjQzNSw3LjQ5NCwzLjQ3NywxMS42MTMsNC41MTFsNi43OTksMS43MDhjMi41MDYuMTcyLDUuOTQ1LTIuNzg1LDUuNzM4LTQuOTk4bDUuNTIzLjQ0NSw3LjcxMiwxNi4xMiw1LjMwNiwxMi4xNzFjLTIuODM5LS4zNzEtNy4xODUtMS43MTctOS4xODYuMjI2LTIyLjg1NiwzNy40NTItMzQuOTA2LDgwLjU4Ni0yMC42MTQsMTIzLjY5OGwxNy41NDQuMDQ1YzEuMzc3LDMuMTI2LTIuNjI4LDMuODIxLTMuMzI5LDUuNTY0LTEuNDMyLDMuNTYxLTEuODMzLDkuNjUyLS4xOTEsMTIuOTQ2LDQuNzg0LDkuNTk1LDE5LjM2OCwxNS43NjcsMTMuODk2LDIyLjUwNWwtMTMuMTMzLTEzLjI4NWMtMS4yMDUsNC4yMzQuMzM1LDcuNDAyLjgyNywxMS4wNDJsNS43MDQsNDIuMTc1LDMuMDAyLDM4Ljk3MSwxMy44NTEuMTY3Yy45ODkuOTYxLjQ2NCw0LjM1MS0uOTE4LDQuNzM0LTE4LjY3Myw1LjE2OC0zNi40OTEsMTAuNTMzLTU0LjUyMSwxNy40NjMtMTYuMzk1LDYuMzAxLTMxLjExMSwxNC40MjEtNDQuNjQzLDI1LjM1Ny0zLjEzMywyLjUzMi02LjIyNCw0LjQ4My03LjA1Miw4LjY5LS4zOTIsMS45OTEtMS43MzcsMy42NzQtMy4zODMsNC41NDlaTTUzNi4zNCwyMTMuODUzYy0xLjIzOSwxLjAwOS0xLjM4MiwyLjg3My0xLjAwMyw0LjQzNi41MTMsMi4xMTQsOC4xMiwyLjc0Niw4LjcyLDIuMjQ2LDEuMTEtLjkyNSwxLjE5OS0yLjY5NCwxLjEyLTQuMDctLjEwMi0xLjc4My02LjgyLTQuMjU1LTguODM3LTIuNjEzWk01MzUuMDU4LDI1NS4wMDZjMS40NDUsMS40NDUsMy40OTksMS4yNCw0LjkxMi40MjMsMS4wMjEtLjU5LDEuODY3LTE0LjQzMy0uMDU1LTIxLjU1MS0uMzgyLTEuNDEzLTIuOTY2LTEuNzQ4LTMuOTk1LTEuNDEtNC4wMjMsMS4zMjMtNy40MDcsMTEuNTA5LTkuNDI1LDE4Ljc3NS0xLjI1LDQuNTAyLDUuOTk2LDEuMTk2LDguNTYzLDMuNzYyWk01NTQuODA5LDI5Mi43NTVsOS4yNDctNDAuNjljLjY5My0zLjA0OS0uNTExLTUuODgxLTEuOTIyLTguMTU3LTIuNTE3LTQuMDU5LTIuNzM5LTguNDQ0LTYuNzgzLTEyLjY5Mi4wNzMsOC45MTgtMS4yMiwxNy4wOS0yLjAwNSwyNS43NS0uNTgsNi4zOTQtLjI4MiwxMi41NTgtMS4xNTksMTkuMDA1bC0xLjY2MywxMi4yMzFjLS4zNjIsMi42NjMsMi40MTcsNS44OTUsNC4yODYsNC41NTNaTTU2Mi41OTYsMjk4LjU1M2wxMS4yNTItMzMuOTgzLTcuMzc4LTExLjc5OS05LjYxOSw0Mi41NDljMi4yNDEsMS41NTMsMy42MDEsMy42MTQsNS43NDQsMy4yMzNaTTUzNS42NTksMjgzLjA5NmwzLjM1My0xOS4yODVjLTIuNTM2LTQuMDQtMTEuMzg1LTcuMjQ0LTE0LjUzNy0yLjU3NC0yLjg5Myw0LjI4Ni0yLjQ0OCwxMC42NTEtMy45NiwxNS43MDNsMTUuMTQ0LDYuMTU2Wk01NjUuMzY1LDMwMC43MmMuMzYxLDEuODEsMy42ODksMy43OTgsNS4yODUsMy4wOTRsMTAuNTEtMjUuNTVjLTEuNDgzLTMuOS0zLjA0LTYuOTE2LTUuNi0xMC4zMzgtMi41NDIsNS42MjItMy40OTMsMTEuNDY5LTUuNDA1LDE3LjM3NGwtMS43NjYsNS40NTRjLS45OTQsMy4wNzEtMy43NDYsNi4zNDktMy4wMjQsOS45NjdaTTU3OC43MDUsMzEwLjQ4M2MxLjE0Ny0uMTkxLDEuNTQ5LjQ2OCwxLjg4NCwxLjQ5NS44NDcsMi41OTUsMy4wNjcsNC4zNzEsNS40MjksNS45MzksMy43MjMtMy43MzgsNS4xNDktNy45NTMsNy41MS0xMi41ODYuOTA3LTEuNzc5LDQuMzQzLTMuMzQ4LDMuNDE2LTYuNDAyLS43NTgtMi40OTUtMy4yLTUuNjk3LTUuNTQzLTYuNjg1LTEuMTk4LS41MDUtLjkyMi0xLjE5MS0xLjIwNi0xLjk1OS0xLjM1OS0zLjY3NC0zLjgyOS02LjI3OS02LjQxNS0xMC4xMzJsLTExLjAzMywyNS44MDhjMS4zNzMsMi4yMjIsMy42OTEsNC45MDEsNS45NTgsNC41MjNaTTU5Mi40NCwzMjQuNDU5YzIuMDg3LTEuMzM5LDMuNTU5LTIuMDMzLDQuNjMyLTMuNDI2bDkuMTQ1LTExLjg2LTQuMDYzLTUuMzMxYy0zLjQ1Ni00LjUzNS0yLjgxMi45OTItOC41OTUsOC43OC0xLjU2MywyLjEwNS0yLjA4Myw0Ljg1Ni01LjA2Niw2LjE1MmwzLjk0Nyw1LjY4NVpNNjAxLjg1LDMzMi45NTJjLjUzOS4yOTcuODIzLjgzNCwxLjYyMi45MTctLjA1NiwzLjE3LDIuODU4LDYuMDgsNS40NDIsNy42MTkuMzAyLjE4LjkxMS43NDMsMS4wNzEsMS4zMDQuNzg1LDIuNzU4LDEuOTA5LDUuMTQ5LDQuMjE0LDcuNjdsMjAuMzY3LTE3LjEyNGMtMy4wNTQtMi42NDYtNS41NDQtNS4wOTMtOC44MzktNS4zMzUtLjY3Mi0uMDQ5LTEuMzE1LS4zMS0xLjU3My0xLjEyMy0xLjA1LTMuMzA3LTQuMzc2LTYuMDUxLTcuODUtNy4wMDEtLjU5LS4xNjEtLjY5Mi0xLjUxMy0xLjAzNC0xLjk1MmwtNy4wOTctNy4xODItMTIuMzQsMTYuMjQ5YzEuNzg1LDIuNTQ3LDMuNDI1LDQuNTMzLDYuMDE4LDUuOTU5Wk02MjAuNDU2LDM1OS40MTdsMjQuNjQ5LTE4Ljg5OWMtMi4xNTktMS42OTYtNS4xMDQtMy44ODQtOC40MDYtMy45MjktMS45ODIuMjgxLTQuNzEyLDIuMjcyLTYuMzU3LDMuNjU3bC0xMy42NTMsMTEuNTAxYy45MTYsMi45NDMsMS4xNDYsNS42OTQsMy43NjcsNy42NjlaTTYyNy4xODgsMzY3LjkwMmwyLjA3LDEuODMxYy0uNjQyLDEuMDQ2LS44MzMsNC41MzgsMS4wMTcsNC45NiwyLjk2Mi42NzcsNi43NDItLjYwMyw5LjI5NC0yLjEwOWwzMS4yMjItMTguNDI1LTkuMTk1LTQuODU0Yy0xLjEyNy0uMjkxLTMuMzkuNTEyLTQuMTg4LDEuMTg5LS40MzktLjY2Ni0uODE2LS45ODEtMS4yNS0xLjIwOSwyLjQzLTIuNjQyLTIuNjQ1LTUuMjExLTkuMTg2LTYuNDY4bC0yMy43NzksMTcuNjI2Yy0xLjE2NC0xLjQ5NC0yLjU5LjA2NS0xLjQ5OS43NCwxLjMxOSwzLjAwNCwyLjc2Niw1Ljk0Myw1LjQ5Niw2LjcyWk02NTEuNTEzLDM3OC4xMTFjMy44NzYtMi4xMDgsNy4xNjUtMy4yMTQsMTAuNjgzLTQuOTg3bDI1LjA0OC0xMi42Mi0xMi4zNDYtNC45MTljLTcuOTIzLDMuNzk2LTE1LjEwNyw4LjExNC0yMi41OTEsMTIuOTQtNC44MTMsMy4xMDMtMTAuOTMsNS4xMTctMTUuMzk4LDkuMzgxLS43My42OTctMy45MTEuMDEyLTQuMjI3LDIuMTY4LjczMywyLjE1OCwxLjYyNSw0LjM5OCwzLjI1OCw2LjUxbDE1LjU3NC04LjQ3MlpNNjcwLjM2OCwzNzcuMzk1bDI2LjY5My0xMi44NTRjLTMuNDM0LTMuNzMxLTcuNDA3LTIuNDItMTEuNzY5LS4xODZsLTQ4LjE0OCwyNC42NTdjLS4yNSwxLjg4OS41NzUsMy44ODIsMS44MjIsNC45OTdsMzEuNDAyLTE2LjYxNFpNNzEzLjc5NiwzNzUuMjdjLjczOC0yLjI0Ny0xLjUxOC00LjgxMy0yLjc3NC01LjgxMy0xLjE0NS0uOTEyLTQuODM0LjE4My01LjMyMywxLjQ5NS4yMDcsMi4zOTgsMi4yOSw0Ljc3NSwzLjU4OCw2Ljg4MywxLjM3Mi0uMDAxLDMuOTA5LS43NDIsNC41MDgtMi41NjVaTTY3OS4wMDQsMzk5LjQxNGwxNS43ODctMTMuNzQyYzEuNjc0LS42NDIsMi44OTktNC45MDcuOTA2LTUuMTYtNi4xOTgtLjc4OC0xNC43OTcsNC42MzEtMjIuMDkxLDguNDg4bDUuMzk3LDEwLjQxNFpNNjUxLjk2Myw0MzcuNzk2bC4wNDEsMS44MzVjLjA2NywyLjk4Ni0uMjM5LDUuNTExLjkzMyw4LjQ2MSwyLjgxMy0xLjA4OSw1LjAzMS0yLjI3MSw3LjA5My00LjA3NSw0LjMwNS0zLjc2OCw5Ljk1My00LjcyNSwxNC44OTMtNy4xNjhsMTYuNzkzLTguMzA2YzIuNzM0LTQuNzE4LDYuNDE1LTEyLjgxMyw0LjIxLTE0LjY5bDEuNjA2LTIuOTUzYzEuMTM5LTIuMDk0LDIuOTkyLTMuNjY2LDQuMTk4LTYuMjIxbDYuNDgtMTMuNzIxYy0xLjc2NiwxLjIxMy0yLjYyLDIuNTc0LTQuOTQ0LDIuNTAybC0xMS43OCwxMC4xMS0xOC4xMDQsMTEuNzQxYy0yLjY1LDEuNzE5LTUuMzMxLDEuNjU4LTcuMzkyLDQuOTMxbC03LjM2OCw1LjIyNWMtMi43MTMsMS45MjQtNC42MjQsMy4xODctNy40ODgsNC45NzQtMi4xMzksMS4zMzQtLjQxMiw1Ljk4NS44MjksNy4zNTRaTTY2My41OTYsNDA4LjA4OWMzLjYyLTEuOTc0LDcuMDctMy4xOCw4LjE5My03LjQzNS43Ni0yLjg4LTMuMjY4LTguOTAyLTYuMjAzLTcuMjAybC0yMS42NiwxMi41NDljLjExNiw0LjI1OCwxLjA5Nyw3LjY3OCwzLjIzMiwxMS4wNTJsMTYuNDM5LTguOTYzWk02NzcuNjE0LDQ1MC4xNjZsMTEuMDgzLTQuMjE3LDIuNDc4LTE0LjA0My0zNy45NTEsMTkuMTI0LDEuMzksOS41NzMsMjMuMDAxLTEwLjQzOFpNNjU1LjUsNDczLjQ0NGwzMS40OTktMTEuMTg5Ljk5Mi0xMy4yNjktMzIuOTE4LDE0LjA5Yy0uMjM4LDMuNTE1LS40ODEsNi41MDMuNDI4LDEwLjM2OFpNNjg2Ljc5Nyw0NzguODMzYy4zMzYtNC4zODEuNTk0LTguNjI3LS44NDMtMTMuMDExbC0zMC44MTYsMTAuMjMtLjA1NiwxMC45NDYsMzEuNzE1LTguMTY0Wk02ODkuMDA3LDQ5Mi42MDVsLTIuMDQ4LTExLjA0My0zMS43ODIsOC4xNThjLS4yMzYsMy43NC0uOTYzLDYuNTg2LS4wNTEsOS4wNzhsMzMuODgxLTYuMTkzWk02NjIuMjkyLDUxMS43MTFjLTEuNDgxLTEuMzEtMy4yMDktNC4xOC0yLjA5Mi00LjE5OGwzMS45OTktLjUtMi45MTQtMTEuNzMzLTM1LjAwOSw2LjE0MS00LjQzOCwzOS43OTYsMTQuMzA1LTE2LjAxOGMyLjQ4My0yLjc4Ljg5NS0xMS4wNTgtMS44NS0xMy40ODdaTTY3My41MDQsNTE4LjE4OGMtMi43NjYtLjEzNy0zLjE0MiwzLjQyMy0yLjA4Miw4LjE3NiwxLjAzMi45NjEsMy4zNzYuMzEyLDQuMDAxLS41MDgsMS4xNjktMS41MzMuNzY2LTcuNTM1LTEuOTE5LTcuNjY4Wk02OTMuMzk3LDUyNS40MjdjMS4zMTYtMi40LjM1Ny01LjE0OS4yLTcuMDA2bC0xMi4xMDguMTE3Yy0uMjkxLDIuNDQzLTEuMTEyLDYuMTU2Ljg4LDguMTk5LDIuNDYsMi41MjQsOS4zMTYsMS44MTIsMTEuMDI4LTEuMzFaTTcwNC4yNTQsNTE4LjQ2Yy0uOTMyLS4yOTgtMy4wNTMtLjU2My00LjM3NS0uMTE4LS41NDksMi42NzMtMS4wNTgsNi42NTMuMzU5LDkuMzU0LjU0OSwxLjA0NywzLjU4NS0uMDk1LDQuMDQtMS4wMTEsMS4wNjItMi4xMzcuNzY3LTcuOTczLS4wMjQtOC4yMjVaTTY0Ny4zNzcsNjI2Ljg1Mmw2LjEyOS0uMjYxLDMuNjE5LTQ1LjU2OSw2LjMyOS00Ni4zODQtMTQuNzI0LDE1LjA1MWMtMy4xOTksMy4yNy0yLjE5MSw5Ljg0NS0yLjU4MywxNC4xNjNsLTEuMzc2LDE1LjE0NmMtMS40MDgsMTUuNDk3LjE1NiwzMi4zMjEsMi42MDYsNDcuODUzWk02ODQuMzMxLDU3Ny4xNzVjNS4xODYuNDIxLDkuNDI2LDIuMDE2LDEzLjYwOS0uMDU5LjAwMy0xMC44OS0yLjQ3Ni0yMi4xMjgtNi4zMjItMzIuMjU1LTEuMzM0LTEuNjEzLTcuNTYtMS41NzEtOC41NDIuOTktMy44MzgsMTAuMDA1LTQuNTc5LDIwLjQ4Ny02LjEwMywzMC44MzEsMi4zOTYsMS44NDksNC43NDMuMjgxLDcuMzU3LjQ5M1pNNjk5LjczNiw2MjYuNjk0bC0uMjk1LTIxLjA2NS0uNjg4LTE3LjE0MWMtNi45NjgtNC43OTMtMTUuMzUxLTQuNTIzLTIyLjQyMS4wODhsLS41MDcsMzguMzYsMjMuOTEtLjI0MloiLz48L3N2Zz4="
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
        txt({ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", fontFamily: "Arial, sans-serif" }, "YOUR CHESS YEAR · " + moduleTag),
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
        padding: "52px 64px",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
    }, [
        glowCircle(glowColor, -120, -80, 700),
        watermark(watermarkText),
        pieceEl(pieceUri, pieceSize),
        ...children,
    ])
}

function whereYouStandCard({ name, percentile, rank, total }) {
    const pct = parseFloat(percentile)
    return cardBase(COLORS.black, COLORS.mint, KNIGHT_URI, 680, "RANK", [
        topBar("WHERE YOU STAND"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "YOU'RE RATED HIGHER THAN"),
            txt({ fontSize: 186, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, letterSpacing: "-0.05em" }, pct + "%"),
            txt({ fontSize: 22, color: "rgba(255,255,255,0.45)", marginTop: 12 }, "of rated Bristol & Districts players"),
            txt({ fontSize: 16, color: "rgba(255,255,255,0.25)", marginTop: 8 }, "Ranked #" + rank + " of " + total),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 24 }, displayName(name)),
        ]),
    ])
}

function ratingJourneyCard({ name, currentRating, yearAgoRating, change, domainLabel }) {
    const up = parseInt(change) >= 0
    const changeColor = up ? COLORS.mint : "#FF9B8E"
    const sign = parseInt(change) >= 0 ? "+" : ""
    return cardBase(COLORS.black, COLORS.mint, PAWN_URI, 600, "RATING", [
        topBar("RATING JOURNEY · " + (domainLabel || "STANDARD").toUpperCase()),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "CURRENT RATING"),
            txt({ fontSize: 186, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(currentRating)),
            box({ display: "flex", alignItems: "baseline", gap: 16, marginTop: 16 }, [
                txt({ fontSize: 52, fontWeight: 900, color: changeColor, fontFamily: "monospace" }, sign + change + " pts"),
                txt({ fontSize: 20, color: COLORS.zinc500 }, "from " + yearAgoRating + " a year ago"),
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
                    txt({ fontSize: 128, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, fontFamily: "monospace" }, String(wins)),
                    txt({ fontSize: 13, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "WINS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 6 }, [
                    txt({ fontSize: 128, fontWeight: 900, color: "rgba(255,255,255,0.35)", lineHeight: 0.85, fontFamily: "monospace" }, String(draws)),
                    txt({ fontSize: 13, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "DRAWS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 6 }, [
                    txt({ fontSize: 128, fontWeight: 900, color: "#FF9B8E", lineHeight: 0.85, fontFamily: "monospace" }, String(losses)),
                    txt({ fontSize: 13, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "LOSSES"),
                ]),
            ]),
            txt({ fontSize: 18, color: COLORS.zinc500, marginTop: 20 }, played + " league games this season"),
        ]),
    ])
}

function inGoodCompanyCard({ name, drawRate, gmName, gmDrawRate }) {
    const diff = Math.abs(parseInt(drawRate) - parseInt(gmDrawRate))
    const caption = parseInt(drawRate) < parseInt(gmDrawRate)
        ? "More decisive than " + gmName + " — " + diff + "pp fewer draws"
        : "Matching " + gmName + "'s career draw rate"
    return cardBase(COLORS.black, "#6366F1", KNIGHT_URI, 640, "DRAWS", [
        topBar("IN GOOD COMPANY"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "YOUR DRAW RATE THIS SEASON"),
            txt({ fontSize: 186, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, drawRate + "%"),
            box({ display: "flex", alignItems: "baseline", gap: 14, marginTop: 14 }, [
                txt({ fontSize: 36, fontWeight: 900, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }, "vs " + gmDrawRate + "%"),
                txt({ fontSize: 20, color: COLORS.zinc500 }, gmName + " career"),
            ]),
            txt({ fontSize: 18, color: COLORS.zinc500, marginTop: 12 }, caption),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 20 }, displayName(name)),
        ]),
    ])
}

function giantKillingCard({ name, opponent, ownRating, oppRating, differential }) {
    const oppName = opponent.includes(",") ? opponent.split(",").reverse().join(" ").trim() : opponent
    return cardBase(COLORS.black, COLORS.mint, KNIGHT_URI, 700, "UPSET", [
        topBar("GIANT KILLING"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "BIGGEST RATING UPSET THIS SEASON"),
            box({ display: "flex", alignItems: "center", gap: 40, marginTop: 4 }, [
                txt({ fontSize: 200, fontWeight: 900, color: COLORS.mint, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, "+" + differential),
                box({ display: "flex", flexDirection: "column", gap: 14 }, [
                    box({ display: "flex", alignItems: "baseline", gap: 16 }, [
                        txt({ fontSize: 20, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.18em" }, "THEM"),
                        txt({ fontSize: 40, fontWeight: 900, color: COLORS.white, fontFamily: "monospace" }, String(oppRating)),
                    ]),
                    box({ display: "flex", alignItems: "baseline", gap: 16 }, [
                        txt({ fontSize: 20, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.18em" }, "YOU "),
                        txt({ fontSize: 40, fontWeight: 900, color: COLORS.zinc500, fontFamily: "monospace" }, String(ownRating)),
                    ]),
                ]),
            ]),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 16 }, displayName(name)),
            txt({ fontSize: 20, color: COLORS.zinc500 }, "beat " + oppName),
        ]),
    ])
}

function toughestOpponentCard({ name, opponent, oppRating, ownRating, outcome }) {
    const oppName = opponent.includes(",") ? opponent.split(",").reverse().join(" ").trim() : opponent
    const outcomeColor = outcome === "win" ? COLORS.mint : outcome === "draw" ? "rgba(255,255,255,0.6)" : "#FF9B8E"
    const outcomeTag = outcome === "win" ? "YOU WON" : outcome === "draw" ? "YOU DREW" : "YOU LOST"
    return cardBase(COLORS.black, "#EF4444", KNIGHT_URI, 680, "TOUGH", [
        topBar("TOUGHEST OPPONENT"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "HIGHEST-RATED OPPONENT FACED"),
            txt({ fontSize: 186, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(oppRating)),
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
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "OPPONENTS THIS SEASON"),
            txt({ fontSize: 186, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.05em", fontFamily: "monospace" }, String(uniqueOpponents)),
            txt({ fontSize: 22, color: "rgba(255,255,255,0.35)", marginTop: 10 }, "people sat across a board from you"),
            box({ display: "flex", alignItems: "flex-end", gap: 36, marginTop: 20 }, [
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 56, fontWeight: 900, color: COLORS.mint, fontFamily: "monospace", lineHeight: 1 }, String(wins)),
                    txt({ fontSize: 11, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "WINS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 56, fontWeight: 900, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", lineHeight: 1 }, String(draws)),
                    txt({ fontSize: 11, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "DRAWS"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 4 }, [
                    txt({ fontSize: 56, fontWeight: 900, color: "#FF9B8E", fontFamily: "monospace", lineHeight: 1 }, String(losses)),
                    txt({ fontSize: 11, fontWeight: 700, color: COLORS.zinc700, letterSpacing: "0.2em" }, "LOSSES"),
                ]),
            ]),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 16 }, displayName(name)),
        ]),
    ])
}

function colourStrengthCard({ name, whitePct, blackPct, stronger }) {
    const diff = Math.abs(parseInt(whitePct) - parseInt(blackPct))
    const caption = stronger === "neither" ? "Equal strength with both colours"
        : "+" + diff + "pp stronger with the " + stronger + " pieces"
    return cardBase(COLORS.black, "#A855F7", KNIGHT_URI, 660, "COLOUR", [
        topBar("WHITE & BLACK"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 24 }, displayName(name)),
            box({ display: "flex", alignItems: "flex-end", gap: 48 }, [
                box({ display: "flex", flexDirection: "column", gap: 8 }, [
                    txt({ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }, "WHITE"),
                    txt({ fontSize: 148, fontWeight: 900, color: "#F5F5F5", lineHeight: 0.85, letterSpacing: "-0.04em", fontFamily: "monospace" }, whitePct + "%"),
                ]),
                box({ display: "flex", flexDirection: "column", gap: 8 }, [
                    txt({ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }, "BLACK"),
                    txt({ fontSize: 148, fontWeight: 900, color: "#E8A800", lineHeight: 0.85, letterSpacing: "-0.04em", fontFamily: "monospace" }, blackPct + "%"),
                ]),
            ]),
            txt({ fontSize: 20, color: COLORS.zinc500, marginTop: 16 }, caption),
        ]),
    ])
}

function degreesOfSeparationCard({ name, degrees, playerCount }) {
    return cardBase(COLORS.black, "#8B5CF6", KNIGHT_URI, 700, "DEGREES", [
        topBar("DEGREES OF SEPARATION"),
        box({ display: "flex", flexDirection: "column", gap: 0 }, [
            txt({ fontSize: 20, fontWeight: 700, color: "rgba(110,231,183,0.65)", letterSpacing: "0.18em" }, "DEGREES FROM GM MICHAEL ADAMS"),
            txt({ fontSize: 220, fontWeight: 900, color: COLORS.white, lineHeight: 0.85, letterSpacing: "-0.06em", fontFamily: "monospace" }, String(degrees)),
            txt({ fontSize: 22, color: "rgba(255,255,255,0.4)", marginTop: 12 }, "9× British Champion · England #2"),
            txt({ fontSize: 18, color: COLORS.zinc700, marginTop: 6 }, "via over-the-board games · " + playerCount + " Bristol players"),
            txt({ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 20 }, displayName(name)),
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
