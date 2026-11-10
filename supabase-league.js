
(function () {
  const cfg = window.GRAND_SLAM_SUPABASE;
  const root = cfg.url.replace(/\/$/, '') + '/rest/v1/';

  async function get(table) {
    const r = await fetch(root + table + '?select=*', {
      headers: {
        apikey: cfg.publishableKey,
        Authorization: 'Bearer ' + cfg.publishableKey
      },
      cache: 'no-store'
    });
    if (!r.ok) throw Error('Database request failed: ' + table);
    return r.json();
  }

  window.loadGrandSlamLeague = async function () {
    const [players, teams, picks, stats] = await Promise.all([
      get('players'),
      get('teams'),
      get('team_picks'),
      get('player_stats')
    ]);

    const names = new Map(players.map(p => [p.id, p.name]));
    const playerStats = {};

    for (const p of players) {
      const s = stats.find(x => x.player_id === p.id);
      if (!s) continue;

      playerStats[p.name] = {
        groupWins: s.group_wins,
        oneEighties: s.maximums,
        tonPlusCheckouts: s.checkouts_100,
        hundredPlusAverages: s.averages_100,
        stageBonus:
          s.last_16 * 5 +
          s.quarter_final * 10 +
          s.semi_final * 15 +
          s.finalist * 20 +
          s.champion * 30
      };
    }

    return {
      updated: new Date().toLocaleString('en-GB') + ' (last checked)',
      playerStats,
      teams: teams.filter(t => t.published).map(t => {
        const chosen = picks.filter(p => p.team_id === t.id);
        return {
          name: t.name,
          manager: '',
          picks: chosen.map(p => names.get(p.player_id)).filter(Boolean),
          captain: names.get(chosen.find(p => p.is_captain)?.player_id)
        };
      })
    };
  };
})();
