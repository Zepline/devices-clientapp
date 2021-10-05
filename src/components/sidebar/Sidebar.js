import { Component } from "react";
import logo from '../../imgs/logo.png';

class Sidebar extends Component {

    render() {

        return (

            <div className = "sidebar-container"> 
                <img className="sidebar-icon-img" src={logo} alt="" />
            </div>
        )
    }
}

export default Sidebar