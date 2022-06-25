import React, { useState, useEffect } from "react";
import Search from "./search";
import emoji from '../emoji.png';
import LeaguemateLeagues from "./leaguemateLeagues";

const Leaguemates = (props) => {
    const [leaguemates, setLeaguemates] = useState([])
    const [page, SetPage] = useState(1)

    useEffect(() => {
        const getLeaguemates = (leagues) => {
            let leaguemates = leagues.map(league => {
                return league.rosters.map(roster => {
                    return {
                        ...roster,
                        index: league.index,
                        league: league,
                        wins: roster.wins,
                        losses: roster.losses,
                        ties: roster.ties,
                        user_wins: league.record.wins,
                        user_losses: league.record.losses,
                        user_ties: league.record.ties,
                        avatar: roster.avatar
                    }
                })
            }).flat()

            const lmOccurrences = []
            leaguemates.forEach(lm => {
                const index = lmOccurrences.findIndex(obj => {
                    return obj.id === lm.owner_id
                })
                if (index === -1) {
                    lmOccurrences.push({
                        id: lm.owner_id,
                        avatar: lm.avatar,
                        user_avatar: lm.user_avatar,
                        username: lm.username,
                        count: 1,
                        leagues: [lm.league],
                        user_wins: lm.user_wins,
                        user_losses: lm.user_losses,
                        user_ties: lm.user_ties,
                        wins: lm.wins,
                        losses: lm.losses,
                        ties: lm.ties,
                        fpts: lm.fpts,
                        fpts_against: lm.fpts_against,
                        isLeaguemateHidden: false,
                        isLeaguesHidden: true
                    })
                } else {
                    lmOccurrences[index].count++
                    lmOccurrences[index].leagues.push(lm.league)
                    lmOccurrences[index].user_wins = lmOccurrences[index].user_wins + lm.user_wins
                    lmOccurrences[index].user_losses = lmOccurrences[index].user_losses + lm.user_losses
                    lmOccurrences[index].user_ties = lmOccurrences[index].user_ties + lm.user_ties
                    lmOccurrences[index].wins = lmOccurrences[index].wins + lm.wins
                    lmOccurrences[index].losses = lmOccurrences[index].losses + lm.losses
                    lmOccurrences[index].ties = lmOccurrences[index].ties + lm.ties
                    lmOccurrences[index].fpts = lmOccurrences[index].fpts + lm.fpts
                    lmOccurrences[index].fpts_against = lmOccurrences[index].fpts_against + lm.fpts_against
                }
            })
            return lmOccurrences
        }
        const l = getLeaguemates(props.leagues)
        setLeaguemates(l.sort((a, b) => b.count - a.count))
    }, [props.leagues])

    const getSearched = (leaguemate_username) => {
        let l = leaguemates
        if (leaguemate_username) {
            l.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = true
            })
            l.filter(x => x.username === leaguemate_username).map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        } else {
            l.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        }
        SetPage(1)
        setLeaguemates([...l])
    }

    const showLeagues = (leaguemate) => {
        let l = leaguemates
        l.filter(x => x.username === leaguemate).map(leaguemate => {
            return leaguemate.isLeaguesHidden = !leaguemate.isLeaguesHidden
        })
        setLeaguemates([...l])
    }

    return <>
        <div className="search_wrapper">
            <Search
                placeholder="Search Leaguemates"
                list={leaguemates.map(leaguemate => leaguemate.username)}
                sendSearched={getSearched}
                value={''}
            />
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(leaguemates.filter(x => x.isLeaguemateHidden === false).length / 50)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => SetPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <div className="view_scrollable">
            <table className="main">
                <tbody className="fade_in sticky">
                    <tr>
                        <th colSpan={3}></th>
                        <th colSpan={2}>Leaguemate</th>
                        <th colSpan={2}>{props.user.display_name}</th>
                    </tr>
                    <tr>
                        <th colSpan={2}>Leaguemate</th>
                        <th>Count</th>
                        <th>Record</th>
                        <th>PF - PA</th>
                        <th>Record</th>
                        <th>PF - PA</th>
                    </tr>
                </tbody>
                <tbody className="slide_up">
                    {leaguemates.filter(x => x.isLeaguemateHidden === false).sort((a, b) => b.count - a.count).slice((page - 1) * 50, ((page - 1) * 50) + 50).map((leaguemate, index) =>
                        <React.Fragment key={index}>
                            <tr onClick={() => showLeagues(leaguemate.username)} className={leaguemate.isLeaguesHidden ? 'hover clickable' : 'hover clickable active'}>
                                <td>
                                    <img
                                        style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite linear` }}
                                        className="thumbnail"
                                        alt="avatar"
                                        src={leaguemate.avatar === null ? emoji : `https://sleepercdn.com/avatars/${leaguemate.avatar}`}
                                    />
                                </td>
                                <td className="left">{leaguemate.username}</td>
                                <td>{leaguemate.count}</td>
                                <td>
                                    {leaguemate.wins}-{leaguemate.losses}{leaguemate.ties === 0 ? null : `-${leaguemate.ties}`} {leaguemate.wins + leaguemate.losses === 0 ? null :
                                        <em>{(leaguemate.wins / (leaguemate.wins + leaguemate.losses)).toFixed(4)}</em>
                                    }
                                </td>
                                <td>{leaguemate.fpts} - {leaguemate.fpts_against}</td>
                                <td>
                                    {leaguemate.user_wins}-{leaguemate.user_losses}{leaguemate.user_ties === 0 ? null : `-${leaguemate.user_ties}`} {leaguemate.user_wins + leaguemate.user_losses + leaguemate.user_losses === 0 ? null :
                                        <em>{(leaguemate.user_wins / (leaguemate.user_wins + leaguemate.user_losses + leaguemate.user_ties)).toFixed(4)}</em>
                                    }
                                </td>
                                <td>{leaguemate.fpts} - {leaguemate.fpts_against}</td>
                            </tr>
                            {leaguemate.isLeaguesHidden ? null :
                                <tr>
                                    <td colSpan={7}>
                                        <LeaguemateLeagues
                                            leaguemate={leaguemate}
                                            user={props.user}
                                            matchPlayer_DV={props.matchPlayer_DV}
                                            matchPlayer_Proj={props.matchPlayer_Proj}
                                            matchPick={props.matchPick}
                                        />
                                    </td>
                                </tr>
                            }
                        </React.Fragment>
                    )}
                </tbody>
            </table>
        </div>
    </>
}
export default Leaguemates;