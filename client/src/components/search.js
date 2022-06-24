import { useState, useEffect, useRef } from "react";

const Search = (props) => {
    const [searched, setSearched] = useState('')

    const handleClear = () => {
        setSearched('')
    }

    useEffect(() => {
        props.sendSearched(searched)

    }, [searched])

    return <>
        <form>
            <input onChange={(e) => setSearched(e.target.value)} id={props.id === undefined ? null : props.id} list={props.placeholder} placeholder={props.placeholder} type="text" />
            <datalist id={props.placeholder}>
                {props.list.sort((a, b) => a > b ? 1 : -1).map((i, index) =>
                    <option key={index}>{i}</option>
                )}
            </datalist>
            <input type="hidden" />
            <button onClick={handleClear} className="clickable" type="reset">Clear</button>
        </form>
    </>
}
export default Search;