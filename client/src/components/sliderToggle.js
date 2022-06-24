import { useState, useEffect } from "react";

const SliderToggle = (props) => {
    const [selection, setSelection] = useState({ [props.name]: props.active })

    const slide = (e) => {
        setSelection({ [props.name]: e.target.name })
    }

    useEffect(() => {
        props.sendSelection(selection)
    }, [selection])

    return <div className="slider">
        {props.names.map(name =>
            <span key={name} id={name} className={selection[props.name] === name ? 'selected' : 'option'}>
                <button className='clickable' name={name} onClick={slide}>{name}</button>
            </span>
        )}
    </div>
}
export default SliderToggle;