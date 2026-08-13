import { useMemo, useState } from 'react'
import { useGame } from '../app/GameContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { LICENSE_CATALOG, LICENSE_KINDS } from '../game/data/licenses.js'
import { clauseList, licenseEligibility, licenseFromState, licensesForState, quoteLicense } from '../game/engine/licensing.js'
import { formatMoney } from '../game/engine/utils.js'
import { GENRES, THEMES, labelOf } from '../game/data/catalog.js'

export function LicensesScreen() {
  const { state, dispatch } = useGame()
  const availableCatalog = useMemo(() => licensesForState(state).filter(ip => ip.availableFrom <= state.date.year), [state.date.year, state.licenses.customCatalog])
  const [selectedId, setSelectedId] = useState(availableCatalog[0]?.id ?? LICENSE_CATALOG[0].id)
  const [kind, setKind] = useState('all')
  const [bid, setBid] = useState('')
  const selected = licenseFromState(state, selectedId) ?? availableCatalog[0] ?? LICENSE_CATALOG[0]
  const dynamic = state.licenses.catalog[selected.id]
  const contract = state.licenses.active.find(item => item.licenseId === selected.id)
  const offer = state.licenses.offers.find(item => item.licenseId === selected.id)
  const exclusive = state.licenses.exclusives.find(item => item.licenseId === selected.id && item.expiresYear >= state.date.year)
  const eligibility = licenseEligibility(state, selected.id)
  const filtered = availableCatalog.filter(ip => kind === 'all' || ip.kind === kind)
  const auction = state.licenses.auctions[0]
  const auctionEligibility = auction ? licenseEligibility(state, auction.licenseId) : null

  return (
    <section className="screen license-screen" aria-labelledby="licenses-title">
      <header className="screen-heading"><div><p className="overline">DIREITOS, PRAZOS E GENTE DIFÍCIL</p><h2 id="licenses-title">Mercado de licenças</h2></div><p>Uma IP compra atenção. O contrato compra problemas. O jogo ainda precisa ser bom.</p></header>

      <section className="rights-tape" aria-label="Contratos ativos">
        <span>DIREITOS NA GAVETA</span>
        {state.licenses.active.length ? state.licenses.active.map(item => {
          const ip = licenseFromState(state, item.licenseId)
          return <button key={item.id} type="button" onClick={() => setSelectedId(item.licenseId)}><strong>{ip.name}</strong><small>ATÉ {String(item.expiresMonth + 1).padStart(2, '0')}/{item.expiresYear} · CONFIANÇA {item.trust}</small></button>
        }) : <p>Nenhum contrato ativo. Por enquanto, todas as ideias são suas.</p>}
      </section>

      {auction && <section className="license-auction">
        <header><div><span>LICENÇA DISPUTADA · {auction.monthsLeft} MESES</span><h3>{licenseFromState(state, auction.licenseId).name}</h3></div><strong>MÍNIMO {formatMoney(auction.minimum)}</strong></header>
        <div className="auction-bids">{[...auction.bids].sort((a, b) => b.amount - a.amount).map(item => <article key={item.bidder} className={item.player ? 'is-player' : ''}><span>{item.bidder}</span><strong>{formatMoney(item.amount)}</strong><small>{Math.round(item.royalty * 100)}% royalties</small></article>)}</div>
        <form onSubmit={event => { event.preventDefault(); dispatch({ type: 'PLACE_LICENSE_BID', auctionId: auction.id, amount: bid || auction.minimum }); setBid('') }}><label><span>{auctionEligibility.allowed ? 'SUA OFERTA' : auctionEligibility.reasons[0]}</span><input type="number" min={auction.minimum} max={state.player.money} step="10000" value={bid} placeholder={String(auction.minimum)} onChange={event => setBid(event.target.value)} disabled={!auctionEligibility.allowed} /></label><Button variant="primary" disabled={!auctionEligibility.allowed || state.player.money < auction.minimum}>COBRIR OFERTA</Button></form>
      </section>}

      <div className="license-workbench">
        <aside className="rights-ledger">
          <header><p className="overline">CATÁLOGO HISTÓRICO</p><div><button type="button" className={kind === 'all' ? 'is-active' : ''} onClick={() => setKind('all')}>TODAS</button>{LICENSE_KINDS.map(item => <button key={item.id} type="button" className={kind === item.id ? 'is-active' : ''} onClick={() => setKind(item.id)}>{item.label.toUpperCase()}</button>)}</div><label className="pack-import">+ IMPORTAR JSON<input type="file" accept="application/json,.json" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { dispatch({ type: 'IMPORT_LICENSE_PACK', pack: JSON.parse(await file.text()) }) } catch { dispatch({ type: 'IMPORT_LICENSE_PACK', pack: null }) } event.target.value = '' }} /></label></header>
          <div>{filtered.map(ip => {
            const ipDynamic = state.licenses.catalog[ip.id]
            const held = state.licenses.active.some(item => item.licenseId === ip.id)
            const locked = state.licenses.exclusives.find(item => item.licenseId === ip.id && item.expiresYear >= state.date.year && !item.player)
            return <button key={ip.id} type="button" className={`${selected.id === ip.id ? 'is-selected' : ''} ${held ? 'is-held' : ''}`} onClick={() => setSelectedId(ip.id)}><span>{LICENSE_KINDS.find(item => item.id === ip.kind)?.label.toUpperCase()}</span><strong>{ip.name}</strong><small>{held ? 'CONTRATO ATIVO' : locked ? `EXCLUSIVA · ${locked.holder}` : `${ipDynamic.popularity} POP · ${formatMoney(quoteLicense(state, ip.id))}`}</small></button>
          })}</div>
        </aside>

        <article className="license-dossier">
          <header><div><span>DOSSIÊ Nº {selected.id.toUpperCase()}</span><h3>{selected.name}</h3><p>{selected.owner}</p></div><div className={`rights-stamp ${contract ? 'is-approved' : exclusive ? 'is-refused' : ''}`}>{contract ? 'ASSINADO' : exclusive ? 'INDISPONÍVEL' : 'EM ANÁLISE'}</div></header>
          <div className="license-meters"><Meter label="POPULARIDADE" value={dynamic.popularity} /><Meter label="PRESTÍGIO" value={dynamic.prestige} /><Meter label="CONFIANÇA" value={contract?.trust ?? dynamic.trust} /></div>
          <dl className="license-terms"><div><dt>Entrada estimada</dt><dd>{formatMoney(quoteLicense(state, selected.id))}</dd></div><div><dt>Royalties-base</dt><dd>{Math.round(selected.royalty * 100)}% das vendas</dd></div><div><dt>Vigência</dt><dd>{selected.durationYears} anos</dd></div><div><dt>Histórico mínimo</dt><dd>Rep. {selected.minReputation} · {selected.minTrophies} troféu(s)</dd></div></dl>
          <section className="license-fit"><div><span>FUNCIONA MELHOR COM</span><p>{selected.genres.map(id => labelOf(GENRES, id)).join(', ')} · {selected.themes.map(id => labelOf(THEMES, id)).join(', ')}</p></div><div><span>PÚBLICO</span><p>{selected.audiences.join(', ')}</p></div></section>
          <section className="clause-file"><header><span>ANEXO B · CONDIÇÕES CRIATIVAS</span><strong>{selected.clauses.length} CLÁUSULAS</strong></header>{selected.clauses.map(id => {
            const clause = clauseList({ clauses: [id] })[0]
            return <div key={id}><b>✓</b><p><strong>{clause.label}</strong><span>{clause.copy}</span></p></div>
          })}</section>
          {offer ? <section className="license-offer"><span>PROPOSTA VÁLIDA POR {offer.monthsLeft} MESES</span><h4>{formatMoney(offer.upfront)} + {Math.round(offer.royalty * 100)}%</h4><p>{offer.durationYears} anos {offer.exclusive ? 'com exclusividade' : 'sem exclusividade'}.</p><Button variant="primary" onClick={() => dispatch({ type: 'ACCEPT_LICENSE_OFFER', offerId: offer.id })} disabled={state.player.money < offer.upfront}>{state.player.money < offer.upfront ? 'CAIXA INSUFICIENTE' : 'ASSINAR CONTRATO'}</Button></section>
            : contract ? <section className="license-offer is-active"><span>CONTRATO EM VIGOR</span><h4>{contract.projects} projeto(s) · {contract.breaches} violação(ões)</h4><p>Expira em {String(contract.expiresMonth + 1).padStart(2, '0')}/{contract.expiresYear}.</p><Button onClick={() => dispatch({ type: 'RENEW_LICENSE', contractId: contract.id })}>PEDIR RENOVAÇÃO</Button></section>
              : <section className="license-action"><div>{eligibility.allowed ? <p>A mesa está aberta. Pedir valores não desconta dinheiro.</p> : eligibility.reasons.map(reason => <p key={reason}>— {reason}</p>)}</div><Button variant="primary" onClick={() => dispatch({ type: 'REQUEST_LICENSE', licenseId: selected.id })}>{eligibility.allowed ? 'PEDIR UMA PROPOSTA' : 'ENVIAR PEDIDO MESMO ASSIM'}</Button></section>}
          <footer>Banco histórico de referência · nomes e titulares não substituem autorização para distribuição comercial.</footer>
        </article>
      </div>

      <section className="ip-history"><header><div><p className="overline">MEMÓRIA DA PROPRIEDADE</p><h3>{selected.name} nesta linha do tempo</h3></div><span>{dynamic.history.length} jogo(s)</span></header>{dynamic.history.length ? dynamic.history.map(item => <article key={item.id}><time>{item.year}</time><div><strong>{item.title}</strong><span>{item.studio}</span></div><b>{item.score}</b><small>{item.popularityDelta > 0 ? '+' : ''}{item.popularityDelta} POP</small></article>) : <p>Ninguém publicou um jogo dessa IP durante esta carreira.</p>}</section>
    </section>
  )
}

function Meter({ label, value }) {
  return <div><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>
}
