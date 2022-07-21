import allPlayers from '../allPlayers.json';

export const getOptimalLineup = (roster_slots, players, { matchPlayer_Proj }) => {
    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }
    const starting_slots = roster_slots.filter(x => Object.keys(position_map).includes(x))
    let players_proj = players.map(player => {
        return {
            id: player,
            position: allPlayers[player].position,
            proj: parseFloat(matchPlayer_Proj(player))
        }
    })
    players_proj = players_proj.sort((a, b) => b.proj - a.proj)

    let projection = []
    starting_slots.map(slot => {
        const max = players_proj.filter(x => position_map[slot].includes(x.position)).reduce((acc, cur) => acc = acc.proj > cur.proj ? acc : cur, { id: null, position: null, proj: 0 })
        players_proj = players_proj.filter(x => x.id !== max.id)
        projection.push({
            slot: slot,
            proj: max.proj
        })

    })

    return projection
}
