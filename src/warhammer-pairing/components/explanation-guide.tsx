import type { FunctionalComponent } from 'preact';

const GuideTournamentSection: FunctionalComponent = () => (
  <section className="guide-card">
    <h3>1. Tournament Purpose & Context</h3>
    <p>
      In international team tournaments like the{' '}
      <strong>World Team Championship (WTC)</strong> and{' '}
      <strong>European Team Championship (ETC)</strong> for Warhammer 40,000,
      two teams of 8 players face off across 8 separate tables.
    </p>
    <p>
      Each individual game uses a <strong>0–20 scoring system</strong> (summing
      to 20 total points between both players, where a 10–10 result represents a
      tie). A team match has a maximum of 160 total points, and victory goes to
      the team securing 81+ points. Because faction and army matchups vary
      dramatically in favorability,{' '}
      <strong>
        the draft pairing process is often the single most decisive strategic
        phase of the tournament.
      </strong>
    </p>
  </section>
);

const GuideRulesSection: FunctionalComponent = () => (
  <section className="guide-card">
    <h3>2. The 4-Round WTC Pairing Process</h3>
    <div className="guide-step">
      <strong>Step 1: Simultaneous Defender Selection</strong>
      <p>
        Both captains secretly choose 1 player from their remaining roster to be
        their &quot;Defender&quot; and reveal them simultaneously.
      </p>
    </div>
    <div className="guide-step">
      <strong>Step 2: Simultaneous Attacker Pair Nomination</strong>
      <p>
        Against the opponent&apos;s revealed Defender, each team secretly
        nominates 2 players as &quot;Attackers&quot; and reveals them
        simultaneously.
      </p>
    </div>
    <div className="guide-step">
      <strong>Step 3: Defender Matchup Choice</strong>
      <p>
        Each Defender secretly chooses which of the two offered enemy Attackers
        they will play against. The unchosen attacker is returned to the pool
        for future rounds.
      </p>
    </div>
    <div className="guide-step">
      <strong>Step 4: State Transition &amp; Automatic Round 4</strong>
      <p>
        In Rounds 1 and 2, the four paired players leave the draft, reducing
        pool size by 2 per side. In Round 3 (4 players remaining), each team
        fields 1 defender, offers 2 attackers, and holds 1 reserve player. The
        rejected attackers and held-back reserves are automatically paired in
        Round 4, locking in all 8 matches!
      </p>
    </div>
  </section>
);

const GuideMathSection: FunctionalComponent = () => (
  <section className="guide-card">
    <h3>3. Game Theory &amp; Algorithmic Solution</h3>
    <p>
      The draft is modeled as a{' '}
      <strong>
        finite, zero-sum extensive-form game of imperfect information
      </strong>{' '}
      (due to simultaneous hidden moves). It is solved exactly via{' '}
      <strong>backward induction</strong> combined with{' '}
      <strong>nested linear programming</strong> (HiGHS / Primal Simplex) to
      compute minimax Nash equilibria across all 5,685 reachable states:
    </p>
    <ul>
      <li>
        <strong>Nash Mixed Strategy:</strong> An unexploitable randomized
        probability distribution over players, ensuring the opponent cannot gain
        an edge by predicting choices.
      </li>
      <li>
        <strong>Pure-Maximin Recommendation:</strong> The single best
        deterministic move that guarantees the highest worst-case outcome.
      </li>
      <li>
        <strong>Exploitability Gap:</strong> The difference between the Nash
        mixed EV and the pure maximin guarantee (
        <code>Gap = V(Nash) - V(Pure)</code>). When this gap is small (&lt;0.5
        pts), playing deterministically carries virtually no risk.
      </li>
    </ul>
  </section>
);

const GuideUsageSection: FunctionalComponent = () => (
  <section className="guide-card">
    <h3>4. How to Use this Application</h3>
    <ul>
      <li>
        <strong>Spreadsheet Copy-Paste:</strong> In Google Sheets or Excel,
        select your 8×8 score matrix (with or without player names) and press{' '}
        <code>Ctrl+C</code>. On this page, simply press <code>Ctrl+V</code> or
        click <em>Paste from Spreadsheet</em>.
      </li>
      <li>
        <strong>Interactive Solution Analysis:</strong> View the overall game
        value, pure defender recommendation, mixed strategy weights, and optimal
        attacker pairs against every enemy defender.
      </li>
      <li>
        <strong>At-the-Table Draft Assistant:</strong> Use the live draft tab to
        track rounds step-by-step with real-time advice, locked-in points, and
        projected total score.
      </li>
    </ul>
  </section>
);

export const ExplanationGuide: FunctionalComponent = () => (
  <div className="explanation-guide-container">
    <div className="guide-hero">
      <h2>About Warhammer Pairing Solver</h2>
      <p>
        Optimal pairing-strategy solver for WTC/ETC-style 8v8 Warhammer team
        drafts using backward induction and nested linear programming.
      </p>
    </div>
    <div className="guide-grid">
      <GuideTournamentSection />
      <GuideRulesSection />
      <GuideMathSection />
      <GuideUsageSection />
    </div>
  </div>
);
