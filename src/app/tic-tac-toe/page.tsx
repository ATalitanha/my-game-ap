'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { checkWin, makeMove, resetBoard } from '@/lib/ticTacToe'
import { ticBoard, ticPlayer } from "@/lib/type";

export default function TicTacToeUI() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [board, setBoard]: [ticBoard, (board: ticBoard) => void] = useState(Array(9).fill(null));
  const [winner, setWin] = useState<ticPlayer | 'Draw' | null>(null);
  const [turn, setTurn] = useState<ticPlayer>('X');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    checkWin(board, setWin);
  }, [board]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Mouse light effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.15), transparent 80%)`,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 30 }}
      />

      {/* Mode selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          🎮 Choose Game Mode
        </h1>
        <div className="flex gap-3 justify-center">
          <Button className="bg-indigo-500/80 hover:bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg">Local</Button>
          <Button className="bg-purple-500/80 hover:bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg">CPU</Button>
          <Button className="bg-pink-500/80 hover:bg-pink-600 text-white px-6 py-2 rounded-full shadow-lg">Online</Button>
        </div>
      </motion.div>

      {/* Game board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="relative z-10 bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-6 mt-8"
      >
        {/* Turn / Winner */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {winner ? (winner === 'Draw' ? '🤝 Draw!' : `🏆 Winner: ${winner}`) : `Turn: ${turn}`}
        </h2>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3">
          {board.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => !winner && makeMove(i, board, setBoard, turn, setTurn,winner,setWin)}
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 bg-white/70 dark:bg-gray-800/60 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-inner select-none cursor-pointer"
            >
              {board[i]}
            </motion.div>
          ))}
        </div>

        {/* Reset Button */}
        <Button
          onClick={() => {
            resetBoard(setBoard);
            setWin(null);
            setTurn('X');
          }}
          className="mt-4 bg-indigo-500/80 hover:bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg"
        >
          🔁 Reset Game
        </Button>
      </motion.div>
    </div>
  );
}
