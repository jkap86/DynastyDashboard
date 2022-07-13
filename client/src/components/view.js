import { useEffect, useState } from "react";
import axios from "axios";
import SliderToggle from './sliderToggle';
import PlayerInfo from "./playerInfo";
import Leagues from "./leagues";
import PlayerShares from "./playerShares";
import Leaguemates from "./leaguemates";
import Transactions from "./transactions";
import emoji from '../emoji.png';
import allPlayers from '../allPlayers.json';
import { getOptimalProjection } from './optimalProjection';

const View = (props) => {
    const [state, setState] = useState({})
    const [isLoading_L, setIsLoading_L] = useState(false)
    const [isLoading_T, setIsLoading_T] = useState(false)
    const [activeTab, setActiveTab] = useState("Player Info");
    const [filters, setFilters] = useState({ r_d: "All", b_s: "All" });
    const [user, setUser] = useState({});
    const [projections, setProjections] = useState([])
    const [projections_weekly, setProjections_weekly] = useState([])
    const [dv, setDv] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [players, setPlayers] = useState([])
    const [transactions, setTransactions] = useState([])
    const [group_age, setGroup_age] = useState('Total')
    const [group_rank, setGroup_rank] = useState('Optimal')
    const [group_value, setGroup_value] = useState('Total')


    const findOccurrences = (players) => {
        const ps = []
        players.forEach(p => {
            const index = ps.findIndex(obj => {
                return obj.id === p.id
            })
            if (index === -1) {
                ps.push({
                    id: p.id,
                    position: p.id === '0' || allPlayers[p.id] === undefined ? null : ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[p.id].position) ? allPlayers[p.id].position : 'Other',
                    type: p.id === '0' || allPlayers[p.id] === undefined ? null : allPlayers[p.id].years_exp === 0 ? 'R' : 'V',
                    count: 1,
                    leagues: [p.league],
                    wins: p.wins,
                    losses: p.losses,
                    ties: p.ties,
                    fpts: p.fpts,
                    fpts_against: p.fpts_against,
                    isLeaguesHidden: true,
                    isPlayerHidden: false
                })
            } else {
                ps[index].count++
                if (!ps[index].leagues.includes(p.league)) {
                    ps[index].leagues.push(p.league)
                }
                ps[index].wins = ps[index].wins + p.wins
                ps[index].losses = ps[index].losses + p.losses
                ps[index].ties = ps[index].ties + p.ties
                ps[index].fpts = ps[index].fpts + p.fpts
                ps[index].fpts_against = ps[index].fpts_against + p.fpts_against
            }
        })
        return ps
    }

    const getPlayerShares = (players_owned, players_taken) => {
        const po = findOccurrences(players_owned)
        const pt = findOccurrences(players_taken)
        let ap = Object.keys(allPlayers).filter(x => allPlayers[x].status === 'Active').map(player => {
            const match_owned = po.find(x => x.id === player)
            const leagues_owned = match_owned === undefined ? [] : match_owned.leagues
            const match_taken = pt.find(x => x.id === player)
            const leagues_taken = match_taken === undefined ? [] : match_taken.leagues
            const leagues_available = leagues.filter(x => leagues_owned.find(y => y.league_id === x.league_id) === undefined &&
                leagues_taken.find(y => y.league_id === x.league_id) === undefined)
            return {
                id: player,
                position: ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[player].position) ? allPlayers[player].position : 'Other',
                type: allPlayers[player].years_exp === 0 ? 'R' : 'V',
                leagues_owned: leagues_owned,
                leagues_taken: leagues_taken,
                leagues_available: leagues_available,
                count: match_owned === undefined ? 0 : match_owned.count,
                wins: match_owned === undefined ? 0 : match_owned.wins,
                losses: match_owned === undefined ? 0 : match_owned.losses,
                ties: match_owned === undefined ? 0 : match_owned.ties,
                fpts: match_owned === undefined ? 0 : match_owned.fpts,
                fpts_against: match_owned === undefined ? 0 : match_owned.fpts_against,
                isPlayerHidden: false,
                isLeaguesHidden: true,
            }
        })
        return ap
    }

    const fetchData = async () => {
        setIsLoading_L(true)
        setIsLoading_T(true)
        const l = await axios.get('/leagues', {
            params: {
                username: props.user.username
            }
        })
        const l_updated = l.data.leagues.map(league => {
            const match = leagues.find(x => league.league_id === x.league_id)
            return {
                ...league,
                isLeagueTypeHidden: match ? match.isLeagueTypeHidden : false
            }
        })
        setLeagues(l_updated)
        setState(l.data.state)
        setIsLoading_L(false)
        const t = await axios.get('/transactions', {
            params: {
                username: props.user.username
            }
        })
        setTransactions(t.data)
        setIsLoading_T(false)
    }

    useEffect(() => {
        let playersOwned = leagues.filter(x => x.isLeagueTypeHidden === false).map(league => {
            return league.rosters.filter(x => x.players !== null && x.owner_id === props.user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: league,
                        wins: league.record.wins,
                        losses: league.record.losses,
                        ties: league.record.ties,
                        fpts: league.fpts,
                        fpts_against: league.fpts_against
                    }
                })
            })
        }).flat(2)
        let playersTaken = leagues.filter(x => x.isLeagueTypeHidden === false).map(league => {
            return league.rosters.filter(x => x.players !== null && x.owner_id !== props.user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: league,
                        wins: league.record.wins,
                        losses: league.record.losses,
                        ties: league.record.ties,
                        fpts: league.fpts,
                        fpts_against: league.fpts_against
                    }
                })
            })
        }).flat(2)
        const p = getPlayerShares(playersOwned, playersTaken)
        setPlayers(p.filter(x => x.leagues_owned.length + x.leagues_taken.length > 0).sort((a, b) => b.count - a.count))
    }, [props.user, leagues, filters])

    useEffect(() => {
        setUser(props.user)

        fetchData()
    }, [props.user])

    const getSelection = (data) => {
        const key = Object.keys(data)[0];
        let f = { ...filters, [key]: data[key] };
        setFilters(f);
        let l = leagues;
        l.map((league) => {
            league.isLeagueTypeHidden = true;
            if (f.rd === "All" && f.b_s === "All") {
                league.isLeagueTypeHidden = false;
            } else if (
                (f.r_d === league.dynasty || f.r_d === "All") &&
                (f.b_s === league.bestball || f.b_s === "All")
            ) {
                league.isLeagueTypeHidden = false;
            }
        });
        setLeagues([...l]);
    }

    const matchPlayer_DV = (player) => {
        if (player === '0') {
            return 0
        } else {
            const match = dv.find(x => x.id === player)
            if (match) {
                return match.updated_value
            } else {
                return 0
            }
        }
    }

    const matchPlayer_Proj = (player) => {
        if (player === '0') {
            return 0
        } else {
            const match = projections.find(x => x.id === player)
            if (match) {
                return match.updated_value
            } else {
                return 0
            }
        }
    }

    const matchPlayer_Proj_W = (player) => {
        if (player === '0') {
            return 0
        } else {
            const match = projections_weekly.find(x => x.id === player)
            if (match) {
                return match.updated_value
            } else {
                return 0
            }
        }
    }

    const matchPick = (season, round) => {
        let value = dv.find(x => `${season}mid${round}` === x.searchName.slice(0, 8))
        value = value === undefined ? 0 : value.value
        return value
    }

    const getAge = (roster) => {
        let a;
        let length;
        if (roster.players !== null) {
            switch (group_age) {
                case 'Total':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Starters':
                    a = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    a = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'QB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'RB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'WR').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'TE').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'FLEX':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                default:
                    break;
            }
        } else {
            length = 0
        }
        return length === 0 ? '-' : (a / length).toFixed(1)
    }

    const getRank = (league, roster) => {
        let p;
        if (roster ? roster.players !== null : league.userRoster.players !== null) {
            let standings = league.rosters.map(roster => {
                if (roster.players !== null) {
                    let proj;
                    switch (group_rank) {
                        case 'Total':
                            proj = roster.players.reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'Starters':
                            proj = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'Bench':
                            proj = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'QB':
                            proj = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'RB':
                            proj = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'WR':
                            proj = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'TE':
                            proj = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case 'FLEX':
                            proj = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                            break;
                        case `Week ${state.week}`:
                            proj = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj_W(cur)), 0)
                            break;
                        case 'Optimal':
                            proj = getOptimalProjection(league.roster_positions, roster.players, { matchPlayer_Proj })
                            break;
                    }
                    return {
                        ...roster,
                        proj: proj
                    }
                } else {
                    p = '-'
                }
            }).sort((a, b) => b.proj - a.proj)
            p = standings.findIndex(obj => {
                return obj.roster_id === league.userRoster.roster_id
            }) + 1
        } else {
            p = '-'
        }
        return `${p} / ${league.rosters.length}`
    }

    const getValue = (roster) => {
        let v;
        if (roster.players !== null) {
            switch (group_value) {
                case 'Total':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0) +
                        roster.draft_picks.reduce((acc, cur) => acc + parseInt(matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Roster':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Picks':
                    v = roster.draft_picks.reduce((acc, cur) => acc + parseInt(matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Starters':
                    v = roster.starters.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    v = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    v = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    v = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    v = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    v = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'FLEX':
                    v = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                default:
                    v = 0
                    break;
            }
        } else {
            v = 0
        }
        return v
    }

    const getProj = (roster, league) => {
        let p;
        if (roster.players !== null && league.roster_positions !== undefined) {
            switch (group_rank) {
                case 'Total':
                    p = roster.players.reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'Starters':
                    p = roster.starters.reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'Bench':
                    p = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'QB':
                    p = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'RB':
                    p = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'WR':
                    p = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'TE':
                    p = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case 'FLEX':
                    p = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj(cur)), 0)
                    break;
                case `Week ${state.week}`:
                    p = roster.starters.reduce((acc, cur) => acc + parseFloat(matchPlayer_Proj_W(cur)), 0)
                    break;
                case 'Optimal':
                    p = getOptimalProjection(league.roster_positions, roster.players, { matchPlayer_Proj })
                    break;
                default:
                    p = 0
            }
        } else {
            p = 0
        }
        return p
    }

    return <>
        <button
            onClick={() => props.sendHome(true)}
            className="link clickable">
            Home
        </button>
        {
            isLoading_L || isLoading_T ? null :
                <button
                    onClick={() => fetchData()}
                    className="clickable refresh"
                >
                    Refresh
                </button>
        }
        <button
            onClick={() => setActiveTab('Player Info')}
            className={activeTab === 'Player Info' ? 'right active clickable' : 'right clickable'}>
            Player Projections/Values
        </button>

        <h2>
            <div className="image_container">
                <img
                    style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite ease-out` }}
                    className="thumbnail faded"
                    alt="avatar"
                    src={user.avatar === null ? emoji : `https://sleepercdn.com/avatars/${user.avatar}`}
                />
                <p className="image">{user.display_name}</p>
            </div>
        </h2>
        <h2>
            {isLoading_L ? null :
                `${state.season} ${state.week === 0 ? 'Preseason' : `Week ${state.week}`}`
            }
        </h2>
        <div className="nav_container">
            <button
                onClick={() => setActiveTab('Leagues')}
                className={activeTab === 'Leagues' ? 'active nav clickable' : 'nav clickable'}
            >
                Leagues
            </button>
            <button
                onClick={() => setActiveTab('Players')}
                className={activeTab === 'Players' ? 'active nav clickable' : 'nav clickable'}
            >
                Players
            </button>
            <button
                onClick={() => setActiveTab('Leaguemates')}
                className={activeTab === 'Leaguemates' ? 'active nav clickable' : 'nav clickable'}
            >
                Leaguemates
            </button>
            <button
                onClick={() => setActiveTab('Transactions')}
                className={activeTab === 'Transactions' ? 'active nav clickable' : 'nav clickable'}
            >
                Transactions
            </button>
        </div>
        <div className="slidercontainer">
            <SliderToggle
                sendSelection={getSelection}
                className="slidertoggle"
                name="r_d"
                names={["Redraft", "All", "Dynasty"]}
                active="All"
            />
            <SliderToggle
                sendSelection={getSelection}
                className="slidertoggle"
                name="b_s"
                names={["BestBall", "All", "Standard"]}
                active="All"
            />
        </div>

        <div hidden={activeTab === 'Player Info' ? false : true}>
            <PlayerInfo
                sendProjections={(data) => setProjections(data)}
                sendDV={(data) => setDv(data)}
                sendProjections_weekly={(data) => setProjections_weekly(data)}
            />
        </div>

        {activeTab === 'Leagues' ?
            isLoading_L ? <h1>Loading...</h1> :
                <Leagues
                    leagues={leagues.filter(x => x.isLeagueTypeHidden === false)}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPick={matchPick}
                    matchPlayer_Proj={matchPlayer_Proj}
                    matchPlayer_Proj_W={matchPlayer_Proj_W}
                    getAge={getAge}
                    getRank={getRank}
                    getValue={getValue}
                    getProj={getProj}
                    group_age={group_age}
                    group_rank={group_rank}
                    group_value={group_value}
                    state={state}
                    sendGroupAge={(data) => setGroup_age(data)}
                    sendGroupRank={(data) => setGroup_rank(data)}
                    sendGroupValue={(data) => setGroup_value(data)}
                />
            : null
        }

        {activeTab === 'Players' ?
            isLoading_L ? <h1>Loading...</h1> :
                <PlayerShares
                    leagues={leagues.filter(x => x.isLeagueTypeHidden === false)}
                    user={user}
                    getAge={getAge}
                    getRank={getRank}
                    getValue={getValue}
                    group_age={group_age}
                    group_rank={group_rank}
                    group_value={group_value}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPlayer_Proj={matchPlayer_Proj}
                    matchPlayer_Proj_W={matchPlayer_Proj_W}
                    matchPick={matchPick}
                    state={state}
                    sendGroupAge={(data) => setGroup_age(data)}
                    sendGroupRank={(data) => setGroup_rank(data)}
                    sendGroupValue={(data) => setGroup_value(data)}
                    findOccurrences={findOccurrences}
                    players={players}
                />
            : null
        }

        {activeTab === 'Leaguemates' ?
            isLoading_L ? <h1>Loading...</h1> :
                <Leaguemates
                    leagues={leagues.filter((x) => x.isLeagueTypeHidden === false)}
                    user={user}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPlayer_Proj={matchPlayer_Proj}
                    matchPlayer_Proj_W={matchPlayer_Proj_W}
                    matchPick={matchPick}
                    state={state}
                />
            : null
        }

        {activeTab === 'Transactions' ?
            isLoading_T ? <h1>Loading...</h1> :
                <Transactions
                    transactions={transactions.filter(x => leagues.find(y => y.league_id === x.league_id) !== undefined &&
                        leagues.find(y => y.league_id === x.league_id).isLeagueTypeHidden === false)}
                    user={user}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPick={matchPick}
                    matchPlayer_Proj={matchPlayer_Proj}
                    matchPlayer_Proj_W={matchPlayer_Proj_W}
                    state={state}
                />
            : null
        }
    </>
}
export default View;