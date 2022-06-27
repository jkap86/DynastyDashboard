import { useEffect, useState } from "react";
import axios from "axios";
import SliderToggle from './sliderToggle';
import PlayerInfo from "./playerInfo";
import Leagues from "./leagues";
import PlayerShares from "./playerShares";
import Leaguemates from "./leaguemates";
import Transactions from "./transactions";
import emoji from '../emoji.png';

const View = (props) => {
    const [isLoading_L, setIsLoading_L] = useState(false)
    const [isLoading_T, setIsLoading_T] = useState(false)
    const [activeTab, setActiveTab] = useState("Player Info");
    const [filters, setFilters] = useState({ r_d: "All", b_s: "All" });
    const [user, setUser] = useState({});
    const [projections, setProjections] = useState([])
    const [dv, setDv] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [transactions, setTransactions] = useState([])


    useEffect(() => {
        setUser(props.user)
        const fetchData = async () => {
            setIsLoading_L(true)
            setIsLoading_T(true)
            const l = await axios.get('/leagues', {
                params: {
                    username: props.user.username
                }
            })
            setLeagues(l.data)
            setIsLoading_L(false)
            const t = await axios.get('/transactions', {
                params: {
                    username: props.user.username
                }
            })
            setTransactions(t.data)
            setIsLoading_T(false)
        }
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
                return match.updated_value.toFixed(1)
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

    return <>
        <button
            onClick={() => props.sendHome(true)}
            className="link clickable">
            Home
        </button>
        <button
            onClick={() => setActiveTab('Player Info')}
            className={activeTab === 'Player Info' ? 'right active' : 'right'}>
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
            />
        </div>

        {activeTab === 'Leagues' ?
            isLoading_L ? <h1>Loading...</h1> :
                <Leagues
                    leagues={leagues.filter(x => x.isLeagueTypeHidden === false)}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPick={matchPick}
                    matchPlayer_Proj={matchPlayer_Proj}
                />
            : null
        }

        {activeTab === 'Players' ?
            isLoading_L ? <h1>Loading...</h1> :
                <PlayerShares
                    leagues={leagues.filter(x => x.isLeagueTypeHidden === false)}
                    user={user}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPlayer_Proj={matchPlayer_Proj}
                    matchPick={matchPick}
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
                    matchPick={matchPick}
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
                />
            : null
        }
    </>
}
export default View;