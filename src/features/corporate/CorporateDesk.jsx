import { useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { corporatePartnerById } from '../../game/data/corporatePartners.js'
import { availableCorporatePartners, calculateStudioValuation, partnershipEligibility, relationshipStatus } from '../../game/engine/corporate.js'
import { licenseFromState } from '../../game/engine/licensing.js'
import { formatMoney } from '../../game/engine/utils.js'

const offerTitle = (state, offer) => {
  const company = corporatePartnerById(offer.companyId)
  if (offer.type === 'commission') return `${company.name} quer um ${licenseFromState(state, offer.licenseId)?.name}`
  if (offer.type === 'acquisition') return `${company.name} quer comprar o estúdio`
  return `${company.name} propôs uma parceria`
}

export function CorporateDesk() {
  const { state, dispatch } = useGame()
  const companies = availableCorporatePartners(state)
  const [selectedId, setSelectedId] = useState(companies[0]?.id)
  const selected = corporatePartnerById(selectedId) ?? companies[0]
  const relationship = state.corporate.relationships[selected.id]
  const valuation = useMemo(() => calculateStudioValuation(state), [state])
  const partnership = state.corporate.partnerships.find(item => item.companyId === selected.id)
  const eligibility = partnershipEligibility(state, selected.id)
  const now = state.date.year * 12 + state.date.month
  const canPitch = now - relationship.lastPitchAt >= 6 && state.player.money >= 1800 + state.studio.team.length * 350
  const acquisition = state.corporate.offers.find(item => item.type === 'acquisition')
  const ordinaryOffers = state.corporate.offers.filter(item => item.type !== 'acquisition')
  const commission = state.corporate.activeCommission
  const commissionCompany = commission ? corporatePartnerById(commission.companyId) : null

  return (
    <section className="corporate-desk">
      <header><div><p className="overline">PARCERIAS, ENCOMENDAS E CONTROLE</p><h3>Mesa dos grandes</h3></div><span>{state.studio.parentCompany ? `CONTROLADA POR ${state.studio.parentCompany.toUpperCase()}` : 'INDEPENDENTE'}</span></header>

      {commission && <section className="active-commission-tape"><div><span>BRIEF ACEITO · {commissionCompany.name} · {commission.concept}</span><strong>{licenseFromState(state, commission.licenseId)?.name}</strong></div><p>{commission.genre.toUpperCase()} · META {commission.scoreFloor} · {commission.monthsLeft} MESES · BÔNUS {formatMoney(commission.bonus)}</p></section>}

      {acquisition && <AcquisitionLetter state={state} offer={acquisition} dispatch={dispatch} />}

      {ordinaryOffers.length > 0 && <div className="corporate-inbox">{ordinaryOffers.map(offer => <OfferLetter key={offer.id} state={state} offer={offer} dispatch={dispatch} />)}</div>}

      <div className="corporate-workbench">
        <section className="valuation-letter">
          <span>AVALIAÇÃO INTERNA · NÃO É SALDO EM CONTA</span>
          <h4>{formatMoney(valuation.total)}</h4>
          <p>Quanto uma compradora enxerga quando soma equipe, jogos, tecnologia, reputação e contratos — antes do prêmio para convencer você.</p>
          <dl>
            <div><dt>Catálogo publicado</dt><dd>{formatMoney(valuation.catalog)}</dd></div>
            <div><dt>Equipe e experiência</dt><dd>{formatMoney(valuation.team)}</dd></div>
            <div><dt>IPs próprias</dt><dd>{valuation.ownedOriginals} · {formatMoney(valuation.originalIps)}</dd></div>
            <div><dt>Direitos contratados</dt><dd>{formatMoney(valuation.licensePortfolio)}</dd></div>
            <div><dt>Nome e tecnologia</dt><dd>{formatMoney(valuation.reputation + valuation.technology)}</dd></div>
            <div><dt>Dívida descontada</dt><dd>-{formatMoney(valuation.debt)}</dd></div>
          </dl>
          {state.corporate.ownership && <footer><strong>AUTONOMIA {state.corporate.ownership.autonomy}%</strong><span>{state.corporate.ownership.retainedBrand ? 'MARCA PRESERVADA' : 'MARCA SOB REVISÃO'} · venda por {formatMoney(state.corporate.ownership.price)}</span></footer>}
        </section>

        <aside className="company-rolodex"><header><span>FICHÁRIO DE RELAÇÕES</span><small>{companies.length} empresas</small></header>{companies.map(company => { const rel = state.corporate.relationships[company.id]; const active = state.corporate.partnerships.some(item => item.companyId === company.id); return <button type="button" key={company.id} className={selected.id === company.id ? 'is-selected' : ''} onClick={() => setSelectedId(company.id)}><span>{active ? 'PARCEIRO' : relationshipStatus(rel).toUpperCase()}</span><strong>{company.name}</strong><i><b style={{ width: `${rel.trust}%` }} /></i><small>{rel.trust} confiança · {rel.completed} entregas</small></button> })}</aside>

        <article className="relationship-file">
          <header><div><span>DOSSIÊ CORPORATIVO</span><h4>{selected.name}</h4><p>{selected.strategy}</p></div><strong>{relationship.trust}</strong></header>
          <blockquote>“{selected.voice}”</blockquote>
          <div className="corporate-thresholds"><span className={relationship.trust >= 6 ? 'is-past' : ''}>CONTATO</span><span className={relationship.trust >= 38 ? 'is-past' : ''}>PARCERIA</span><span className={relationship.trust >= 58 ? 'is-past' : ''}>IP CONFIADA</span><span className={relationship.trust >= 72 ? 'is-past' : ''}>AQUISIÇÃO</span></div>
          <dl><div><dt>Status</dt><dd>{relationshipStatus(relationship)}</dd></div><div><dt>Projetos aprovados</dt><dd>{relationship.completed}</dd></div><div><dt>Falhas</dt><dd>{relationship.failed}</dd></div><div><dt>Parceria</dt><dd>{partnership ? `até ${partnership.expiresYear}` : 'nenhuma'}</dd></div></dl>
          <section className="corporate-actions"><div>{!eligibility.allowed && !partnership ? eligibility.reasons.map(reason => <small key={reason}>— {reason}</small>) : <small>{partnership ? `Alcance extra de ${Math.round(partnership.reach * 100)}% em novos projetos.` : 'A empresa já aceita discutir preferência e distribuição.'}</small>}</div><Button size="small" onClick={() => dispatch({ type: 'PITCH_COMPANY', companyId: selected.id })} disabled={!canPitch}>{canPitch ? 'ENVIAR PORTFÓLIO' : 'PORTFÓLIO EM ESPERA'}</Button>{!partnership && <Button size="small" variant="primary" onClick={() => dispatch({ type: 'REQUEST_PARTNERSHIP', companyId: selected.id })} disabled={!eligibility.allowed}>PROPOR PARCERIA</Button>}</section>
        </article>
      </div>
    </section>
  )
}

function OfferLetter({ state, offer, dispatch }) {
  const company = corporatePartnerById(offer.companyId)
  return <article className="corporate-offer-letter"><span>{offer.type === 'commission' ? `${offer.concept?.toUpperCase()} · RESPONDER EM ${offer.monthsLeft} MESES` : `PARCERIA · ${offer.termYears} ANOS`}</span><h4>{offerTitle(state, offer)}</h4>{offer.type === 'commission' ? <p>{offer.genre.toUpperCase()} · meta {offer.scoreFloor} · prazo {offer.deadlineMonths} meses · liberdade {Math.round(offer.creativeFreedom)}%{offer.offbeat ? ' · fora do gênero habitual' : ''}</p> : <p>{formatMoney(offer.funding)} de verba · +{Math.round(offer.reach * 100)}% de alcance {offer.exclusivity ? '· preferência de 1 projeto' : '· sem exclusividade'}</p>}<footer><small>{company.voice}</small><Button size="small" onClick={() => dispatch({ type: 'RESPOND_CORPORATE_OFFER', offerId: offer.id, response: 'reject' })}>RECUSAR</Button><Button size="small" variant="primary" disabled={offer.type === 'commission' && Boolean(state.currentProject || state.currentContract || state.corporate.activeCommission)} onClick={() => dispatch({ type: 'RESPOND_CORPORATE_OFFER', offerId: offer.id, response: 'accept' })}>{offer.type === 'commission' && state.currentProject ? 'TERMINE O JOGO ATUAL' : 'ASSINAR'}</Button></footer></article>
}

function AcquisitionLetter({ state, offer, dispatch }) {
  const company = corporatePartnerById(offer.companyId)
  return <section className="acquisition-letter"><div><span>PROPOSTA DE CONTROLE · {offer.monthsLeft} MESES</span><h4>{company.name} colocou um número na mesa.</h4><p>O jogo continua depois da venda. O que muda é quem banca, quem recebe e quanta liberdade sobra.</p></div><strong>{formatMoney(offer.price)}</strong><dl><div><dt>Autonomia inicial</dt><dd>{offer.autonomy}%</dd></div><div><dt>Marca do estúdio</dt><dd>{offer.retainedBrand ? 'preservada' : 'sob revisão'}</dd></div><div><dt>Parcela por metas</dt><dd>{formatMoney(offer.earnout)}</dd></div></dl><footer><Button onClick={() => dispatch({ type: 'RESPOND_CORPORATE_OFFER', offerId: offer.id, response: 'reject' })}>CONTINUAR INDEPENDENTE</Button><Button onClick={() => dispatch({ type: 'RESPOND_CORPORATE_OFFER', offerId: offer.id, response: 'counter' })}>FAZER CONTRAPROPOSTA</Button><Button variant="primary" onClick={() => dispatch({ type: 'RESPOND_CORPORATE_OFFER', offerId: offer.id, response: 'accept' })}>VENDER CONTROLE</Button></footer></section>
}
