import { useEffect, useState } from 'react'
import { listActiveRewards, listCustomerRedemptions, redeemReward } from '../../services/loyaltyService'

export default function ClientRewards({ customer }) {
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!customer?.id) return
    Promise.all([listActiveRewards(), listCustomerRedemptions(customer.id)])
      .then(([availableRewards, customerRedemptions]) => {
        setRewards(availableRewards)
        setRedemptions(customerRedemptions)
      })
      .catch((error) => setMessage(error.message))
  }, [customer?.id, customer?.total_points])

  const handleRedeem = async (reward) => {
    setMessage('')
    try {
      await redeemReward(reward.id)
      setMessage(`Canje solicitado: ${reward.name}`)
      const [availableRewards, customerRedemptions] = await Promise.all([
        listActiveRewards(),
        listCustomerRedemptions(customer.id),
      ])
      setRewards(availableRewards)
      setRedemptions(customerRedemptions)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Beneficios</p>
        <h2 className="mt-2 text-2xl font-black text-slate-800">Recompensas disponibles</h2>
      </div>
      {message && <p className="rounded-xl bg-[#f7f2ea] p-3 text-sm font-bold text-[#8b5e3c]">{message}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {rewards.map((reward) => (
          <article key={reward.id} className="rounded-3xl border border-[#c9a15c]/25 bg-white p-5 text-left">
            <h3 className="font-black text-slate-800">{reward.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{reward.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-black text-[#8b5e3c]">{reward.points_cost} puntos</span>
              <button
                type="button"
                disabled={(customer.total_points || 0) < reward.points_cost}
                onClick={() => handleRedeem(reward)}
                className="rounded-xl bg-[#121212] px-3 py-2 text-xs font-black uppercase text-[#e4c88a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Canjear
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-3xl bg-[#f7f2ea] p-5 text-left">
        <h3 className="font-black text-slate-800">Historial de canjes</h3>
        {redemptions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Aún no tienes canjes registrados.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {redemptions.map((redemption) => (
              <li key={redemption.id} className="flex justify-between gap-3">
                <span>{redemption.rewards?.name || 'Recompensa'}</span>
                <span className="font-bold">
                  {redemption.points_cost} pts · {redemption.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
