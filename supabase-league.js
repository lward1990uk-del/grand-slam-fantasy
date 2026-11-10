
(function () {
  'use strict';

  const cfg = window.GRAND_SLAM_SUPABASE;

  if (!cfg?.url || !cfg?.publishableKey) {
    console.error('Missing Supabase configuration');
    return;
  }

  const root = cfg.url.replace(/\/$/, '') + '/rest/v1/';

  async function get(table) {
    const r = await fetch(root + table + '?select=*', {
      headers: {
        apikey: cfg.publishableKey,
        Authorization: 'Bearer ' + cfg.publishableKey
      },
      cache: 'no-store'
    });

    if (!r.ok) {
      const error = await r.text();
      throw Error('Database request failed: ' + table + ' ' + error);
    }

    return r.json();
  }

  window.loadGrandSlamLeague = async function () {

    const [players, teams, picks, stats] = await Promise.all([
      get('players'),
      get('teams'),
      get('team_picks'),
      get('player_stats')
    ]);

    const names = new Map(
      players.map(p => [String(p.id), p.name])
    );

    const statsByPlayer = new Map(
      stats.map(s => [String(s.player_id), s])
    );

    const playerStats = {};

    function numeric(value) {
      if (value === null || value === undefined) {
        return 0;
      }

      if (value === true) return 1;
      if (value === false) return 0;

      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }

    for (const p of players) {
      const s = statsByPlayer.get(String(p.id));

      if (!s) continue;

      playerStats[p.name] = {
        groupWins: s.group_wins,
        oneEighties: s.maximums,
        tonPlusCheckouts: s.checkouts_100,
        hundredPlusAverages: s.averages_100,

        stageBonus:
          numeric(s.last_16) * 5 +
          numeric(s.quarter_final) * 10 +
          numeric(s.semi_final) * 15 +
          numeric(s.finalist) * 20 +
          numeric(s.champion) * 30
      };
    }

    const publishedTeams = teams
      .filter(t => t.published === true)
      .map(t => {

        const chosen = picks.filter(
          p => String(p.team_id) === String(t.id)
        );

        const captainPick = chosen.find(
          p => p.is_captain === true
        );

        return {
          id: t.id,

          name: t.name,

          manager: t.manager_name || 'Not specified',

          picks: chosen
            .map(p => names.get(String(p.player_id)))
            .filter(Boolean),

          captain: captainPick
            ? names.get(String(captainPick.player_id))
            : null
        };
      });

    return {
      updated: new Date().toLocaleString('en-GB') +
        ' (last checked)',

      playerStats,

      teams: publishedTeams
    };
  };
})();
