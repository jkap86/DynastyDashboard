import { useState } from "react";
import axios from 'axios';
import View from "./view";

const Homepage = () => {
    const [user, setUser] = useState('')
    const [home, setHome] = useState(true)

    const getUser = async (e) => {
        const user = await axios.get('/user', {
            params: {
                username: e.target.value
            }
        })
        if (typeof (user.data) === 'object') {
            setUser(user.data)
        } else {
            setUser('')
        }
    }

    const reset = (data) => {
        setHome(true)
        setUser('')
    }

    return <>
        <h1>Dynasty Dashboard</h1>
        {home ?
            <div className="search_wrapper">
                <br />
                <input
                    className="home_search"
                    type="text"
                    placeholder="username"
                    onChange={getUser}
                />
                <br /><br />
                {
                    user === '' ? null :
                        <button onClick={() => setHome(false)} className="home clickable" type="submit">Submit</button>

                }
            </div>
            :
            <View
                user={user}
                sendHome={reset}
            />
        }
    </>
}
export default Homepage