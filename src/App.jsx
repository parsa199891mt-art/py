// File: src/App.jsx
import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(`# یک مثال ساده:\nprint("سلام از Pyodide!")`);
  const [output, setOutput] = useState("");
  const [filename, setFilename] = useState("my_script.py");
  const [running, setRunning] = useState(false);
  const outputRef = useRef("");

  useEffect(() => {
    async function loadPyodideEnv() {
      setLoading(true);
      try {
        const indexUrl = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        await import(/* @vite-ignore */ indexUrl);
        // eslint-disable-next-line no-undef
        const pyod = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        setPyodide(pyod);
      } catch (err) {
        console.error("خطا در بارگذاری Pyodide:", err);
        setOutput((o) => o + "\nخطا در بارگذاری Pyodide: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPyodideEnv();
  }, []);

  async function runCode() {
    if (!pyodide) {
      setOutput((o) => o + "\nPyodide هنوز آماده نیست.");
      return;
    }
    setRunning(true);
    setOutput("");
    outputRef.current = "";

    function indentLines(s, level = 1) {
      const pad = "".padStart(level * 4, " ");
      return s.split("\n").map((l) => pad + l).join("\n");
    }

    try {
      const wrapper = `
import sys
from io import StringIO
_buf = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _buf
sys.stderr = _buf
try:
${indentLines(code, 2)}
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr
_out = _buf.getvalue()
_out
`;
      const result = await pyodide.runPythonAsync(wrapper);
      const text = String(result ?? "");
      outputRef.current = text;
      setOutput(text);
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      outputRef.current = outputRef.current + "\n" + message;
      setOutput((o) => o + "\n" + message);
    } finally {
      setRunning(false);
    }
  }

  function downloadFile(content, name) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Python Playground</h1>
          <div className="text-sm opacity-80">سازنده: محمد آرسا</div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-3">
            <div className="card">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-area"
              />
              <div className="flex items-center gap-2 mt-3">
                <input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="px-3 py-1 bg-slate-700 rounded-md text-sm"
                  placeholder="filename.py"
                />
                <button
                  onClick={() => downloadFile(code, filename || "script.py")}
                  className="btn btn-muted"
                >
                  دانلود کد (.py)
                </button>
                <button
                  onClick={runCode}
                  disabled={loading || running}
                  className="btn btn-primary ml-auto disabled:opacity-60"
                >
                  {running ? "در حال اجرا..." : loading ? "در حال بارگذاری..." : "اجرا کن"}
                </button>
              </div>
            </div>

            <div className="card">
              <pre className="output-pre">
                {output || "خروجی اینجا نمایش داده می‌شود."}
              </pre>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() =>
                    downloadFile(outputRef.current || output || "", (filename || "output") + ".txt")
                  }
                  className="btn btn-muted"
                >
                  دانلود خروجی (.txt)
                </button>
                <button
                  onClick={() => {
                    setOutput("");
                    outputRef.current = "";
                  }}
                  className="btn btn-danger"
                >
                  پاک کن
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-xs opacity-80">
          سازنده محمد آرسا
        </footer>
      </div>
    </div>
  );
}
