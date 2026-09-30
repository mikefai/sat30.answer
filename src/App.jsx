import { useEffect, useMemo, useState } from 'react'
import { EXPLANATIONS, OFFICIAL_EXPLANATION_SOURCES } from './explanations.js'

const SECTION_ORDER = ['rw1', 'rw2', 'm1', 'm2']
const SECTION_LABELS = {
  rw1: 'Reading and Writing · Module 1',
  rw2: 'Reading and Writing · Module 2',
  m1: 'Math · Module 1',
  m2: 'Math · Module 2',
}

const Icon = ({ name }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></>,
    print: <><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z"/></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const sortQuestions = (questions) => [...questions].sort((a, b) => {
  const sectionDifference = SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section)
  if (sectionDifference) return sectionDifference
  if (a.test !== b.test) return a.test - b.test
  return a.originalNumber - b.originalNumber
})

function App() {
  const [questions, setQuestions] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [query, setQuery] = useState('')
  const [section, setSection] = useState('all')
  const [test, setTest] = useState('all')

  useEffect(() => {
    fetch('/questions/questions.json')
      .then((response) => {
        if (!response.ok) throw new Error('Question bank could not be loaded.')
        return response.json()
      })
      .then((data) => {
        setQuestions(sortQuestions(data))
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [])

  const positionById = useMemo(() => {
    const positions = {}
    SECTION_ORDER.forEach((sectionId) => {
      questions.filter((question) => question.section === sectionId).forEach((question, index) => {
        positions[question.id] = index + 1
      })
    })
    return positions
  }, [questions])

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return questions.filter((question) => {
      if (section !== 'all' && question.section !== section) return false
      if (test !== 'all' && question.test !== Number(test)) return false
      if (!normalizedQuery) return true
      const searchable = [
        question.id,
        `test ${question.test}`,
        `question ${question.originalNumber}`,
        question.subject,
        question.domain,
        SECTION_LABELS[question.section],
        question.answer,
      ].join(' ').toLowerCase()
      return searchable.includes(normalizedQuery)
    })
  }, [questions, query, section, test])

  if (loadState === 'loading') return <main className="answer-status"><div className="answer-loader"/><p>Preparing the answer key…</p></main>
  if (loadState === 'error') return <main className="answer-status"><h1>Answer key unavailable</h1><p>Run the content extraction script and reload this page.</p></main>

  return (
    <div className="answer-app">
      <header className="answer-hero">
        <nav className="answer-nav" aria-label="Answer review navigation">
          <a className="answer-brand" href="/">
            <span className="answer-brand-mark"><Icon name="book" /></span>
            <span>SAT Answer Review</span>
          </a>
          <div className="answer-nav-actions">
            <button type="button" className="quiet-button" onClick={() => window.print()}><Icon name="print" /> Print</button>
          </div>
        </nav>

        <div className="answer-hero-copy">
          <p className="eyebrow">Standalone answer review</p>
          <h1>Answer key, with the reasoning made visible.</h1>
          <p>Review all 108 hard selections from Practice Tests 9, 10, and 11. Each entry pairs the original question excerpt with its answer and a concise worked explanation.</p>
        </div>

        <div className="answer-metrics" aria-label="Answer key overview">
          <div><strong>108</strong><span>answers</span></div>
          <div><strong>4</strong><span>modules</span></div>
          <div><strong>3</strong><span>source tests</span></div>
          <div><strong>100%</strong><span>explained</span></div>
        </div>
      </header>

      <main className="answer-main">
        <section className="review-toolbar" aria-label="Filter answer key">
          <label className="search-field">
            <span className="sr-only">Search answer key</span>
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search test, question, skill, or answer" />
          </label>

          <div className="filter-row">
            <label>Module
              <select value={section} onChange={(event) => setSection(event.target.value)}>
                <option value="all">All four modules</option>
                {SECTION_ORDER.map((sectionId) => <option key={sectionId} value={sectionId}>{SECTION_LABELS[sectionId]}</option>)}
              </select>
            </label>
            <label>Source test
              <select value={test} onChange={(event) => setTest(event.target.value)}>
                <option value="all">Tests 9–11</option>
                <option value="9">Practice Test 9</option>
                <option value="10">Practice Test 10</option>
                <option value="11">Practice Test 11</option>
              </select>
            </label>
            <p className="result-count" aria-live="polite"><strong>{filteredQuestions.length}</strong> questions shown</p>
          </div>
        </section>

        {filteredQuestions.length ? (
          <section className="answer-grid" aria-label="Answer explanations">
            {filteredQuestions.map((question) => (
              <article className="answer-card" id={question.id} key={question.id}>
                <div className="card-heading">
                  <div>
                    <p className="card-kicker">{SECTION_LABELS[question.section]}</p>
                    <h2>Question {positionById[question.id]} <span>of 27</span></h2>
                  </div>
                  <div className="source-chip">Test {question.test} · Original Q{question.originalNumber}</div>
                </div>

                <div className="question-frame">
                  <img src={question.image} loading="lazy" alt={`Practice Test ${question.test}, ${SECTION_LABELS[question.section]}, original question ${question.originalNumber}`} />
                </div>

                <div className="answer-panel">
                  <div className="answer-key-line">
                    <span className="answer-check"><Icon name="check" /></span>
                    <div><span>Correct answer</span><strong>{question.answer}</strong></div>
                  </div>
                  <div className="reasoning-copy">
                    <p className="reasoning-label">Why it works</p>
                    <p>{EXPLANATIONS[question.id]}</p>
                  </div>
                </div>

                <footer className="card-footer">
                  <span>{question.domain}</span>
                  <a href={OFFICIAL_EXPLANATION_SOURCES[question.test]} target="_blank" rel="noreferrer">Official detailed explanations <Icon name="arrow" /></a>
                </footer>
              </article>
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <h2>No questions match those filters.</h2>
            <p>Clear the search or choose a broader module and source test.</p>
            <button type="button" onClick={() => { setQuery(''); setSection('all'); setTest('all') }}>Reset filters</button>
          </section>
        )}
      </main>

      <footer className="answer-footer">
        <p>Explanations are concise instructional summaries. Use the linked College Board PDFs for the complete official rationales.</p>
        <p>SAT is a registered trademark of College Board. This independent review page is not endorsed by College Board.</p>
      </footer>
    </div>
  )
}

export default App
