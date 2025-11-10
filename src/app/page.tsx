import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href={"/tic-tac-toe"}>
        <button
              
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
                  ? "bg-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/60"
                }`}
            >
              tic tac toe
            </button>
      </Link>
    </div>
  );
}
