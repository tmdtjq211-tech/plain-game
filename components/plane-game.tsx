"use client"
import React, { useState, useEffect, useRef } from "react"
import { database } from "../lib/firebase"
import { ref, set, onValue, remove, update, onDisconnect, push } from "firebase/database"

export default function PlaneGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [myId] = useState(() => "P_" + Math.random().toString(36).substring(2, 7))
  const [players, setPlayers] = useState<any>({})
  const [bullets, setBullets] = useState<any>({})
  const [myTeam] = useState(() => (Math.random() > 0.5 ? "RED" : "BLUE"))
  const [scores, setScores] = useState({ RED: 0, BLUE: 0 })

  useEffect(() => {
    if (typeof window === "undefined") return
    const playersRef = ref(database, "plane_game/players")
    const myPlayerRef = ref(database, `plane_game/players/${myId}`)
    const bulletsRef = ref(database, "plane_game/bullets")
    const scoresRef = ref(database, "plane_game/team_scores")
    set(myPlayerRef, { id: myId, x: 400, y: 700, team: myTeam, hp: 100 })
    onDisconnect(myPlayerRef).remove()
    onValue(playersRef, (s) => setPlayers(s.val() || {}))
    onValue(bulletsRef, (s) => setBullets(s.val() || {}))
    onValue(scoresRef, (s) => s.exists() && setScores(s.val()))
    return () => { remove(myPlayerRef) }
  }, [myId, myTeam])

  useEffect(() => {
    if (typeof window === "undefined") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      update(ref(database, `plane_game/players/${myId}`), { x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    const handleShoot = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const bRef = push(ref(database, "plane_game/bullets"))
      set(bRef, { owner: myId, team: myTeam, x: e.clientX - rect.left, y: e.clientY - rect.top - 20 })
      setTimeout(() => remove(bRef), 1000)
    }
    canvas.addEventListener("mousemove", handleMove)
    canvas.addEventListener("mousedown", handleShoot)
    const render = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#050510"; ctx.fillRect(0, 0, canvas.width, canvas.height)
      Object.values(players).forEach((p: any) => {
        ctx.fillStyle = p.team === "RED" ? "#FF4B4B" : "#4B89FF"
        ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fill()
      })
      Object.entries(bullets).forEach(([bId, b]: [string, any]) => {
        ctx.fillStyle = b.team === "RED" ? "#FF9999" : "#99BFFF"
        ctx.fillRect(b.x - 2, b.y, 4, 10); b.y -= 10
        if (b.owner === myId) {
          Object.values(players).forEach((target: any) => {
            if (target.team !== myTeam) {
              if (Math.hypot(target.x - b.x, target.y - b.y) < 20) {
                update(ref(database, "plane_game/team_scores"), { [myTeam]: (scores as any)[myTeam] + 1 })
                remove(ref(database, `plane_game/bullets/${bId}`))
              }
            }
          })
        }
      })
      requestAnimationFrame(render)
    }
    const animId = requestAnimationFrame(render)
    return () => { canvas.removeEventListener("mousemove", handleMove); canvas.removeEventListener("mousedown", handleShoot); cancelAnimationFrame(animId) }
  }, [players, bullets, scores, myId, myTeam])

  if (typeof window === "undefined") return null
  return (
    <div className="flex flex-col items-center bg-black min-h-screen text-white">
      <div className="flex gap-20 py-8 text-5xl font-black italic">
        <div className="text-red-500">RED: {scores.RED}</div>
        <div className="text-blue-500">BLUE: {scores.BLUE}</div>
      </div>
      <canvas ref={canvasRef} width={800} height={800} className="bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl cursor-none" />
    </div>
  )
}
