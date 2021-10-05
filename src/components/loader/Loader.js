import React from 'react';
import loadingSpinner from './loading-gif-two.gif';
import './Loader.css';

export default function Loader() {

    return (
        <div className="loading-screen">
            <div className="pulsate">Loading</div>
            <img className="loader" alt="" src={loadingSpinner} height={150} width={150} />
        </div>
    )

}