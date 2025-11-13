'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ticBoard, ticPlayer, winer } from "@/lib/type";
import { resetBoard, makeMove, checkWin } from "@/lib/ticTacToe";

export default function TicTacToeUI() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // حالت‌های بازی
  const [mode, setMode] = useState<"menu" | "local" | "cpu" | "online">("menu");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [cpuDifficultySelected, setCpuDifficultySelected] = useState(false);

  // وضعیت بازی
  const [board, setBoard]: [ticBoard, (board: ticBoard) => void] = useState(Array(9).fill(null));
  const [winer, setWin] = useState<winer>(null);
  const [turn, setTurn] = useState<ticPlayer>("X");

  // دنبال موس برای افکت نئون
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // بررسی برنده
  useEffect(() => {
    checkWin(board, setWin);
  }, [board]);

  // ریست بازی
  const handleReset = () => {
    resetBoard(setBoard);
    setWin(null);
    setTurn("X");
    if (mode === "cpu") setCpuDifficultySelected(false);
  };

  // ----------------------------
  // رندر منوی اصلی
  // ----------------------------
  if (mode === "menu") {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* نئون داینامیک */}
        <div
          className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(120, 119, 198, 0.15) 0%, rgba(120, 119, 198, 0) 50%)`
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 bg-linear-to-br from-purple-800/30 to-blue-800/20 border border-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6"
        >
          <h1 className="text-4xl font-extrabold text-center text-white drop-shadow-lg">
            🎮 Tic Tac Toe
          </h1>
          <div className="flex flex-col gap-4 w-64">
            <Button
              onClick={() => setMode("local")}
              className="bg-purple-600/80 hover:bg-purple-700 text-white text-lg py-3 rounded-xl"
            >
              👥 Local Mode
            </Button>
            <Button
              onClick={() => setMode("cpu")}
              className="bg-blue-600/80 hover:bg-blue-700 text-white text-lg py-3 rounded-xl"
            >
              🧠 Vs CPU
            </Button>
            <Button
              onClick={() => setMode("online")}
              className="bg-pink-600/80 hover:bg-pink-700 text-white text-lg py-3 rounded-xl"
            >
              🌐 Online
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------
  // انتخاب سطح سختی CPU
  // ----------------------------
  if (mode === "cpu" && !cpuDifficultySelected) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <div
          className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(120, 119, 198, 0.15) 0%, rgba(120, 119, 198, 0) 50%)`
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 bg-linear-to-br from-blue-800/30 to-indigo-900/20 border border-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6"
        >
          <h2 className="text-3xl font-bold text-center text-white">Choose Difficulty</h2>
          <div className="flex flex-col gap-4 w-64">
            <Button onClick={() => { setDifficulty("easy"); setCpuDifficultySelected(true); }} className="bg-green-600/80 hover:bg-green-700 text-white text-lg py-3 rounded-xl">😌 Easy</Button>
            <Button onClick={() => { setDifficulty("medium"); setCpuDifficultySelected(true); }} className="bg-yellow-600/80 hover:bg-yellow-700 text-white text-lg py-3 rounded-xl">🧩 Medium</Button>
            <Button onClick={() => { setDifficulty("hard"); setCpuDifficultySelected(true); }} className="bg-red-600/80 hover:bg-red-700 text-white text-lg py-3 rounded-xl">🔥 Hard</Button>
          </div>
          <Button
            onClick={() => { setMode("menu"); setCpuDifficultySelected(false); }}
            className="mt-6 bg-gray-700/70 hover:bg-gray-600 text-white"
          >
            ⬅ Back
          </Button>
        </motion.div>
      </div>
    );
  }

  // ----------------------------
  // صفحه اصلی بازی
  // ----------------------------
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* نئون داینامیک */}
      <div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(120, 119, 198, 0.15) 0%, rgba(120, 119, 198, 0) 50%)`
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="relative z-10 bg-linear-to-br from-purple-900/40 to-blue-900/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8"
      >
        {/* وضعیت بازی */}
        <div className="text-2xl font-semibold text-white">
          {winer ? (winer === "Draw" ? "🤝 Draw!" : `🏆 Winner: ${winer}`) : `Turn: ${turn}`}
        </div>

        {/* بورد */}
        <div className="grid grid-cols-3 gap-4">
          {board.map((cell, i) => (
            <motion.div
              key={i}
              onClick={() => makeMove(i, board, setBoard, turn, setTurn, winer, setWin, mode, difficulty!)}
              whileHover={{ scale: cell ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 flex items-center justify-center text-5xl font-extrabold rounded-2xl shadow-inner cursor-pointer select-none
                ${cell === "X" ? "text-purple-400" : cell === "O" ? "text-blue-400" : "text-white/30"}
                ${cell ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}
              `}
            >
              {cell}
            </motion.div>
          ))}
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleReset}
            className="bg-purple-600/80 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
          >
            🔁 Reset
          </Button>
          <Button
            onClick={() => { setMode("menu"); setCpuDifficultySelected(false); }}
            className="bg-gray-700/70 hover:bg-gray-600 text-white px-6 py-2 rounded-full"
          >
            🏠 Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
