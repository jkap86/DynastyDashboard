import React, { useEffect, useState } from "react";
import allPlayers from '../allPlayers.json';
import Search from "./search";
import emoji from '../emoji.png';
import Roster from './roster';
import TransactionLeague from "./transactionLeague";

const Transactions = (props) => {
    const [manager1, setManager1] = useState('')
    const [manager2, setManager2] = useState('')
    const [player, setPlayer] = useState('')
    const [transactions, setTransactions] = useState([])
    const [page, SetPage] = useState(1)
    const [filters, setFilters] = useState({ types: [] })

    useEffect(() => {
        setTransactions(props.transactions.sort((a, b) => b.status_updated - a.status_updated))
    }, [props.transactions])

    const getSearched = (data, type) => {
        let t = transactions
        if (type === 'M') {
            if (list_managers.includes(data)) {
                t.map(trans => {
                    return trans.isTransactionHidden = true
                })
                t.filter(x => x.users.find(y => y.username === data) !== undefined).map(trans => {
                    return trans.isTransactionHidden = false
                })
                if (player !== '') {
                    t.filter(x => x.isTransactionHidden === false &&
                        (x.adds === null || Object.keys(x.adds).find(y => allPlayers[y].full_name === player) === undefined) &&
                        (x.drops === null || Object.keys(x.drops).find(y => allPlayers[y].full_name === player) === undefined)
                    ).map(trans => {
                        return trans.isTransactionHidden = true
                    })
                }
            } else {
                if (player !== '') {
                    t.map(trans => {
                        return trans.isTransactionHidden = true
                    })
                    t.filter(x =>
                        (x.adds !== null && Object.keys(x.adds).find(y => allPlayers[y].full_name === player) !== undefined) ||
                        (x.drops !== null && Object.keys(x.drops).find(y => allPlayers[y].full_name === player) !== undefined)
                    ).map(trans => {
                        return trans.isTransactionHidden = false
                    })
                } else {
                    t.map(trans => {
                        return trans.isTransactionHidden = false
                    })
                }
            }
            setManager1(data)
        } else if (type === 'P') {
            if (list_players.includes(data)) {
                t.map(trans => {
                    return trans.isTransactionHidden = true
                })
                t.filter(x =>
                    (x.adds !== null && Object.keys(x.adds).find(y => allPlayers[y].full_name === data) !== undefined) ||
                    (x.drops !== null && Object.keys(x.drops).find(y => allPlayers[y].full_name === data) !== undefined)
                ).map(trans => {
                    return trans.isTransactionHidden = false
                })

                if (manager1 !== '') {
                    t.filter(x => x.isTransactionHidden === false &&
                        x.users.find(y => y.username === manager1) === undefined
                    ).map(trans => {
                        return trans.isTransactionHidden = true
                    })
                    if (manager2 !== '') {
                        t.filter(x => x.isTransactionHidden === false &&
                            x.users.find(y => y.username === manager2) === undefined
                        ).map(trans => {
                            return trans.isTransactionHidden = true
                        })
                    }
                }
            } else {
                t.map(trans => {
                    return trans.isTransactionHidden = false
                })
                if (manager1 !== '') {
                    t.filter(x => x.users.find(y => y.username === manager1) === undefined).map(trans => {
                        return trans.isTransactionHidden = true
                    })
                    if (manager2 !== '') {
                        t.filter(x => x.users.find(y => y.username === manager2) === undefined).map(trans => {
                            return trans.isTransactionHidden = true
                        })
                    }
                } else {
                    t.map(trans => {
                        return trans.isTransactionHidden = false
                    })
                }
            }
            setPlayer(data)
        } else if (type === 'M2') {
            if (list_managers.includes(data)) {
                t.filter(x => x.isTransactionHidden === false &&
                    x.users.find(y => y.username === data) === undefined
                ).map(trans => {
                    return trans.isTransactionHidden = true
                })
            } else {
                t.filter(x => x.users.find(y => y.username === manager1) !== undefined).map(trans => {
                    return trans.isTransactionHidden = false
                })
                if (player !== '') {
                    t.filter(x => x.isTransactionHidden === false &&
                        (x.adds === null || Object.keys(x.adds).find(y => allPlayers[y].full_name === player) === undefined) &&
                        (x.drops === null || Object.keys(x.drops).find(y => allPlayers[y].full_name === player) === undefined)
                    ).map(trans => {
                        return trans.isTransactionHidden = true
                    })
                }
            }
            setManager2(data)
        }
        SetPage(1)
        setTransactions([...t])
    }

    const filterType = (e, type) => {
        let f = filters.types
        if (e.target.checked) {
            const index = f.indexOf(type)
            f.splice(index, 1)
        } else {
            f.push(type)
        }
        setFilters({ ...filters, types: [...f] })
    }

    let list_managers = transactions.filter(x => x.isTransactionHidden === false).map(transaction => {
        return transaction.users.map(user => {
            return user.username
        })
    }).flat(2)

    list_managers = Array.from(new Set(list_managers))

    let adds = transactions.filter(x => x.isTransactionHidden === false && x.adds !== null).map(transaction => {
        return Object.keys(transaction.adds).map(player => {
            return allPlayers[player].full_name
        })
    }).flat()

    let drops = transactions.filter(x => x.isTransactionHidden === false && x.drops !== null).map(transaction => {
        return Object.keys(transaction.drops).map(player => {
            return allPlayers[player].full_name
        })
    }).flat()

    let list_players = Array.from(new Set([...adds, ...drops].flat()))

    const showLeague = (transaction_id) => {
        let t = transactions
        t.filter(x => x.transaction_id === transaction_id).map(trans => {
            return trans.isLeagueHidden = !trans.isLeagueHidden
        })
        setTransactions([...t])
    }


    return <>
        <h2>{transactions.filter(x => x.isTransactionHidden === false && !filters.types.includes(x.type)).length.toLocaleString("en-US")} Transactions</h2>
        <div className="search_wrapper">
            <div className="checkboxes">
                <label className="script">
                    Free Agent
                    <input className="clickable" onChange={(e) => filterType(e, 'free_agent')} defaultChecked type="checkbox" />
                </label>
                <label className="script">
                    Waiver
                    <input className="clickable" onChange={(e) => filterType(e, 'waiver')} defaultChecked type="checkbox" />
                </label>
                <label className="script">
                    Trade
                    <input className="clickable" onChange={(e) => filterType(e, 'trade')} defaultChecked type="checkbox" />
                </label>
                <label className="script">
                    Commish
                    <input className="clickable" onChange={(e) => filterType(e, 'commissioner')} defaultChecked type="checkbox" />
                </label>
            </div>
            <Search
                list={list_managers}
                placeholder="Manager"
                sendSearched={(data) => getSearched(data, 'M')}
                value={props.user.display_name}
            />
            {!list_managers.includes(manager1) ? null :
                <Search
                    list={list_managers}
                    placeholder="Manager 2"
                    sendSearched={(data) => getSearched(data, 'M2')}
                    value={''}
                />
            }
            <Search
                list={list_players}
                placeholder="Players"
                sendSearched={(data) => getSearched(data, 'P')}
                value={''}
            />
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(transactions.filter(x => x.isTransactionHidden === false && !filters.types.includes(x.type)).length / 50)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => SetPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>

        <table className="main">
            <tbody className="fade_in">
                <tr>
                    <th colSpan={1}>Date</th>
                    <th colSpan={2}>League</th>
                    <th>Type</th>
                    <th colSpan={3}></th>
                </tr>
            </tbody>
            <tbody className="slide_up">
                {transactions.filter(x => x.isTransactionHidden === false && !filters.types.includes(x.type)).slice((page - 1) * 50, ((page - 1) * 50) + 50).map((transaction, index) =>
                    <React.Fragment key={index}>
                        <tr onClick={() => showLeague(transaction.transaction_id)} className={transaction.isLeagueHidden ? 'hover clickable' : 'hover active clickable'}>
                            <td colSpan={1}>{new Date(transaction.status_updated).toLocaleString()}</td>
                            <td colSpan={2}>
                                <div className="image_container">
                                    <img
                                        style={{
                                            animation: `rotation ${Math.random() * 10 + 2}s infinite ease-out`,
                                        }}
                                        className="thumbnail faded"
                                        alt="avatar"
                                        src={transaction.league_avatar === null ? emoji : `https://sleepercdn.com/avatars/${transaction.league_avatar}`}
                                    />
                                    <p className="image">{transaction.league_name}</p>
                                </div>
                            </td>
                            <td>{transaction.type.replace('_', ' ')}</td>
                            <td colSpan={3}>
                                <div className="transaction">
                                    {transaction.users.map((user, index) =>
                                        <div className="transaction_user" key={index}>
                                            <div className="image_container">
                                                <img
                                                    style={{
                                                        animation: `rotation ${Math.random() * 10 + 2}s infinite ease-out`,
                                                    }}
                                                    className="thumbnail faded"
                                                    alt="avatar"
                                                    src={user.avatar === null ? emoji : `https://sleepercdn.com/avatars/${user.avatar}`}
                                                />
                                                <p className="image">{user.username}</p>
                                            </div>
                                            {transaction.adds === null ? null : Object.keys(transaction.adds)
                                                .filter(x => transaction.adds[x] === user.roster_id).map((player, index) =>
                                                    <p className="green" key={index}>
                                                        + {allPlayers[player].full_name}
                                                    </p>
                                                )
                                            }
                                            {transaction.draft_picks.filter(x => x.owner_id === user.roster_id).map((pick, index) =>
                                                <p className="green" key={index}>
                                                    + {`${pick.season} Round ${pick.round} (${pick.original_username})`}
                                                </p>
                                            )}
                                            {transaction.drops === null ? null : Object.keys(transaction.drops)
                                                .filter(x => transaction.drops[x] === user.roster_id).map((player, index) =>
                                                    <p className="red" key={index}>
                                                        - {allPlayers[player].full_name}
                                                    </p>
                                                )
                                            }
                                            {transaction.draft_picks.filter(x => x.previous_owner_id === user.roster_id).map((pick, index) =>
                                                <p className="red" key={index}>
                                                    - {`${pick.season} Round ${pick.round} (${pick.original_username})`}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                        {transaction.isLeagueHidden ? null :
                            <tr>
                                <td colSpan={2} className="top">
                                    <TransactionLeague
                                        scoring_settings={transaction.scoring_settings}
                                    />
                                </td>
                                <td colSpan={5} className="top">
                                    {transaction.users.map(user =>
                                        <Roster
                                            roster={user.roster}
                                            matchPlayer_DV={props.matchPlayer_DV}
                                            matchPick={props.matchPick}
                                            matchPlayer_Proj={props.matchPlayer_Proj}
                                        />
                                    )}
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default Transactions;